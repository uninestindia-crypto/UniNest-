'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { BrandingAssets } from '@/lib/types';

type BrandingAssetsContextValue = {
  assets: BrandingAssets;
  setBrandingAssets: (next: BrandingAssets) => void;
};

const defaultAssets: BrandingAssets = {
  logoUrl: null,
  faviconUrl: null,
  pwaIcon192Url: null,
  pwaIcon512Url: null,
  pwaIcon1024Url: null,
  pwaScreenshotDesktopUrl: null,
  pwaScreenshotMobileUrl: null,
  primaryColor: '#4338CA',
  secondaryColor: '#F97316',
  brandName: 'UniNest',
  brandDescription: '',
};

const BrandingAssetsContext = createContext<BrandingAssetsContextValue | undefined>(undefined);

type BrandingAssetsProviderProps = {
  initialAssets: BrandingAssets | null;
  children: ReactNode;
};

// Helper: Hex to HSL (Space separated for Tailwind)
function hexToHsl(hex: string): string | null {
  let c = hex.substring(1).split('');
  if (c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  if (c.length !== 6) return null;

  const r = parseInt(c[0] + c[1], 16) / 255;
  const g = parseInt(c[2] + c[3], 16) / 255;
  const b = parseInt(c[4] + c[5], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  let l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  // Round values
  h = Math.round(h * 360);
  s = Math.round(s * 100);
  l = Math.round(l * 100);

  return `${h} ${s}% ${l}%`;
}

export function BrandingAssetsProvider({ initialAssets, children }: BrandingAssetsProviderProps) {
  const [assets, setAssets] = useState<BrandingAssets>(initialAssets ?? defaultAssets);

  useEffect(() => {
    if (!initialAssets) return;

    setAssets((prev) => {
      // Deep comparison check or just simplified check
      const hasChanged = JSON.stringify(prev) !== JSON.stringify(initialAssets);
      return hasChanged ? initialAssets : prev;
    });
  }, [initialAssets]);

  // Apply Colors
  useEffect(() => {
    if (assets.primaryColor) {
      const hsl = hexToHsl(assets.primaryColor);
      if (hsl) {
        document.documentElement.style.setProperty('--primary', hsl);
        document.documentElement.style.setProperty('--ring', hsl);
        // Also update chart-1
        document.documentElement.style.setProperty('--chart-1', hsl);
      }
    }

    if (assets.secondaryColor) {
      const hsl = hexToHsl(assets.secondaryColor);
      if (hsl) {
        document.documentElement.style.setProperty('--secondary', hsl);
        // Also update chart-2
        document.documentElement.style.setProperty('--chart-2', hsl);
      }
    }
  }, [assets.primaryColor, assets.secondaryColor]);

  // Apply Favicon / Links
  useEffect(() => {
    const updateLink = (rel: string, href: string | null) => {
      const existing = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (href) {
        if (existing) {
          existing.href = href;
          return;
        }
        const link = document.createElement('link');
        link.rel = rel;
        link.href = href;
        document.head.appendChild(link);
        return;
      }
    };

    const faviconHref = assets.faviconUrl ?? null;
    const appleIconHref = assets.pwaIcon192Url ?? assets.logoUrl ?? null;

    updateLink('icon', faviconHref);
    updateLink('shortcut icon', faviconHref);
    updateLink('apple-touch-icon', appleIconHref);
  }, [assets.faviconUrl, assets.pwaIcon192Url, assets.logoUrl]);

  const value = useMemo<BrandingAssetsContextValue>(
    () => ({
      assets,
      setBrandingAssets: setAssets,
    }),
    [assets],
  );

  return <BrandingAssetsContext.Provider value={value}>{children}</BrandingAssetsContext.Provider>;
}

export function useBrandingAssets() {
  const context = useContext(BrandingAssetsContext);
  if (!context) {
    throw new Error('useBrandingAssets must be used within a BrandingAssetsProvider');
  }
  return context;
}
