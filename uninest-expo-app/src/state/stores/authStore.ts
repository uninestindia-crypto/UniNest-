import { create } from 'zustand';
import type { User, RealtimeChannel, AuthSubscription } from '@supabase/supabase-js';

import { supabase } from '@/services/supabase/client';
import { getVendorSubscriptionState } from '@/services/vendor/access';
import type { Notification } from '@/models/notification';

type VendorStatus = {
  isVendorActive: boolean;
  isTrialActive: boolean;
  hasActiveSubscription: boolean;
};

type AuthState = {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  vendorCategories: string[];
  vendorStatus: VendorStatus;
  notifications: Notification[];
  unreadCount: number;
  error: string | null;
  hasInitialized: boolean;
  authSubscription: AuthSubscription | null;
  notificationChannel: RealtimeChannel | null;
  initialize: () => Promise<void>;
  fetchProfile: () => Promise<void>;
  markNotificationRead: (notificationId: number) => Promise<void>;
  signOut: () => Promise<void>;
  cleanup: () => void;
};

const initialVendorStatus: VendorStatus = {
  isVendorActive: false,
  isTrialActive: false,
  hasActiveSubscription: false,
};

async function fetchNotifications(userId: string): Promise<Notification[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select('*, sender:sender_id (full_name, avatar_url)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    console.warn('[authStore] failed to fetch notifications', error);
    return [];
  }

  return (data ?? []) as unknown as Notification[];
}

function deriveVendorCategories(user: User | null) {
  if (!user) {
    return [] as string[];
  }

  const role = user.user_metadata?.role;
  if (role !== 'vendor') {
    return [] as string[];
  }

  const categories = user.user_metadata?.vendor_categories;
  if (!Array.isArray(categories)) {
    return [] as string[];
  }

  return categories.filter((item): item is string => typeof item === 'string' && item.length > 0);
}

function computeVendorStatus(user: User | null): VendorStatus {
  if (!user) {
    return initialVendorStatus;
  }
  const state = getVendorSubscriptionState(user);
  return {
    isVendorActive: state.canManageListings,
    isTrialActive: state.trialActive,
    hasActiveSubscription: state.subscriptionWindowActive,
  } satisfies VendorStatus;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  isAuthenticated: false,
  vendorCategories: [],
  vendorStatus: initialVendorStatus,
  notifications: [],
  unreadCount: 0,
  error: null,
  hasInitialized: false,
  authSubscription: null,
  notificationChannel: null,

  initialize: async () => {
    if (get().hasInitialized) {
      return;
    }

    set({ loading: true, hasInitialized: true });
    await get().fetchProfile();

    const { data } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await get().fetchProfile();
      if (!session?.user) {
        const channel = get().notificationChannel;
        if (channel) {
          supabase.removeChannel(channel);
          set({ notificationChannel: null });
        }
      }
    });

    set({ authSubscription: data.subscription });
  },

  fetchProfile: async () => {
    set({ loading: true, error: null });

    const { data, error } = await supabase.auth.getSession();

    if (error) {
      console.warn('[authStore] failed to get session', error);
      set({
        user: null,
        isAuthenticated: false,
        vendorCategories: [],
        vendorStatus: initialVendorStatus,
        notifications: [],
        unreadCount: 0,
        loading: false,
        error: error.message,
      });
      return;
    }

    const sessionUser = data.session?.user ?? null;
    const vendorCategories = deriveVendorCategories(sessionUser);
    const vendorStatus = computeVendorStatus(sessionUser);

    let notifications: Notification[] = [];
    let unreadCount = 0;

    if (sessionUser) {
      notifications = await fetchNotifications(sessionUser.id);
      unreadCount = notifications.filter((notification) => !notification.is_read).length;

      const existingChannel = get().notificationChannel;
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
      }

      const channel = supabase
        .channel(`notifications_${sessionUser.id}`)
        .on('postgres_changes', {
          schema: 'public',
          table: 'notifications',
          event: 'INSERT',
          filter: `user_id=eq.${sessionUser.id}`,
        }, async (payload) => {
          const incoming = payload.new as Notification;
          const { data: senderProfile } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', incoming.sender_id)
            .maybeSingle();

          const notification: Notification = {
            ...incoming,
            sender: senderProfile ?? null,
          };

          set((state) => ({
            notifications: [notification, ...state.notifications],
            unreadCount: state.unreadCount + 1,
          }));
        })
        .subscribe();

      set({ notificationChannel: channel });
    } else {
      const existingChannel = get().notificationChannel;
      if (existingChannel) {
        supabase.removeChannel(existingChannel);
        set({ notificationChannel: null });
      }
    }

    set({
      user: sessionUser,
      isAuthenticated: Boolean(sessionUser),
      vendorCategories,
      vendorStatus,
      notifications,
      unreadCount,
      loading: false,
    });
  },

  markNotificationRead: async (notificationId) => {
    const { user } = get();
    if (!user) {
      return;
    }

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (error) {
      console.warn('[authStore] failed to mark notification read', error);
      return;
    }

    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, is_read: true } : notification
      ),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  signOut: async () => {
    await supabase.auth.signOut();
    get().cleanup();
    set({
      user: null,
      isAuthenticated: false,
      vendorCategories: [],
      vendorStatus: initialVendorStatus,
      notifications: [],
      unreadCount: 0,
    });
  },

  cleanup: () => {
    const { authSubscription, notificationChannel } = get();
    if (authSubscription) {
      authSubscription.unsubscribe();
      set({ authSubscription: null });
    }
    if (notificationChannel) {
      supabase.removeChannel(notificationChannel);
      set({ notificationChannel: null });
    }
  },
}));
