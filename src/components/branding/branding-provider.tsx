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
};

const BrandingAssetsContext = createContext<BrandingAssetsContextValue | undefined>(undefined);

type BrandingAssetsProviderProps = {
  initialAssets: BrandingAssets | null;
  children: ReactNode;
};

export function BrandingAssetsProvider({ initialAssets, children }: BrandingAssetsProviderProps) {
  const [assets, setAssets] = useState<BrandingAssets>(initialAssets ?? defaultAssets);

  useEffect(() => {
    if (!initialAssets) {
      return;
    }
    setAssets((prev) => {
      const keys: (keyof BrandingAssets)[] = [
        'logoUrl',
        'faviconUrl',
        'pwaIcon192Url',
        'pwaIcon512Url',
        'pwaIcon1024Url',
        'pwaScreenshotDesktopUrl',
        'pwaScreenshotMobileUrl',
      ];

      const isSame = keys.every((key) => prev[key] === initialAssets[key]);
      return isSame ? prev : initialAssets;
    });
  }, [
    initialAssets?.logoUrl,
    initialAssets?.faviconUrl,
    initialAssets?.pwaIcon192Url,
    initialAssets?.pwaIcon512Url,
    initialAssets?.pwaIcon1024Url,
    initialAssets?.pwaScreenshotDesktopUrl,
    initialAssets?.pwaScreenshotMobileUrl,
  ]);

  useEffect(() => {
    const faviconHref = assets.faviconUrl ?? '/favicon.ico';
    const iconHref = assets.pwaIcon192Url ?? faviconHref;

    const ensureLink = (rel: string, href: string) => {
      let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = href;
    };

    ensureLink('icon', faviconHref);
    ensureLink('shortcut icon', faviconHref);
    ensureLink('apple-touch-icon', iconHref);
  }, [assets.faviconUrl, assets.pwaIcon192Url]);

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
