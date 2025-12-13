/**
 * User profile type
 */
export type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    handle: string | null;
    bio?: string | null;
    phone?: string | null;
    followers?: { count: number }[];
    following?: { count: number }[];
    preferences?: {
        notifications?: {
            push?: boolean;
            email?: boolean;
        };
        theme?: 'light' | 'dark' | 'system';
    };
};

/**
 * User roles in the system
 */
export type UserRole = 'student' | 'vendor' | 'co-admin' | 'admin' | 'guest';
