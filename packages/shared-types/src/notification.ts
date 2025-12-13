/**
 * Notification types
 */
export type NotificationType =
    | 'new_follower'
    | 'new_post'
    | 'new_message'
    | 'new_competition'
    | 'new_internship'
    | 'order_update'
    | 'booking_confirmed';

/**
 * Notification type
 */
export type Notification = {
    id: number;
    created_at: string;
    user_id: string;
    sender_id: string;
    type: NotificationType;
    post_id: number | null;
    is_read: boolean;
    sender: {
        full_name: string;
        avatar_url: string;
    } | null;
};
