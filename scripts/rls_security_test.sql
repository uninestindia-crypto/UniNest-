-- ============================================================================
-- UniNest RLS Security Testing Script
-- ============================================================================
-- PURPOSE: Validate that Row Level Security policies are working correctly.
-- This script tests that users CANNOT access other users' data.
--
-- HOW TO USE:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Run each section one at a time
-- 3. Replace placeholder UUIDs with real user/vendor IDs from your database
-- 4. Expected result: All "ATTACK" queries should return 0 rows
--
-- IMPORTANT: Run these tests on your PRODUCTION database before launch!
-- ============================================================================

-- ============================================================================
-- STEP 0: GET REAL USER IDs TO TEST WITH
-- Run this first to get actual user IDs from your database
-- ============================================================================

-- Get two different user IDs for testing
SELECT id, email, role FROM auth.users LIMIT 5;

-- Get two different vendor IDs (if applicable)
SELECT id, vendor_id FROM profiles WHERE role = 'vendor' LIMIT 5;

-- ============================================================================
-- STEP 1: SETUP TEST CONTEXT
-- Replace these UUIDs with real ones from Step 0
-- ============================================================================

-- USER_A is the "attacker" - logged in user trying to access others' data
-- USER_B is the "victim" - whose data should NOT be accessible
DO $$
DECLARE
    USER_A_UUID UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE ME
    USER_B_UUID UUID := '00000000-0000-0000-0000-000000000002'; -- REPLACE ME
    VENDOR_A_UUID UUID := '00000000-0000-0000-0000-000000000003'; -- REPLACE ME
    VENDOR_B_UUID UUID := '00000000-0000-0000-0000-000000000004'; -- REPLACE ME
BEGIN
    RAISE NOTICE '=== RLS SECURITY TEST CONFIGURATION ===';
    RAISE NOTICE 'Attacker (User A): %', USER_A_UUID;
    RAISE NOTICE 'Victim (User B): %', USER_B_UUID;
    RAISE NOTICE 'Vendor A: %', VENDOR_A_UUID;
    RAISE NOTICE 'Vendor B: %', VENDOR_B_UUID;
END $$;

-- ============================================================================
-- STEP 2: CHAT SYSTEM RLS TESTS
-- ============================================================================

-- Test: User A should NOT see User B's chat rooms
-- Expected: 0 rows (if User A is not a participant)
SET request.jwt.claims = '{"sub": "USER_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing other user chat rooms' as test_name, COUNT(*) as rows_found
FROM chat_rooms 
WHERE id NOT IN (
    SELECT room_id FROM chat_participants 
    WHERE user_id = 'USER_A_UUID_HERE'::uuid
);
-- ⚠️ If this returns > 0, RLS is BROKEN for chat_rooms

-- Test: User A should NOT see chat messages from rooms they're not in
SET request.jwt.claims = '{"sub": "USER_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing other user messages' as test_name, COUNT(*) as rows_found
FROM chat_messages 
WHERE room_id NOT IN (
    SELECT room_id FROM chat_participants 
    WHERE user_id = 'USER_A_UUID_HERE'::uuid
);
-- ⚠️ If this returns > 0, RLS is BROKEN for chat_messages

-- ============================================================================
-- STEP 3: VENDOR DATA RLS TESTS
-- These are CRITICAL - vendor financial and business data must be isolated
-- ============================================================================

-- Test: Vendor A should NOT see Vendor B's leads
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor leads' as test_name, COUNT(*) as rows_found
FROM vendor_leads 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, CRITICAL BREACH - competitors can steal leads

-- Test: Vendor A should NOT see Vendor B's payouts
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor payouts' as test_name, COUNT(*) as rows_found
FROM vendor_payouts 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, CRITICAL BREACH - financial data exposed

-- Test: Vendor A should NOT see Vendor B's metrics
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor metrics' as test_name, COUNT(*) as rows_found
FROM vendor_metrics_summary 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, competitors can see business performance

-- Test: Vendor A should NOT see Vendor B's pricing insights
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor pricing' as test_name, COUNT(*) as rows_found
FROM vendor_pricing_insights 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, competitors can undercut pricing

-- Test: Vendor A should NOT see Vendor B's booking calendar
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor calendar' as test_name, COUNT(*) as rows_found
FROM vendor_booking_calendar 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, competitors can see availability

-- Test: Vendor A should NOT see Vendor B's quick replies
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor quick replies' as test_name, COUNT(*) as rows_found
FROM vendor_quick_replies 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, competitors can copy responses

-- Test: Vendor A should NOT see Vendor B's marketing boosters
SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';
SELECT 'ATTACK: Accessing competitor marketing' as test_name, COUNT(*) as rows_found
FROM vendor_marketing_boosters 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- ⚠️ If this returns > 0, competitors can see marketing strategy

-- ============================================================================
-- STEP 4: ANON USER TESTS (UNAUTHENTICATED ACCESS)
-- These test that public/anonymous users can't access protected data
-- ============================================================================

-- Reset to anonymous context
SET request.jwt.claims = '{"role": "anon"}';

-- Test: Anon user should NOT see any vendor leads
SELECT 'ATTACK: Anon accessing vendor leads' as test_name, COUNT(*) as rows_found
FROM vendor_leads;
-- ⚠️ If this returns > 0, unauthenticated users can see business data

-- Test: Anon user should NOT see any chat messages
SELECT 'ATTACK: Anon accessing chat messages' as test_name, COUNT(*) as rows_found
FROM chat_messages;
-- ⚠️ If this returns > 0, private messages are PUBLIC

-- Test: Anon user should NOT see vendor payouts
SELECT 'ATTACK: Anon accessing vendor payouts' as test_name, COUNT(*) as rows_found
FROM vendor_payouts;
-- ⚠️ If this returns > 0, financial data is PUBLIC

-- ============================================================================
-- STEP 5: DELETE/UPDATE PROTECTION TESTS
-- These test that one user can't DELETE or UPDATE another user's data
-- ============================================================================

-- NOTE: These are READ tests that simulate what an attacker would see
-- before attempting to delete. If they can see the data, they can delete it.

SET request.jwt.claims = '{"sub": "VENDOR_A_UUID_HERE", "role": "authenticated"}';

-- Check if Vendor A can target Vendor B's data for deletion
SELECT 'RISK: Rows Vendor A could potentially delete from Vendor B' as test_name,
       COUNT(*) as vulnerable_rows
FROM vendor_leads 
WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;

-- ACTUAL DELETE TEST (⚠️ DANGEROUS - only run on test data!)
-- Uncomment only if you have test data you can afford to lose
-- DELETE FROM vendor_leads WHERE vendor_id = 'VENDOR_B_UUID_HERE'::uuid;
-- If this deletes rows, RLS DELETE policy is BROKEN

-- ============================================================================
-- STEP 6: RESULTS SUMMARY
-- ============================================================================

-- Run this to get a summary of all tables and their RLS status
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN (
    'chat_rooms', 'chat_participants', 'chat_messages',
    'vendor_leads', 'vendor_payouts', 'vendor_metrics_summary',
    'vendor_pricing_insights', 'vendor_booking_calendar',
    'vendor_quick_replies', 'vendor_marketing_boosters',
    'vendor_nudges', 'vendor_optimizer_highlights', 'vendor_tier_metrics'
)
ORDER BY tablename;

-- ============================================================================
-- FINAL PASS/FAIL CHECKLIST
-- ============================================================================
-- 
-- ✅ PASS if ALL attack queries return 0 rows
-- ❌ FAIL if ANY attack query returns > 0 rows
--
-- If any test FAILS:
-- 1. Check the RLS policy for that table in db_schema.sql
-- 2. Verify the policy covers all operations (SELECT, INSERT, UPDATE, DELETE)
-- 3. Test again after fixing
-- 4. DO NOT LAUNCH until all tests pass
--
-- ============================================================================
