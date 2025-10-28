# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Progressive Web App assets

### Generate iOS splash screens

Use the existing helper script or Progressier to produce splash assets that match the new download landing page.

```bash
npm install -g pwa-asset-generator
pwa-asset-generator public/icons/icon-1024x1024.png public/splash --splash-only --portrait-only
```

Drop the generated PNGs into `public/splash` and reference them from `app/layout.tsx` if you customise filenames.

### Track stealth installs

The `/api/analytics/pwa-install` endpoint stores install events when `SUPABASE_SERVICE_KEY` is configured. Without the key it logs installs without persistence. Client-side tracking lives in `src/utils/pwaAnalytics.ts` and is triggered by `StealthAppDownload` when the user installs the app.
