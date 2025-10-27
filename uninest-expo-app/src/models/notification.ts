export type NotificationSender = {
  full_name: string;
  avatar_url: string | null;
};

export type Notification = {
  id: number;
  created_at: string;
  user_id: string;
  sender_id: string;
  type: 'new_follower' | 'new_post' | 'new_message';
  post_id: number | null;
  is_read: boolean;
  sender?: NotificationSender | null;
  message?: string | null;
};
