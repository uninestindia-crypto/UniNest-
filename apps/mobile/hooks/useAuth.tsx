import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    type ReactNode,
} from 'react';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile, UserRole } from '@uninest/shared-types';
import { supabase, authApi } from '@/services/supabase';

type AuthContextType = {
    user: User | null;
    session: Session | null;
    profile: Profile | null;
    role: UserRole;
    isLoading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string, metadata?: { full_name?: string; role?: UserRole }) => Promise<void>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [role, setRole] = useState<UserRole>('guest');
    const [isLoading, setIsLoading] = useState(true);

    const fetchProfile = useCallback(async (userId: string) => {
        const fetchedProfile = await authApi.getProfile(userId);
        setProfile(fetchedProfile);
    }, []);

    const updateUserState = useCallback(
        async (newSession: Session | null) => {
            setSession(newSession);
            const newUser = newSession?.user ?? null;
            setUser(newUser);

            if (newUser) {
                setRole(authApi.getUserRole(newUser));
                await fetchProfile(newUser.id);
            } else {
                setRole('guest');
                setProfile(null);
            }

            setIsLoading(false);
        },
        [fetchProfile]
    );

    useEffect(() => {
        // Get initial session
        const initSession = async () => {
            const currentSession = await authApi.getSession();
            await updateUserState(currentSession);
        };

        initSession();

        // Subscribe to auth changes
        const { data: { subscription } } = authApi.onAuthStateChange(
            async (_event, newSession) => {
                await updateUserState(newSession);
            }
        );

        return () => {
            subscription?.unsubscribe();
        };
    }, [updateUserState]);

    const signIn = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            await authApi.signIn(email, password);
            // Session update will be handled by onAuthStateChange
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signUp = async (
        email: string,
        password: string,
        metadata?: { full_name?: string; role?: UserRole }
    ) => {
        setIsLoading(true);
        try {
            await authApi.signUp(email, password, metadata);
            // Session update will be handled by onAuthStateChange
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const signOut = async () => {
        setIsLoading(true);
        try {
            await authApi.signOut();
            // Session update will be handled by onAuthStateChange
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                profile,
                role,
                isLoading,
                signIn,
                signUp,
                signOut,
                refreshProfile,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
