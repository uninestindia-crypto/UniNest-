
'use client';

import { createContext, useContext, useEffect, useState, type ReactNode, useCallback } from 'react';
import type { User, SupabaseClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import type { Notification } from '@/lib/types';
import { getVendorSubscriptionState } from '@/lib/vendor/access';

type UserRole = 'student' | 'vendor' | 'co-admin' | 'admin' | 'guest';

type AuthContextType = {
  supabase: SupabaseClient;
  user: User | null;
  role: UserRole;
  vendorCategories: string[];
  vendorSubscriptionStatus: {
    isVendorActive: boolean;
    isTrialActive: boolean;
    hasActiveSubscription: boolean;
  };
  loading: boolean;
  signOut: () => Promise<void>;
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (notificationId: number) => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
  children: ReactNode;
};

const determineRole = (user: User | null): UserRole => {
    if (!user) {
        return 'guest';
    }
    return user.user_metadata?.role || 'student';
}

const getVendorCategories = (user: User | null): string[] => {
    if (!user || user.user_metadata?.role !== 'vendor') {
        return [];
    }
    return user.user_metadata?.vendor_categories || [];
}

export function AuthProvider({ children }: AuthProviderProps) {
  const router = useRouter();
  const [supabase] = useState(() => 
    createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  );
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<UserRole>('guest');
  const [vendorCategories, setVendorCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [vendorSubscriptionStatus, setVendorSubscriptionStatus] = useState({
    isVendorActive: false,
    isTrialActive: false,
    hasActiveSubscription: false,
  });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const ensureProfileRecord = useCallback(async (user: User | null) => {
    if (!user) {
      return;
    }

    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', user.id)
      .maybeSingle();

    if (fetchError) {
      console.error('Error checking profile record:', fetchError);
      return;
    }

    if (!existingProfile) {
      const { error: insertError } = await supabase.from('profiles').insert({
        id: user.id,
        full_name: user.user_metadata?.full_name || null,
        avatar_url: user.user_metadata?.avatar_url || null,
        handle: user.user_metadata?.handle || null,
      });

      if (insertError) {
        console.error('Error creating profile record:', insertError);
      }
    }
  }, [supabase]);

  const fetchNotifications = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*, sender:sender_id (full_name, avatar_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching notifications:", error);
    } else {
      setNotifications(data as Notification[]);
      setUnreadCount(data.filter(n => !n.is_read).length);
    }
  }, [supabase]);

  const markAsRead = useCallback(async (notificationId: number) => {
    if (!user) return;
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
    
    if (!error) {
        setNotifications(notifications.map(n => n.id === notificationId ? {...n, is_read: true} : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
    }
  }, [supabase, user, notifications]);

  const updateUserState = useCallback((user: User | null) => {
    setUser(user);
    const newRole = determineRole(user);
    const newCategories = getVendorCategories(user);
    setRole(newRole);
    setVendorCategories(newCategories);
    const subscriptionState = getVendorSubscriptionState(user);
    setVendorSubscriptionStatus({
      isVendorActive: subscriptionState.canManageListings,
      isTrialActive: subscriptionState.trialActive,
      hasActiveSubscription: subscriptionState.subscriptionWindowActive,
    });
    if (user) {
      fetchNotifications(user.id);
      ensureProfileRecord(user).catch(console.error);
    } else {
      setNotifications([]);
      setUnreadCount(0);
      setVendorSubscriptionStatus({
        isVendorActive: false,
        isTrialActive: false,
        hasActiveSubscription: false,
      });
    }
    setLoading(false);
  }, [fetchNotifications, ensureProfileRecord]);


  useEffect(() => {
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      updateUserState(session?.user || null);
      setLoading(false);
    };

    getInitialSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      updateUserState(session?.user ?? null);
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
          router.refresh();
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [router, supabase.auth, updateUserState]);


  // Realtime subscription for new notifications
  useEffect(() => {
      if (!user) return;

      const channel = supabase.channel(`notifications_${user.id}`)
        .on<Notification>('postgres_changes', { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${user.id}` }, 
        async (payload) => {
             const newNotification = payload.new as Notification;
             // We need to fetch the sender's profile
             const { data: senderProfile, error } = await supabase
                .from('profiles')
                .select('full_name, avatar_url')
                .eq('id', newNotification.sender_id)
                .single();
            
             if (!error && senderProfile) {
                 newNotification.sender = senderProfile;
             }
             
             setNotifications(prev => [newNotification, ...prev]);
             setUnreadCount(prev => prev + 1);
        })
        .subscribe();
      
      return () => {
          supabase.removeChannel(channel);
      }

  }, [supabase, user]);

  const signOut = async () => {
    await supabase.auth.signOut();
    // The onAuthStateChange listener will handle updating the state
  };

  const value = {
    supabase,
    user,
    role,
    vendorCategories,
    vendorSubscriptionStatus,
    loading,
    signOut,
    notifications,
    unreadCount,
    markAsRead,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
