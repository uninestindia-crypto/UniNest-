-- =============================================================================
-- UNINEST MASTER SCHEMA RESTORATION SCRIPT
-- =============================================================================
-- This script contains all table definitions, functions, RLS policies, 
-- and indexes required to restore the UniNest backend from scratch.
-- 
-- WARNING: Run this on a FRESH Supabase project. 
-- Avoid running on existing data unless you use "IF NOT EXISTS".
-- =============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "vector" WITH SCHEMA "extensions";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

-- 0.1 STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('UniNest', 'UniNest', true),
  ('avatars', 'avatars', true),
  ('products', 'products', true),
  ('internships', 'internships', true),
  ('competitions', 'competitions', true),
  ('branding', 'branding', true),
  ('internship-applications', 'internship-applications', false),
  ('competition-pitches', 'competition-pitches', false)
ON CONFLICT (id) DO NOTHING;

-- 1. CORE ENUMS
DO $$ BEGIN
    CREATE TYPE lead_status AS ENUM ('new', 'contacted', 'interested', 'onboarded', 'rejected');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE lead_source AS ENUM ('google_maps', 'excel_upload', 'instagram', 'manual');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE verification_status AS ENUM ('pending', 'approved', 'rejected', 'resubmission_requested');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE flag_status AS ENUM ('open', 'under_review', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE fraud_status AS ENUM ('new', 'acknowledged', 'investigating', 'resolved', 'dismissed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. CORE FUNCTIONS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  new.updated_at = now();
  return new;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, handle)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    'user' || substr(NEW.id::text, 1, 8)
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text AS $$
DECLARE
  role TEXT;
BEGIN
  SELECT auth.jwt()->>'role' INTO role;
  RETURN role;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.execute_sql(query text)
RETURNS json AS $$
DECLARE
    result_json json;
BEGIN
    EXECUTE 'SELECT json_agg(t) FROM (' || query || ') t' INTO result_json;
    RETURN result_json;
EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object('error', SQLERRM);
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_follower()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, sender_id, type)
  VALUES (NEW.following_id, NEW.follower_id, 'new_follower');
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.handle_new_post()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.notifications (user_id, sender_id, type, post_id)
  SELECT follower_id, NEW.user_id, 'new_post', NEW.id
  FROM public.followers
  WHERE following_id = NEW.user_id;
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_chat_participant(room_id_to_check uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM chat_participants 
    WHERE room_id = room_id_to_check AND user_id = auth.uid()
  );
$$ language 'sql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_room_participant(p_room_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE room_id = p_room_id AND user_id = p_user_id
    );
END;
$$ language 'plpgsql' SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_chat_rooms_for_user(p_user_id uuid)
RETURNS TABLE(id uuid, name text, avatar text, last_message text, last_message_timestamp timestamptz, unread_count integer, room_created_at timestamptz)
AS $$
WITH user_involved_rooms AS (
    SELECT DISTINCT room_id FROM chat_messages WHERE user_id = p_user_id
),
participants_info AS (
    SELECT DISTINCT ON (cm.room_id) cm.room_id, p.full_name, p.avatar_url
    FROM chat_messages cm
    JOIN profiles p ON cm.user_id = p.id
    WHERE cm.room_id IN (SELECT room_id FROM user_involved_rooms)
      AND cm.user_id <> p_user_id
),
last_messages AS (
    SELECT DISTINCT ON (room_id) room_id, content, created_at
    FROM chat_messages
    WHERE room_id IN (SELECT room_id FROM user_involved_rooms)
    ORDER BY room_id, created_at DESC
)
SELECT
    uir.room_id AS id, pi.full_name AS name, pi.avatar_url AS avatar,
    lm.content AS last_message, lm.created_at AS last_message_timestamp,
    0 AS unread_count, cr.created_at AS room_created_at
FROM user_involved_rooms uir
JOIN chat_rooms cr ON uir.room_id = cr.id
JOIN participants_info pi ON uir.room_id = pi.room_id
LEFT JOIN last_messages lm ON uir.room_id = lm.room_id
ORDER BY lm.created_at DESC NULLS LAST;
$$ language 'sql' STABLE SECURITY DEFINER SET search_path = public;

-- 3. CORE MODULE: Profiles & Platforms
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    updated_at TIMESTAMPTZ DEFAULT now(),
    full_name TEXT,
    avatar_url TEXT,
    handle TEXT UNIQUE CHECK (char_length(handle) >= 3),
    role TEXT DEFAULT 'user',
    banner_url TEXT,
    opening_hours TEXT,
    public_key TEXT,
    public_key_digest TEXT
);

CREATE TABLE IF NOT EXISTS public.platform_settings (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    key VARCHAR UNIQUE NOT NULL,
    value JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MARKETPLACE MODULE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    name TEXT NOT NULL,
    description TEXT,
    price NUMERIC CHECK (price >= 0),
    category TEXT,
    image_url TEXT,
    seller_id UUID REFERENCES public.profiles(id),
    location TEXT,
    status TEXT DEFAULT 'active',
    amenities TEXT[] DEFAULT '{}'::text[],
    room_types TEXT[] DEFAULT '{}'::text[],
    occupancy INTEGER,
    app_number TEXT,
    opening_hours TEXT[] DEFAULT '{}'::text[],
    meal_plan JSONB,
    subscription_price NUMERIC,
    special_notes TEXT,
    utilities_included TEXT[] DEFAULT '{}'::text[],
    house_rules TEXT,
    furnishing TEXT,
    hourly_slots TEXT[] DEFAULT '{}'::text[],
    services_offered TEXT[] DEFAULT '{}'::text[],
    equipment_specs TEXT,
    app_store_url TEXT,
    play_store_url TEXT,
    website_url TEXT,
    instagram_url TEXT,
    facebook_url TEXT,
    twitter_url TEXT,
    telegram_number TEXT,
    phone_number TEXT,
    whatsapp_number TEXT,
    total_seats INTEGER
);

CREATE TABLE IF NOT EXISTS public.product_images (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_variants (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT NOT NULL,
    price_modifier NUMERIC DEFAULT 0,
    stock_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.product_reviews (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.favorites (
    user_id UUID REFERENCES auth.users(id),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    PRIMARY KEY (user_id, product_id)
);

-- 5. SOCIAL FEED MODULE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.comments (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.likes (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE CASCADE,
    PRIMARY KEY (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS public.followers (
    follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    following_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (follower_id, following_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    sender_id UUID REFERENCES public.profiles(id),
    type TEXT NOT NULL,
    post_id BIGINT REFERENCES public.posts(id) ON DELETE SET NULL,
    is_read BOOLEAN DEFAULT false
);

-- 6. WORKSPACE MODULE (Internships & Competitions)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.internships (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    stipend NUMERIC,
    stipend_period TEXT,
    deadline TIMESTAMPTZ,
    location TEXT,
    image_url TEXT,
    details_pdf_url TEXT
);

CREATE TABLE IF NOT EXISTS public.internship_applications (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    internship_id BIGINT REFERENCES public.internships(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    cover_letter TEXT,
    resume_url TEXT NOT NULL,
    applicant_id UUID REFERENCES auth.users(id)
);

CREATE TABLE IF NOT EXISTS public.competitions (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    title TEXT NOT NULL,
    description TEXT,
    prize NUMERIC,
    deadline TIMESTAMPTZ,
    entry_fee NUMERIC DEFAULT 0,
    image_url TEXT,
    details_pdf_url TEXT,
    winner_id UUID REFERENCES public.profiles(id),
    result_description TEXT
);

CREATE TABLE IF NOT EXISTS public.competition_entries (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    competition_id BIGINT REFERENCES public.competitions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
    razorpay_payment_id TEXT,
    phone_number TEXT,
    whatsapp_number TEXT,
    pitch_url TEXT
);

-- 7. CHAT SYSTEM MODULE (E2EE)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.chat_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT,
    avatar TEXT
);

CREATE TABLE IF NOT EXISTS public.chat_participants (
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ DEFAULT now(),
    PRIMARY KEY (room_id, user_id)
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    content TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    is_read BOOLEAN DEFAULT false,
    encryption_v INTEGER DEFAULT 1,
    iv TEXT
);

CREATE TABLE IF NOT EXISTS public.chat_room_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    encrypted_session_key TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now())
);

-- 8. VENDOR TOOLS MODULE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.vendor_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    amount INTEGER,
    currency TEXT DEFAULT 'INR',
    services_selected INTEGER,
    categories TEXT[],
    billing_period_start TIMESTAMPTZ,
    billing_period_end TIMESTAMPTZ,
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.vendor_metrics_summary (
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    label TEXT,
    value TEXT,
    trend TEXT,
    tone TEXT CHECK (tone IN ('positive', 'neutral', 'negative')),
    description TEXT,
    icon TEXT,
    PRIMARY KEY (vendor_id, label)
);

CREATE TABLE IF NOT EXISTS public.vendor_leads (
    vendor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    position INTEGER,
    name TEXT,
    initials TEXT,
    note TEXT,
    status TEXT CHECK (status IN ('new', 'warm', 'followup')),
    time TEXT,
    PRIMARY KEY (vendor_id, position)
);

-- 9. CRM & LEADS MODULE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp_status BOOLEAN DEFAULT false,
    source lead_source DEFAULT 'manual',
    external_id TEXT,
    category TEXT,
    address TEXT,
    city TEXT,
    status lead_status DEFAULT 'new',
    ai_summary TEXT,
    last_contacted_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 10. ADMIN & MODERATION MODULE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_log (
    id UUID PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
    id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT now(),
    user_id UUID REFERENCES auth.users(id),
    category TEXT,
    subject TEXT,
    description TEXT,
    status TEXT DEFAULT 'Open',
    priority TEXT DEFAULT 'Medium',
    screenshot_url TEXT
);

CREATE TABLE IF NOT EXISTS public.supplier_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    status verification_status DEFAULT 'pending',
    documents JSONB DEFAULT '[]'::jsonb,
    submitted_at TIMESTAMPTZ DEFAULT now(),
    reviewed_at TIMESTAMPTZ,
    reviewed_by UUID REFERENCES public.profiles(id),
    reviewer_notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS public.moderation_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT CHECK (entity_type IN ('job', 'bid', 'chat_message', 'profile')),
    entity_id UUID,
    reporter_id UUID REFERENCES public.profiles(id),
    reason TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    status flag_status DEFAULT 'open',
    assigned_to UUID REFERENCES public.profiles(id),
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.fraud_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_type TEXT CHECK (subject_type IN ('profile', 'job', 'bid', 'payment_order')),
    subject_id UUID,
    rule_key TEXT,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    score NUMERIC,
    status fraud_status DEFAULT 'new',
    assigned_to UUID REFERENCES public.profiles(id),
    details JSONB DEFAULT '{}'::jsonb,
    triggered_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT
);

-- 11. INDEXES & PERFORMANCE
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_seller_id ON products(seller_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_followers_follower_id ON followers(follower_id);
CREATE INDEX IF NOT EXISTS idx_followers_following_id ON followers(following_id);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);

-- 12. RLS ENFORCEMENT & POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Public products are viewable by everyone" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Admins can manage leads" ON leads FOR ALL TO authenticated USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 13. TRIGGERS
-- -----------------------------------------------------------------------------
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
CREATE TRIGGER on_follower_created AFTER INSERT ON public.followers FOR EACH ROW EXECUTE PROCEDURE public.handle_new_follower();
CREATE TRIGGER on_post_created AFTER INSERT ON public.posts FOR EACH ROW EXECUTE PROCEDURE public.handle_new_post();
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads FOR EACH ROW EXECUTE PROCEDURE public.update_updated_at_column();
