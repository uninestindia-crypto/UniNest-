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
      if (prev.logoUrl === initialAssets.logoUrl && prev.faviconUrl === initialAssets.faviconUrl) {
        return prev;
      }
      return initialAssets;
    });
  }, [initialAssets?.logoUrl, initialAssets?.faviconUrl]);

  useEffect(() => {
    const relValues = ['icon', 'shortcut icon', 'apple-touch-icon'];
    relValues.forEach((rel) => {
      let link = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
      }
      link.href = assets.faviconUrl ?? '/favicon.ico';
    });
  }, [assets.faviconUrl]);

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
