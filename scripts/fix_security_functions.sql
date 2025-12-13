-- Security Fix: Set fixed search_path for functions to prevent search_path hijacking
-- Run this script in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql

-- 1. update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;

-- 2. handle_new_user
ALTER FUNCTION public.handle_new_user() SET search_path = public;

-- 3. execute_sql
ALTER FUNCTION public.execute_sql(text) SET search_path = public;

-- 4. handle_new_follower
ALTER FUNCTION public.handle_new_follower() SET search_path = public;

-- 5. handle_new_post
ALTER FUNCTION public.handle_new_post() SET search_path = public;

-- 6. get_chat_rooms_for_user
ALTER FUNCTION public.get_chat_rooms_for_user() SET search_path = public;

-- 7. set_updated_at
ALTER FUNCTION public.set_updated_at() SET search_path = public;

-- 8. is_room_participant
-- Note: Check arguments if this fails, assuming standard signature or no args if not overloaded
ALTER FUNCTION public.is_room_participant(uuid) SET search_path = public;

-- 9. get_user_role
ALTER FUNCTION public.get_user_role() SET search_path = public;
