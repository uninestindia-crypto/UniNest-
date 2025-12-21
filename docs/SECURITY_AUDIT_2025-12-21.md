# UniNest Platform Security Audit Report

**Audit Date:** 2025-12-21  
**Auditor:** Security Engineering Review  
**Platform:** UniNest - Student Platform (Next.js + Supabase + Razorpay)

---

## Executive Summary

> ⚠️ **CAUTION:** This codebase has CRITICAL security vulnerabilities that MUST be fixed before any deployment.

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 4 |
| 🟡 Medium | 5 |
| 🔵 Low | 4 |

---

## 🔴 CRITICAL Vulnerabilities

### 1. Production Secrets Committed to Git Repository

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Location** | `.env` (entire file) |

**Description:**  
Live production credentials are committed directly to the repository:
- Supabase URL and Anon Key
- **Supabase Service Role Key** (full database access)
- **Razorpay Live API Keys** (payment processing)
- **Gemini API Key**
- **Admin Email and Password**

**Exploit Scenario:**  
1. Attacker clones or accesses the repository
2. Extracts all credentials
3. Uses `SUPABASE_SERVICE_KEY` to bypass ALL Row Level Security policies
4. Can read/modify/delete ANY data in the database
5. Can process fraudulent payments with Razorpay keys
6. Full account takeover using admin credentials

**Recommended Fix:**
```diff
# .gitignore - ADD THIS LINE:
+ .env
+ .env.*
+ !.env.example
```

**IMMEDIATE ACTION REQUIRED:**
1. Rotate ALL exposed credentials immediately
2. Regenerate Supabase service key
3. Regenerate Razorpay API keys
4. Change admin password
5. Regenerate Gemini API key
6. Use proper secret management (Vercel env vars, AWS Secrets Manager, etc.)

---

### 2. Unauthenticated Admin Promotion Endpoint

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Location** | `apps/web/src/app/api/admin/promote/route.ts` |

**Description:**  
The `/api/admin/promote` endpoint accepts any POST request and promotes any registered user to admin without any authentication check.

```typescript
// NO AUTH CHECK - Anyone can call this!
export async function POST(request: NextRequest) {
    const { email } = await request.json();
    // ... directly promotes user to admin
}
```

**Exploit Scenario:**
```bash
curl -X POST https://uninest.co.in/api/admin/promote \
  -H "Content-Type: application/json" \
  -d '{"email": "attacker@example.com"}'
```
Attacker instantly gains full admin access.

**Recommended Fix:**
```typescript
export async function POST(request: NextRequest) {
    // Add authentication check
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user || user.user_metadata?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    
    // Or better: Use a one-time setup token from environment
    const setupToken = request.headers.get('X-Setup-Token');
    if (setupToken !== process.env.ADMIN_SETUP_TOKEN) {
        return NextResponse.json({ error: 'Invalid setup token' }, { status: 403 });
    }
    // ... rest of logic
}
```

---

### 3. Publicly Accessible Admin Setup Page

| Field | Value |
|-------|-------|
| **Severity** | 🔴 Critical |
| **Location** | `apps/web/src/app/admin/setup/page.tsx` + `apps/web/src/app/admin/layout.tsx` (lines 31-33) |

**Description:**  
The admin layout explicitly allows `/admin/setup` to bypass all authorization:

```typescript
// admin/layout.tsx lines 31-33
if (pathname === '/admin/setup') {
    return <>{children}</>; // NO AUTH CHECK
}
```

Combined with the unauthenticated promote API, ANY user can visit `/admin/setup` and promote themselves.

**Recommended Fix:**
1. Remove the `/admin/setup` page entirely after initial deployment
2. Or protect it with environment-based secret token validation
3. Delete `/api/admin/promote` route after first admin is created

---

## 🟠 HIGH Vulnerabilities

### 4. Client-Side Role Authorization (Bypassable)

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Location** | `apps/web/src/hooks/use-auth.tsx` (lines 36-41), `apps/web/src/app/admin/layout.tsx` (line 37) |

**Description:**  
Role is determined from `user.user_metadata?.role` and checked only on the client:

```typescript
const determineRole = (user: User | null): UserRole => {
    return user.user_metadata?.role || 'student';
}
```

Admin layout uses client-side React state for authorization:
```typescript
if (role === 'admin') {
    setIsAuthorized(true);
}
```

**Recommended Fix:**
- Implement Next.js middleware for server-side route protection
- Verify admin role on EVERY API route using server-side session validation
- Never trust client-side role state for authorization decisions

---

### 5. Self-Assignable Role During Signup

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Location** | `apps/web/src/components/auth/signup-form.tsx` (lines 140-153) |

**Description:**  
Users can set their own role during signup via user metadata:

```typescript
await supabase.auth.signUp({
    options: {
        data: {
            role: role, // User-controlled!
        }
    }
});
```

**Recommended Fix:**
- Use Supabase Database Functions/Triggers to set default role
- Never trust client-provided role values
- Use a database-stored role rather than JWT claims for authorization

---

### 6. Weak Admin Verification in promote-user Endpoint

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Location** | `apps/web/src/app/api/admin/promote-user/route.ts` (lines 14-20) |

**Description:**  
Admin check relies on client-modifiable metadata:

```typescript
if (!requestingUser || requestingUser.user_metadata?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
```

**Recommended Fix:**
- Query the `profiles` table for role instead of trusting JWT claims
- Or use Supabase custom claims with database triggers

---

### 7. Unauthenticated Payment Order Creation

| Field | Value |
|-------|-------|
| **Severity** | 🟠 High |
| **Location** | `apps/web/src/app/api/create-order/route.ts` |

**Description:**  
The `/api/create-order` endpoint has NO authentication. Anyone can create Razorpay orders.

**Recommended Fix:**
```typescript
export async function POST(request: NextRequest) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // ... rest of logic
}
```

---

## 🟡 MEDIUM Vulnerabilities

### 8. Email-Based Admin Check in Notifications API

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Location** | `apps/web/src/app/api/notifications/send/route.ts` (lines 32-36) |

**Description:**
Admin verification uses email comparison - only works for single admin.

---

### 9. Missing Rate Limiting on All Endpoints

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Location** | All API routes |

**Recommended Fix:**
- Implement rate limiting middleware (e.g., `@upstash/ratelimit`)
- Add Vercel Edge Config for rate limiting

---

### 10. No CSRF Protection

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Location** | All POST endpoints |

---

### 11. Missing Input Sanitization on User Metadata

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Location** | Multiple files |

---

### 12. Service Role Key Used Liberally

| Field | Value |
|-------|-------|
| **Severity** | 🟡 Medium |
| **Location** | Multiple API routes |

---

## 🔵 LOW Vulnerabilities

### 13-16. Minor Issues

- Hardcoded Supabase URL in HTML
- Non-Assertion Operators on Environment Variables
- Missing Content-Type Validation on File Uploads
- Error Messages Expose Implementation Details

---

## Pre-Execution Checklist

**DO NOT deploy until ALL Critical and High items are fixed:**

- [ ] 🔴 Rotate ALL exposed credentials (Supabase, Razorpay, Gemini, Admin)
- [ ] 🔴 Add `.env` to `.gitignore` 
- [ ] 🔴 Delete or protect `/api/admin/promote` endpoint
- [ ] 🔴 Remove or protect `/admin/setup` page
- [ ] 🟠 Add authentication to `/api/create-order`
- [ ] 🟠 Implement server-side role verification (middleware)
- [ ] 🟠 Remove client-side role assignment during signup
- [ ] 🟠 Verify admin role from database, not JWT claims
- [ ] 🟡 Implement rate limiting
- [ ] 🟡 Add input sanitization

---

## Hardening Recommendations

### Logging & Monitoring
- Enable Supabase Realtime logging
- Set up error monitoring (Sentry, LogRocket)
- Log all admin actions to audit table

### Secrets Management
- Use Vercel Environment Variables
- Rotate all secrets quarterly
- Use different keys for dev/staging/production

### Rate Limits
- Login: 5 attempts per minute per IP
- Signup: 3 accounts per IP per hour
- API: 100 requests per minute per user
- Payment: 10 orders per minute per user

### Security Headers
```javascript
// next.config.mjs
headers: [
    { key: 'X-Frame-Options', value: 'DENY' },
    { key: 'X-Content-Type-Options', value: 'nosniff' },
    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    { key: 'Content-Security-Policy', value: "default-src 'self'..." }
]
```

---

## Security Best Practices Missing

1. No Next.js Middleware - Route protection should be server-side
2. No Audit Logging - Admin actions are not tracked
3. No Password Complexity Requirements - Only 6 char minimum
4. No Account Lockout - After failed login attempts
5. No Email Verification Enforcement
6. No Two-Factor Authentication - For admin accounts
7. No Security Headers - CSP, HSTS, X-Frame-Options not configured
8. No Dependency Audit - package.json dependencies not scanned

---

## Final Verdict

| Question | Answer |
|----------|--------|
| **Safe to run locally?** | ⚠️ **NO** - Secrets are exposed; credentials should be rotated first |
| **Safe to deploy publicly?** | ❌ **ABSOLUTELY NOT** - Critical vulnerabilities allow instant full compromise |

**Action Required:** This platform should NOT be deployed until at minimum all Critical and High severity issues are resolved.
