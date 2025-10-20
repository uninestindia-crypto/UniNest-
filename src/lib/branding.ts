import { createClient } from '@/lib/supabase/server';
import type { BrandingAssets } from '@/lib/types';

const defaultBrandingAssets: BrandingAssets = {
  logoUrl: null,
  faviconUrl: null,
};

export async function getBrandingAssets(): Promise<BrandingAssets> {
  try {
    const supabase = createClient();
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
    };
  } catch (error) {
    console.error('Failed to load branding assets:', error);
    return defaultBrandingAssets;
  }
}

export function getDefaultBrandingAssets(): BrandingAssets {
  return defaultBrandingAssets;
}
