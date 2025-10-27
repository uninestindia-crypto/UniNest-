import { supabase } from '@/services/supabase/client';
import type { BrandingAssets } from '@/models/branding';

export const DEFAULT_BRANDING_ASSETS: BrandingAssets = {
  logoUrl: null,
  faviconUrl: null,
  pwaIcon192Url: null,
  pwaIcon512Url: null,
  pwaIcon1024Url: null,
  pwaScreenshotDesktopUrl: null,
  pwaScreenshotMobileUrl: null,
};

export async function fetchBrandingAssets(): Promise<BrandingAssets> {
  try {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'branding_assets')
      .maybeSingle();

    if (error || !data?.value) {
      if (__DEV__) {
        console.debug('[branding] returning defaults', error);
      }
      return DEFAULT_BRANDING_ASSETS;
    }

    const value = data.value as Partial<BrandingAssets> | null;
    return {
      logoUrl: value?.logoUrl ?? null,
      faviconUrl: value?.faviconUrl ?? null,
      pwaIcon192Url: value?.pwaIcon192Url ?? null,
      pwaIcon512Url: value?.pwaIcon512Url ?? null,
      pwaIcon1024Url: value?.pwaIcon1024Url ?? null,
      pwaScreenshotDesktopUrl: value?.pwaScreenshotDesktopUrl ?? null,
      pwaScreenshotMobileUrl: value?.pwaScreenshotMobileUrl ?? null,
    };
  } catch (error) {
    console.warn('[branding] failed to load assets', error);
    return DEFAULT_BRANDING_ASSETS;
  }
}
