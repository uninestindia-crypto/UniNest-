-- Migration: Add E2EE support to chat system

-- 1. Add public key storage to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS public_key TEXT,
ADD COLUMN IF NOT EXISTS public_key_digest TEXT;

-- 2. Create table for encrypted chat room keys
-- This stores the symmetric key for each room, encrypted for each participant
CREATE TABLE IF NOT EXISTS public.chat_room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    encrypted_session_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(room_id, user_id)
);

-- 3. Enable RLS on chat_room_keys
ALTER TABLE public.chat_room_keys ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies for chat_room_keys
-- Users can only read their own encrypted session keys
CREATE POLICY "Users can read their own room keys" 
ON public.chat_room_keys FOR SELECT 
USING (auth.uid() = user_id);

-- Only service role or specific functions can manage these
-- (Alternatively, we can allow users to insert their own key during room creation)
CREATE POLICY "Users can insert their own room keys" 
ON public.chat_room_keys FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Add meta info to chat_messages if needed (e.g., encryption version)
ALTER TABLE public.chat_messages 
ADD COLUMN IF NOT EXISTS encryption_v INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS iv TEXT; -- Initialization Vector for AES-GCM

-- 6. Update the get_user_chat_rooms function to include E2EE status
-- (This might require updating the return type which can be complex in SQL)
-- For now, we'll handle the detection on the client side based on whether keys exist.
