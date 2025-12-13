
-- Drop existing policies and functions to ensure a clean slate
DROP POLICY IF EXISTS "Enable read access for user's own rooms" ON public.chat_rooms;
DROP POLICY IF EXISTS "Enable read for participants" ON public.chat_participants;
DROP POLICY IF EXISTS "Enable read for participants" ON public.chat_messages;
DROP FUNCTION IF EXISTS is_chat_participant(uuid, uuid);
DROP FUNCTION IF EXISTS get_user_chat_rooms();

-- Helper function to check if a user is in a specific chat room.
-- This is crucial to break the infinite recursion loop.
create or replace function is_chat_participant(room_id_to_check uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from chat_participants
    where chat_participants.room_id = room_id_to_check
    and chat_participants.user_id = auth.uid()
  );
$$;

-- Policies for chat_rooms
CREATE POLICY "Enable read access for user's own rooms" ON public.chat_rooms
FOR SELECT USING (is_chat_participant(id));

-- Policies for chat_participants
CREATE POLICY "Enable read for participants" ON public.chat_participants
FOR SELECT USING (is_chat_participant(room_id));

-- Policies for chat_messages
CREATE POLICY "Enable read for participants" ON public.chat_messages
FOR SELECT USING (is_chat_participant(room_id));
CREATE POLICY "Enable insert for participants" ON public.chat_messages
FOR INSERT WITH CHECK (is_chat_participant(room_id) AND auth.uid() = user_id);

-- Function to get all chat rooms for the current user.
-- This simplifies client-side logic immensely.
create or replace function get_user_chat_rooms()
returns table (
    id uuid,
    created_at timestamptz,
    name text,
    avatar text,
    last_message text,
    last_message_timestamp timestamptz,
    unread_count int
)
language sql
security definer
set search_path = public
as $$
with user_rooms as (
  select room_id from chat_participants where user_id = auth.uid()
),
other_participants as (
  select
    cp.room_id,
    p.full_name,
    p.avatar_url
  from chat_participants cp
  join profiles p on cp.user_id = p.id
  where cp.room_id in (select room_id from user_rooms) and cp.user_id != auth.uid()
),
last_messages as (
  select distinct on (room_id)
    room_id,
    content,
    created_at
  from chat_messages
  where room_id in (select room_id from user_rooms)
  order by room_id, created_at desc
)
select
  ur.room_id as id,
  cr.created_at,
  op.full_name as name,
  op.avatar_url as avatar,
  lm.content as last_message,
  lm.created_at as last_message_timestamp,
  0 as unread_count -- Placeholder for unread count
from user_rooms ur
join chat_rooms cr on ur.room_id = cr.id
left join other_participants op on ur.room_id = op.room_id
left join last_messages lm on ur.room_id = lm.room_id
order by lm.created_at desc;
$$;

-- -----------------------------------------------------------------------------
-- Vendor data protections
-- -----------------------------------------------------------------------------

-- Vendor Metrics Summary
ALTER TABLE IF EXISTS public.vendor_metrics_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_metrics_summary FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can read own metrics" ON public.vendor_metrics_summary;
DROP POLICY IF EXISTS "Service role manages vendor metrics" ON public.vendor_metrics_summary;

CREATE POLICY "Vendors can read own metrics" ON public.vendor_metrics_summary
FOR SELECT
USING (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages vendor metrics" ON public.vendor_metrics_summary
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Quick Replies
ALTER TABLE IF EXISTS public.vendor_quick_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_quick_replies FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own quick replies" ON public.vendor_quick_replies;
DROP POLICY IF EXISTS "Service role manages quick replies" ON public.vendor_quick_replies;

CREATE POLICY "Vendors manage own quick replies" ON public.vendor_quick_replies
FOR ALL
USING (auth.uid()::uuid = vendor_id)
WITH CHECK (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages quick replies" ON public.vendor_quick_replies
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Pricing Insights
ALTER TABLE IF EXISTS public.vendor_pricing_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_pricing_insights FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can read own pricing insights" ON public.vendor_pricing_insights;
DROP POLICY IF EXISTS "Service role manages pricing insights" ON public.vendor_pricing_insights;

CREATE POLICY "Vendors can read own pricing insights" ON public.vendor_pricing_insights
FOR SELECT
USING (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages pricing insights" ON public.vendor_pricing_insights
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Leads
ALTER TABLE IF EXISTS public.vendor_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_leads FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own leads" ON public.vendor_leads;
DROP POLICY IF EXISTS "Service role manages vendor leads" ON public.vendor_leads;

CREATE POLICY "Vendors manage own leads" ON public.vendor_leads
FOR ALL
USING (auth.uid()::uuid = vendor_id)
WITH CHECK (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages vendor leads" ON public.vendor_leads
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Booking Calendar
ALTER TABLE IF EXISTS public.vendor_booking_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_booking_calendar FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own booking calendar" ON public.vendor_booking_calendar;
DROP POLICY IF EXISTS "Service role manages booking calendar" ON public.vendor_booking_calendar;

CREATE POLICY "Vendors manage own booking calendar" ON public.vendor_booking_calendar
FOR ALL
USING (auth.uid()::uuid = vendor_id)
WITH CHECK (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages booking calendar" ON public.vendor_booking_calendar
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Payouts (vendors can read their payouts, writes restricted to service role)
ALTER TABLE IF EXISTS public.vendor_payouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_payouts FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can read own payouts" ON public.vendor_payouts;
DROP POLICY IF EXISTS "Service role manages vendor payouts" ON public.vendor_payouts;

CREATE POLICY "Vendors can read own payouts" ON public.vendor_payouts
FOR SELECT
USING (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages vendor payouts" ON public.vendor_payouts
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Marketing Boosters
ALTER TABLE IF EXISTS public.vendor_marketing_boosters ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_marketing_boosters FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own marketing boosters" ON public.vendor_marketing_boosters;
DROP POLICY IF EXISTS "Service role manages marketing boosters" ON public.vendor_marketing_boosters;

CREATE POLICY "Vendors manage own marketing boosters" ON public.vendor_marketing_boosters
FOR ALL
USING (auth.uid()::uuid = vendor_id)
WITH CHECK (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages marketing boosters" ON public.vendor_marketing_boosters
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Nudges
ALTER TABLE IF EXISTS public.vendor_nudges ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_nudges FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors manage own nudges" ON public.vendor_nudges;
DROP POLICY IF EXISTS "Service role manages vendor nudges" ON public.vendor_nudges;

CREATE POLICY "Vendors manage own nudges" ON public.vendor_nudges
FOR ALL
USING (auth.uid()::uuid = vendor_id)
WITH CHECK (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages vendor nudges" ON public.vendor_nudges
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Optimizer Highlights
ALTER TABLE IF EXISTS public.vendor_optimizer_highlights ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_optimizer_highlights FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can read own optimizer highlights" ON public.vendor_optimizer_highlights;
DROP POLICY IF EXISTS "Service role manages optimizer highlights" ON public.vendor_optimizer_highlights;

CREATE POLICY "Vendors can read own optimizer highlights" ON public.vendor_optimizer_highlights
FOR SELECT
USING (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages optimizer highlights" ON public.vendor_optimizer_highlights
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Vendor Tier Metrics
ALTER TABLE IF EXISTS public.vendor_tier_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.vendor_tier_metrics FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Vendors can read own tier metrics" ON public.vendor_tier_metrics;
DROP POLICY IF EXISTS "Service role manages vendor tier metrics" ON public.vendor_tier_metrics;

CREATE POLICY "Vendors can read own tier metrics" ON public.vendor_tier_metrics
FOR SELECT
USING (auth.uid()::uuid = vendor_id);

CREATE POLICY "Service role manages vendor tier metrics" ON public.vendor_tier_metrics
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');
