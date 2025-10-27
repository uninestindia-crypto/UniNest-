import type { MetadataRoute } from 'next';
import { getBrandingAssets, getDefaultBrandingAssets } from '@/lib/branding';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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
  const fallbackIcon = brandingAssets.faviconUrl ?? brandingAssets.logoUrl ?? null;

  const icons: MetadataRoute.Manifest['icons'] = [];

  if (brandingAssets.pwaIcon192Url) {
    icons.push({
      src: brandingAssets.pwaIcon192Url,
      sizes: '192x192',
      type: 'image/png',
      purpose: 'maskable',
    });
  }

  if (brandingAssets.pwaIcon512Url) {
    icons.push({
      src: brandingAssets.pwaIcon512Url,
      sizes: '512x512',
      type: 'image/png',
      purpose: 'maskable',
    });
  }

  if (brandingAssets.pwaIcon1024Url) {
    icons.push({
      src: brandingAssets.pwaIcon1024Url,
      sizes: '1024x1024',
      type: 'image/png',
    });
  }

  if (!icons.length && fallbackIcon) {
    icons.push({
      src: fallbackIcon,
      sizes: '512x512',
      type: 'image/png',
    });
  }

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
    icons,
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
