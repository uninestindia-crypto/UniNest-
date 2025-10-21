import { createClient } from '@supabase/supabase-js';
import type { BrandingAssets } from '@/lib/types';

const defaultBrandingAssets: BrandingAssets = {
  logoUrl: null,
  faviconUrl: null,
  pwaIcon192Url: null,
  pwaIcon512Url: null,
  pwaIcon1024Url: null,
  pwaScreenshotDesktopUrl: null,
  pwaScreenshotMobileUrl: null,
};

export async function getBrandingAssets(): Promise<BrandingAssets> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Failed to load branding assets: missing Supabase anon credentials.');
      return defaultBrandingAssets;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'branding_assets')
      .maybeSingle();

    if (error || !data?.value) {
      return defaultBrandingAssets;
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
    console.error('Failed to load branding assets:', error);
    return defaultBrandingAssets;
  }
}

export function getDefaultBrandingAssets(): BrandingAssets {
  return defaultBrandingAssets;
}
