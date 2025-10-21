import type { MetadataRoute } from 'next';
import { getBrandingAssets, getDefaultBrandingAssets } from '@/lib/branding';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const FALLBACK_ICONS = {
  192: '/icons/icon-192x192.png',
  512: '/icons/icon-512x512.png',
  1024: '/icons/icon-1024x1024.png',
} as const;

const FALLBACK_SCREENSHOTS = {
  desktop: {
    src: '/screenshots/dashboard-desktop.png',
    sizes: '1280x720',
    type: 'image/png',
    form_factor: 'wide' as const,
  },
  mobile: {
    src: '/screenshots/dashboard-mobile.png',
    sizes: '540x960',
    type: 'image/png',
    form_factor: 'narrow' as const,
  },
};

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const brandingAssets = await getBrandingAssets().catch(() => getDefaultBrandingAssets());

  const icon192 = brandingAssets.pwaIcon192Url ?? FALLBACK_ICONS[192];
  const icon512 = brandingAssets.pwaIcon512Url ?? FALLBACK_ICONS[512];
  const icon1024 = brandingAssets.pwaIcon1024Url ?? FALLBACK_ICONS[1024];

  const desktopScreenshot = brandingAssets.pwaScreenshotDesktopUrl
    ? {
        src: brandingAssets.pwaScreenshotDesktopUrl,
        sizes: '1280x720',
        type: 'image/png',
        form_factor: 'wide' as const,
      }
    : FALLBACK_SCREENSHOTS.desktop;

  const mobileScreenshot = brandingAssets.pwaScreenshotMobileUrl
    ? {
        src: brandingAssets.pwaScreenshotMobileUrl,
        sizes: '540x960',
        type: 'image/png',
        form_factor: 'narrow' as const,
      }
    : FALLBACK_SCREENSHOTS.mobile;

  return {
    name: 'UniNest',
    short_name: 'UniNest',
    description: 'Discover and manage student housing with UniNest.',
    start_url: '/?source=pwa',
    scope: '/',
    display: 'standalone',
    orientation: 'any',
    background_color: '#0F172A',
    theme_color: '#38BDF8',
    icons: [
      {
        src: icon192,
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: icon512,
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
      {
        src: icon1024,
        sizes: '1024x1024',
        type: 'image/png',
      },
    ],
    screenshots: [desktopScreenshot, mobileScreenshot],
    shortcuts: [
      {
        name: 'Bookings',
        short_name: 'Bookings',
        url: '/dashboard/bookings',
      },
      {
        name: 'Promotions',
        short_name: 'Promos',
        url: '/dashboard/promotions',
      },
    ],
  };
}
