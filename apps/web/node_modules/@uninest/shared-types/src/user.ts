/**
 * User profile type
 */
export type Profile = {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    handle: string | null;
    bio?: string | null;
    followers?: { count: number }[];
    following?: { count: number }[];
};

/**
 * User roles in the system
 */
export type UserRole = 'student' | 'vendor' | 'co-admin' | 'admin' | 'guest';
