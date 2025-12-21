-- Create audit_log table for tracking admin actions
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

CREATE TABLE IF NOT EXISTS public.audit_log (
    id BIGSERIAL PRIMARY KEY,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    admin_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    details TEXT,
    target_type TEXT,
    target_id TEXT
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_action ON public.audit_log(action);

-- Enable RLS
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins and service role can read
DROP POLICY IF EXISTS "Admins can read audit logs" ON public.audit_log;
CREATE POLICY "Admins can read audit logs" ON public.audit_log
FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
);

-- Only service role can insert (for server actions)
DROP POLICY IF EXISTS "Service role can insert audit logs" ON public.audit_log;
CREATE POLICY "Service role can insert audit logs" ON public.audit_log
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Grant necessary permissions
GRANT SELECT ON public.audit_log TO authenticated;
GRANT INSERT ON public.audit_log TO service_role;
