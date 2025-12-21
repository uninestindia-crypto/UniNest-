# Sentry Setup Guide for UniNest

This guide will help you complete the Sentry error tracking integration.

## Step 1: Create a Sentry Account (Free)

1. Go to [sentry.io](https://sentry.io) and sign up (free tier is sufficient)
2. Create a new project:
   - Platform: **Next.js**
   - Project name: `uninest-web`
3. After creating, you'll get a DSN that looks like:
   ```
   https://abc123@o456.ingest.sentry.io/789
   ```

## Step 2: Add Environment Variables

Add these to your Vercel project AND local `.env`:

```bash
# Required: Your Sentry DSN (get from Sentry dashboard)
NEXT_PUBLIC_SENTRY_DSN=https://your-dsn-here@o123.ingest.sentry.io/456

# Optional: For source map uploads (better error traces)
SENTRY_AUTH_TOKEN=your-auth-token
SENTRY_ORG=your-org-name
SENTRY_PROJECT=uninest-web
```

### Where to add in Vercel:
1. Go to your Vercel project dashboard
2. Settings → Environment Variables
3. Add `NEXT_PUBLIC_SENTRY_DSN` for all environments (Production, Preview, Development)

## Step 3: Install Sentry Package

Run in the `apps/web` directory:

```bash
npm install @sentry/nextjs
# or
pnpm add @sentry/nextjs
```

## Step 4: Update next.config.mjs

Wrap your existing config with Sentry:

```javascript
import { withSentryConfig } from "@sentry/nextjs";

// ... your existing config ...

export default withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
}, {
  // Sentry SDK options
  hideSourceMaps: true,
  disableLogger: true,
});
```

## Step 5: Verify Setup

### Test locally:
```bash
npm run build
npm run start
```

Then visit your app and trigger an error (you can add a temporary button that throws).

### Test on production:
1. Deploy to Vercel
2. Check Vercel logs for Sentry initialization
3. Trigger an error
4. Check Sentry dashboard (may take 1-2 minutes to appear)

## Files Created

The following Sentry configuration files have been added:

| File | Purpose |
|------|---------|
| `sentry.client.config.ts` | Client-side error tracking |
| `sentry.server.config.ts` | Server-side (API routes, Server Components) |
| `sentry.edge.config.ts` | Edge runtime (middleware) |
| `sentry.config.js` | Shared configuration options |
| `src/app/global-error.tsx` | Root error boundary with Sentry |
| `src/app/error.tsx` | Updated to report to Sentry |

## What Gets Captured

Once configured, Sentry will automatically capture:

- ✅ Unhandled JavaScript errors
- ✅ React component errors
- ✅ API route errors
- ✅ Server component errors
- ✅ User browser information
- ✅ Error stack traces
- ✅ Session replay (if enabled)

## Sentry Dashboard Features

After errors start flowing:

1. **Issues** - See all errors grouped by type
2. **Performance** - Track slow pages and API routes
3. **Alerts** - Set up email/Slack notifications
4. **Releases** - Track errors by deployment

## Troubleshooting

### Error: "Sentry DSN not found"
- Make sure `NEXT_PUBLIC_SENTRY_DSN` is set in Vercel environment variables
- Redeploy after adding the variable

### Errors not appearing in Sentry
- Check browser console for Sentry initialization errors
- Sentry is disabled in development by default (check `sentry.client.config.ts`)
- It can take 1-2 minutes for errors to appear

### Source maps not uploading
- You need `SENTRY_AUTH_TOKEN` for source maps
- Generate token: Sentry Dashboard → Settings → Auth Tokens

---

## Quick Verification Checklist

- [ ] Sentry account created
- [ ] DSN added to Vercel environment variables
- [ ] `@sentry/nextjs` package installed
- [ ] `next.config.mjs` updated with Sentry wrapper
- [ ] Deployed to production
- [ ] Triggered a test error
- [ ] Error appeared in Sentry dashboard

**Once all items are checked, your error tracking is live!**
