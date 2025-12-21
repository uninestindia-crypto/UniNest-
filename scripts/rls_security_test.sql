-- ============================================================================
-- UniNest RLS Security Testing Script
-- ============================================================================
-- Run each section one at a time. Copy-paste into Supabase SQL Editor.
-- ============================================================================

-- ============================================================================
-- SECTION 1: Get User IDs (RUN THIS FIRST)
-- ============================================================================

SELECT id, full_name, handle FROM profiles LIMIT 10;

-- ============================================================================
-- SECTION 2: Check which tables have data (RUN THIS SECOND)
-- ============================================================================

SELECT 'vendor_leads' as table_name, COUNT(*) as row_count FROM vendor_leads
UNION ALL SELECT 'vendor_payouts', COUNT(*) FROM vendor_payouts
UNION ALL SELECT 'vendor_metrics_summary', COUNT(*) FROM vendor_metrics_summary
UNION ALL SELECT 'chat_rooms', COUNT(*) FROM chat_rooms
UNION ALL SELECT 'chat_messages', COUNT(*) FROM chat_messages
UNION ALL SELECT 'chat_participants', COUNT(*) FROM chat_participants;

-- ============================================================================
-- SECTION 3: CRITICAL - Verify RLS is ENABLED (RUN THIS)
-- ============================================================================
-- ALL results should show rowsecurity = true
-- If ANY show false, your data is exposed!

SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'chat_rooms', 
    'chat_participants', 
    'chat_messages',
    'vendor_leads', 
    'vendor_payouts', 
    'vendor_metrics_summary',
    'vendor_pricing_insights', 
    'vendor_booking_calendar',
    'vendor_quick_replies', 
    'vendor_marketing_boosters',
    'vendor_nudges', 
    'vendor_optimizer_highlights', 
    'vendor_tier_metrics',
    'profiles'
)
ORDER BY tablename;

-- ============================================================================
-- SECTION 4: View all RLS Policies (RUN THIS)
-- ============================================================================
-- This shows what policies exist. Verify each table has appropriate policies.

SELECT 
    tablename,
    policyname,
    cmd as operation,
    qual as condition
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN (
    'chat_rooms', 'chat_participants', 'chat_messages',
    'vendor_leads', 'vendor_payouts', 'vendor_metrics_summary'
)
ORDER BY tablename, policyname;

-- ============================================================================
-- SECTION 5: Test Anonymous Access (RUN THIS)
-- ============================================================================
-- These should return 0 rows if RLS is working for unauthenticated users

SELECT 'vendor_leads' as table_name, COUNT(*) as anon_count FROM vendor_leads;
SELECT 'chat_messages' as table_name, COUNT(*) as anon_count FROM chat_messages;
SELECT 'vendor_payouts' as table_name, COUNT(*) as anon_count FROM vendor_payouts;

-- ⚠️ If these return > 0, anonymous users can see your data!

-- ============================================================================
-- SECTION 6: MANUAL CROSS-USER TEST (DO THIS IN YOUR APP)
-- ============================================================================
-- 
-- This test CANNOT be done via SQL Editor. You must test via the app:
--
-- 1. Open your app in TWO different browsers (or one incognito)
-- 2. Log in as User A in Browser 1
-- 3. Log in as User B in Browser 2
-- 4. In Browser 1, open DevTools Console and run:
--
--    // Get User A's vendor ID (if they're a vendor)
--    const { data: myData } = await supabase.from('vendor_leads').select('*');
--    console.log('My leads:', myData);
--
--    // Now try to access User B's data (replace with User B's actual UUID)
--    const { data: stolenData } = await supabase
--      .from('vendor_leads')
--      .select('*')
--      .eq('vendor_id', 'USER_B_UUID_FROM_SECTION_1');
--    console.log('Stolen data:', stolenData);
--
-- 5. The "stolenData" should be an EMPTY ARRAY if RLS is working!
--
-- ============================================================================

-- ============================================================================
-- RESULTS INTERPRETATION
-- ============================================================================
--
-- ✅ PASS:
--    - Section 3: All tables show rowsecurity = true
--    - Section 4: Each table has SELECT/INSERT/UPDATE/DELETE policies
--    - Section 5: All counts are 0 (anonymous can't see data)
--    - Section 6: Cross-user query returns empty array
--
-- ❌ FAIL:
--    - Any table shows rowsecurity = false → RUN FIX BELOW
--    - Anonymous counts > 0 → Data is publicly exposed
--    - Cross-user query returns data → Critical security bug
--
-- ============================================================================

-- ============================================================================
-- FIX: Enable RLS on tables that show false
-- ============================================================================
-- If Section 3 showed any table with rowsecurity = false, run:
--
-- ALTER TABLE public.TABLE_NAME ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.TABLE_NAME FORCE ROW LEVEL SECURITY;
--
-- (Replace TABLE_NAME with the actual table name)
-- ============================================================================
