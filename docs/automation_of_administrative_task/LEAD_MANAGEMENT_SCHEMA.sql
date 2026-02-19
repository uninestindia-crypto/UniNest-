-- Migration: Create vendor_leads table for automation
-- Run this in your Supabase SQL Editor

CREATE TYPE IF NOT EXISTS lead_status AS ENUM ('new', 'contacted', 'interested', 'onboarded', 'rejected');
CREATE TYPE IF NOT EXISTS lead_source AS ENUM ('google_maps', 'excel_upload', 'instagram', 'manual');

CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),

    -- Contact Details
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    whatsapp_status BOOLEAN DEFAULT false,

    -- Source Information
    source lead_source DEFAULT 'manual',
    external_id TEXT,      -- Instagram Handle or Google Place ID

    -- Business Data
    category TEXT,         -- e.g., 'Hostel', 'PG', 'Apartment'
    address TEXT,
    city TEXT,

    -- Status & CRM
    status lead_status DEFAULT 'new',
    ai_summary TEXT,       -- Summary from Groq AI interaction
    last_contacted_at TIMESTAMPTZ,

    -- Flexible metadata for extra Excel columns
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_leads_phone ON public.leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_external_id ON public.leads(external_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Enable RLS
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- Admin-only policy
CREATE POLICY "Admins can manage leads" ON "public"."leads"
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);
