# Pre-Launch Testing Plan: UniNest Studio

**Created:** 2024-12-21  
**Stack:** React (Next.js) + Node.js + Supabase + Vercel  
**Status:** Ready for execution

---

## Executive Summary

This is a battle-tested testing checklist for launching your app without embarrassing failures. Every item below has caused a real startup to lose users, money, or credibility. Don't skip the hard parts.

---

## Testing Categories (Strict Priority Order)

### 🔴 PRIORITY 1: Launch Blockers (Must Complete)
1. Authentication & Authorization
2. Row Level Security (RLS)
3. Payment/Transaction Critical Paths
4. Core User Journeys

### 🟡 PRIORITY 2: High Risk (Should Complete)
5. Error Handling & Observability
6. Performance & Perceived Speed
7. Production-Only Issues (Vercel)
8. Cross-Browser/Device Compatibility

### 🟢 PRIORITY 3: Can Wait (Nice to Have)
9. Edge Cases & Boundary Conditions
10. SEO & Analytics
11. Accessibility Basics

---

## Category 1: Authentication & Authorization (Supabase)

### What to Test

| Test Case | Why It Matters | How to Test |
|-----------|----------------|-------------|
| **Login flow (email/password)** | Users can't access your app | Manual: Create account → Log in → Verify session |
| **Login flow (social providers if any)** | OAuth misconfigs are common post-deploy | Manual: Test each provider end-to-end |
| **Password reset** | Users WILL forget passwords day 1 | Manual: Request reset → Check email → Complete flow |
| **Email verification** | Unverified users can cause data integrity issues | Manual: Sign up → Check inbox → Click link |
| **Session persistence** | Users get logged out randomly = rage quits | Manual: Log in → Close browser → Reopen → Still logged in? |
| **Session expiry** | Expired sessions should redirect gracefully | Manual: Wait for token expiry or manually expire in Supabase |
| **Protected route access when logged out** | Unauthenticated users see garbage or errors | Manual: Clear cookies → Navigate to `/admin`, `/vendor/*`, `/profile` |
| **Role-based access** | Regular users accessing admin = disaster | Manual: Log in as regular user → Try to access `/admin/*` directly |
| **Logout from all devices** | If offered, must actually work | Manual: Log in on two browsers → Log out → Verify other session ends |

### Pass/Fail Criteria
- ✅ **Pass:** All auth flows complete without errors, redirect correctly, sessions persist appropriately
- ❌ **Fail:** ANY auth flow throws an error, hangs, or allows unauthorized access

### Common Founder Mistakes
- Not testing password reset on production (email providers often have different behavior)
- Forgetting that Supabase auth tokens have a default 1-hour expiry
- Assuming `anon` key permissions are the same as authenticated user permissions
- Not testing what happens when auth tokens are manually tampered with

---

## Category 2: Row Level Security (RLS) Testing

### Your Specific RLS Policies (from `db_schema.sql`)

Based on your codebase, you have RLS on:
- `chat_rooms`, `chat_participants`, `chat_messages`
- `vendor_metrics_summary`, `vendor_quick_replies`, `vendor_pricing_insights`
- `vendor_leads`, `vendor_booking_calendar`, `vendor_payouts`
- `vendor_marketing_boosters`, `vendor_nudges`, `vendor_optimizer_highlights`
- `vendor_tier_metrics`

### Critical RLS Test Cases

| Test Case | Attack Vector | How to Test |
|-----------|---------------|-------------|
| **User A cannot read User B's chat messages** | Horizontal privilege escalation | Log in as User A → Try to fetch chat room ID belonging to User B via API |
| **Vendor A cannot read Vendor B's leads** | Competitor intelligence theft | Log in as Vendor A → Attempt to query `vendor_leads` with Vendor B's ID |
| **Vendor A cannot access Vendor B's payouts** | Financial data breach | Log in as Vendor A → Query `vendor_payouts` with different vendor_id |
| **Non-participant cannot read chat rooms** | Privacy violation | Log in as User → Try to fetch room where user is not a participant |
| **Regular user cannot access vendor dashboards** | Role confusion | Log in as regular user → Navigate to vendor routes |
| **Anon user cannot access authenticated tables** | Unauthenticated data leak | Use Supabase anon key → Query protected tables |

### How to Test RLS Properly

**Using Supabase SQL Editor:**
```sql
-- Impersonate a user and test policies
SET request.jwt.claim.sub = 'SOME_USER_UUID';
SET request.jwt.claim.role = 'authenticated';

-- Now try to select data that shouldn't be visible
SELECT * FROM vendor_leads WHERE vendor_id = 'DIFFERENT_VENDOR_UUID';
-- Should return 0 rows if RLS is working
```

**Using the App:**
1. Open two browser windows (or one incognito)
2. Log in as different users
3. Copy resource IDs from User A's URL
4. Paste into User B's browser
5. User B should see 403 or empty state, NOT User A's data

### Pass/Fail Criteria
- ✅ **Pass:** All cross-user data access attempts return empty results or 403
- ❌ **Fail:** ANY query returns data belonging to a different user

### Common Founder Mistakes
- Testing RLS only via the UI (attackers use curl/Postman)
- Forgetting that `service_role` key bypasses RLS (never expose it to frontend)
- Not testing DELETE policies (users can delete each other's data)
- Assuming `USING` clause covers `WITH CHECK` (it doesn't for INSERT/UPDATE)

---

## Category 3: Critical User Journeys (Your App-Specific)

### Based on Your Routes, Test These Flows

| Journey | Route Pattern | Test Steps |
|---------|---------------|------------|
| **Vendor Onboarding** | `/vendor/*` | Register → Create profile → Set up services → Publish listing |
| **Booking Flow** | `/booking` | Search → Select vendor → Book → Payment → Confirmation |
| **Chat System** | `/chat` | Start conversation → Send messages → Receive responses → Notifications |
| **Marketplace Browse** | `/marketplace/*` | Browse → Filter → View details → Contact vendor |
| **Admin Operations** | `/admin/*` | View users → Moderate content → Generate reports |
| **Hostel Listing** | `/hostels/*` | Browse → View details → Book (if applicable) |

### Pass/Fail Criteria
- ✅ **Pass:** User can complete entire journey without errors, confusion, or dead ends
- ❌ **Fail:** ANY step in the journey fails, shows cryptic error, or requires refresh

---

## Category 4: Error Handling & Observability

### What Breaks After Launch

| Problem | How to Test | What to Look For |
|---------|-------------|------------------|
| **API errors show raw JSON to users** | Trigger 500 error (disconnect Supabase briefly) | User sees friendly error message, not stack trace |
| **Network failures aren't handled** | Disable network in DevTools → Click buttons | Loading states, retry buttons, not frozen UI |
| **Supabase rate limits** | Hammer an endpoint with 100+ requests | Graceful degradation, not 429 errors in user's face |
| **Missing error boundaries** | Throw error in a component | App doesn't white-screen, shows fallback UI |
| **No logging/monitoring** | Check Vercel logs | Errors are captured with context (user ID, action, timestamp) |

### What You Must Have Before Launch

1. **Error Tracking:** Sentry, LogRocket, or Vercel's built-in
2. **Uptime Monitoring:** Vercel analytics or external (UptimeRobot)
3. **Database Monitoring:** Supabase dashboard alerts configured
4. **API Response Time Tracking:** Know when things slow down

### Pass/Fail Criteria
- ✅ **Pass:** All errors logged with context, users see friendly messages, no white screens
- ❌ **Fail:** Any error shows raw technical details to users or goes unlogged

---

## Category 5: Performance & Perceived Speed

### Core Web Vitals Checklist

| Metric | Target | How to Test | Your App Notes |
|--------|--------|-------------|----------------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Lighthouse, PageSpeed Insights | Test home page, marketplace, vendor profiles |
| **FID (First Input Delay)** | < 100ms | Lighthouse | Click buttons within first 3 seconds |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Lighthouse | Watch for images/ads causing jumps |
| **TTFB (Time to First Byte)** | < 800ms | DevTools Network tab | Supabase latency + Vercel edge |

### What Actually Matters to Users

1. **First load of homepage** - Must feel instant (< 3s)
2. **Navigation between pages** - Must not flash/flicker
3. **Search/filter responsiveness** - Results should appear < 500ms
4. **Chat real-time updates** - Messages should appear immediately
5. **Form submissions** - Buttons should show loading state, not freeze

### Tools
- Lighthouse (Chrome DevTools → Lighthouse tab)
- PageSpeed Insights (web-based)
- WebPageTest (for more detailed analysis)
- Vercel Analytics (if enabled)

### Pass/Fail Criteria
- ✅ **Pass:** All Core Web Vitals green, users don't complain about speed
- ❌ **Fail:** LCP > 4s, visible layout shifts, UI feels unresponsive

---

## Category 6: Production-Only Bugs (Vercel Specific)

### Things That Work Locally But Break on Vercel

| Issue | Why It Happens | How to Test |
|-------|----------------|-------------|
| **Environment variables missing** | Not added to Vercel dashboard | Check all pages that use env vars work |
| **API routes timeout** | Vercel has 10s limit (hobby) or 60s (pro) | Trigger slow operations (reports, bulk actions) |
| **Cold starts feel slow** | Serverless function boot time | Test after 30+ minutes of inactivity |
| **Build-time vs runtime confusion** | Data fetched at build is stale | Check if dynamic content updates properly |
| **Edge runtime limitations** | Some Node.js APIs don't work at edge | Test all API routes on production |
| **CORS issues** | Different domain/subdomain behavior | Test API calls from actual production domain |
| **Cookie domain issues** | Auth cookies not persisting | Test login on production domain (not preview URL) |

### Must-Do Before Launch

1. **Test on production URL, not preview URLs** - Cookie/CORS behavior differs
2. **Check Vercel function logs** - Look for errors not visible in browser
3. **Test after cold start** - Wait 30 min, then test critical paths
4. **Verify all env vars** - Missing SUPABASE_URL = instant crash

### Pass/Fail Criteria
- ✅ **Pass:** All features work identically on production as locally
- ❌ **Fail:** ANY feature that worked locally fails on production

---

## Category 7: First-Time User Experience (FTUE)

### The Most Neglected Testing Area

| Test | What to Check | Why |
|------|---------------|-----|
| **Empty states** | What does the app show with no data? | New users see this first |
| **Onboarding clarity** | Can a first-timer figure out what to do? | You have 30 seconds before they leave |
| **Error messages** | Are they helpful or cryptic? | "Something went wrong" = user lost forever |
| **Loading states** | Is it obvious something is happening? | Users spam-click if unsure |
| **Mobile responsiveness** | Does it work on phones? | 60%+ of users are on mobile |
| **Form validation** | Does it tell users what's wrong? | "Invalid input" = rage quit |

### FTUE Testing Protocol

1. Get someone who has never seen your app
2. Watch them (screen share, over shoulder)
3. Don't help them
4. Note every moment of confusion
5. Those confusion points = bugs

### Pass/Fail Criteria
- ✅ **Pass:** First-time user can complete core journey without asking for help
- ❌ **Fail:** First-time user gets stuck, confused, or gives up

---

## Final Testing Checklist (Pre-Launch)

### 🔴 LAUNCH BLOCKERS (Stop launch if any fail)

- [ ] Can users sign up and log in?
- [ ] Can users reset their password?
- [ ] Is sensitive data protected by RLS?
- [ ] Can User A access User B's private data? (Must be NO)
- [ ] Do all critical user journeys complete without errors?
- [ ] Are errors logged and tracked?
- [ ] Does the app work on the production URL (not just preview)?

### 🟡 HIGH RISK (Fix immediately after launch if failed)

- [ ] Is homepage LCP under 3 seconds?
- [ ] Do forms show proper validation errors?
- [ ] Do empty states look intentional, not broken?
- [ ] Does the app work on mobile?
- [ ] Are loading states visible for all async operations?

### 🟢 LOWER PRIORITY (Address in first week post-launch)

- [ ] Cross-browser testing (Safari, Firefox)
- [ ] SEO meta tags present
- [ ] Analytics tracking working
- [ ] 404 page is helpful
- [ ] Accessibility basics (keyboard nav, contrast)

---

## Reality Check: What Founders Usually Skip

### What You're Probably Not Testing

1. **RLS on DELETE operations** - Users can nuke each other's data
2. **What happens when Supabase is slow** - Your UI freezes
3. **Mobile viewport on actual devices** - Chrome DevTools lies
4. **Email delivery on production** - Works in sandbox, bounces on production
5. **What happens after 100 users, not 5** - Your queries will choke
6. **Error recovery** - Can users retry? Do they lose their work?

### What Causes Most Early Launches to Fail

| Cause | Frequency | Prevention |
|-------|-----------|------------|
| **Auth broken on production** | Very Common | Test login/signup on prod URL before announce |
| **RLS misconfigured** | Common | Manual SQL testing with different user contexts |
| **Missing env vars** | Common | Checklist of all env vars, verify each works |
| **Slow cold starts kill conversions** | Common | Pre-warm functions, optimize bundle |
| **No error visibility** | Very Common | Sentry or equivalent BEFORE launch |
| **First-time users confused** | Extremely Common | 5-minute test with stranger |

### What Must Be Proven Before Launch

1. **A stranger can sign up and complete one core action** without help
2. **You can see errors happening** in real-time (Sentry, logs)
3. **User A cannot see User B's data** (RLS tested properly)
4. **The app works after Vercel cold start** (30 min idle, then test)
5. **Password reset works on production** (not just dev)

---

## Your Testing Dashboard

Use this to track your testing progress:

### Authentication (Priority 1)
| Test | Status | Tester | Date | Notes |
|------|--------|--------|------|-------|
| Email signup | ⬜ | | | |
| Email login | ⬜ | | | |
| Password reset | ⬜ | | | |
| Session persistence | ⬜ | | | |
| Protected route redirect | ⬜ | | | |
| Role-based access | ⬜ | | | |

### RLS Security (Priority 1)
| Test | Status | Tester | Date | Notes |
|------|--------|--------|------|-------|
| Chat room isolation | ⬜ | | | |
| Vendor leads isolation | ⬜ | | | |
| Vendor payouts isolation | ⬜ | | | |
| Anon key restrictions | ⬜ | | | |

### Critical Journeys (Priority 1)
| Test | Status | Tester | Date | Notes |
|------|--------|--------|------|-------|
| Vendor onboarding | ⬜ | | | |
| Booking flow | ⬜ | | | |
| Chat messaging | ⬜ | | | |
| Marketplace browse | ⬜ | | | |

### Production Verification (Priority 2)
| Test | Status | Tester | Date | Notes |
|------|--------|--------|------|-------|
| All env vars configured | ⬜ | | | |
| Production login works | ⬜ | | | |
| Cold start performance | ⬜ | | | |
| API routes no timeout | ⬜ | | | |

---

## Hard Accountability Questions

Before you launch, you must answer these honestly:

### 1. Have you actually tested RLS with malicious intent?

Not "I set up RLS policies" but "I logged in as User A and actively tried to steal User B's data using curl/Postman, not just the UI."

If your answer is no, you have an unvalidated security assumption that could expose every user's private data.

### 2. What happens when your app throws an error to a user right now?

Go trigger a real error on production. Do you:
- See it in Sentry/logs within 60 seconds?
- Have context about which user and what they were doing?
- Show the user anything other than a white screen or "Something went wrong"?

If you don't have visibility into production errors, you will not know your app is broken until users tell you on Twitter.

### 3. Have you watched a complete stranger use your app without helping them?

Not your friend, not your cofounder, not someone who's seen a demo. Someone with zero context who represents your target user.

If they struggled at any point, those struggles will multiply by 1000x when you launch. Fix them or accept the churn.

---

## Testing Log

Track completed tests here:

| Date | Category | Test | Result | Tester | Notes |
|------|----------|------|--------|--------|-------|
| | | | | | |

---

## Recommended Testing Tools

| Purpose | Tool | Cost |
|---------|------|------|
| Error Tracking | Sentry | Free tier available |
| Uptime Monitoring | UptimeRobot | Free tier |
| Performance | Lighthouse (Chrome) | Free |
| API Testing | Postman / Insomnia | Free |
| RLS Testing | Supabase SQL Editor | Free |
| Browser Testing | BrowserStack | Paid |
| Load Testing | k6 | Free (open source) |

---

*This document should be updated as tests are completed. Mark items as ✅ completed, ⬜ pending, or ❌ failed with remediation notes.*
