'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type {
  BrandingAssets,
  HomePosterConfig,
  HomeHeroSlide,
  HomeQuickAccessCard,
  HomeCuratedCollection,
} from '@/lib/types';
import { ensureBucketExists, extractObjectPathFromPublicUrl } from '@/lib/supabase/storage';

const slideSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  subtitle: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ctaLabel: z.string().optional().nullable(),
  ctaHref: z.string().optional().nullable(),
  secondaryCtaLabel: z.string().optional().nullable(),
  secondaryCtaHref: z.string().optional().nullable(),
  tag: z.string().optional().nullable(),
});

const optionalUrlSchema = z.union([z.string().url(), z.literal('')]);

const quickAccessSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  imageUrl: optionalUrlSchema,
  icon: z.string().optional().nullable(),
});

const curatedCollectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  imageUrl: optionalUrlSchema,
});

const configSchema = z.object({
  heroSlides: z.array(slideSchema).min(1),
  quickAccessCards: z.array(quickAccessSchema).min(1),
  curatedCollections: z.array(curatedCollectionSchema).min(1),
});

const donationMilestoneSchema = z.object({
  goal: z.number().positive().max(1_000_000),
  title: z.string().min(1).max(120),
  description: z.string().max(240).optional(),
});

const donationSettingsSchema = z.object({
  donationGoal: z.number().min(100).max(1_000_000),
  impactStudentsHelped: z.number().min(0).max(1_000_000),
  impactNotesShared: z.number().min(0).max(5_000_000),
  impactLibrariesDigitized: z.number().min(0).max(50_000),
  milestones: z.array(donationMilestoneSchema).max(12),
});

const BRANDING_BUCKET = 'branding';
const POSTER_BUCKET = 'products';

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
};

export async function updateBrandingAssets(formData: FormData) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Forbidden: Admins only.');
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error: bucketError } = await ensureBucketExists(supabaseAdmin, BRANDING_BUCKET);
    if (bucketError) {
      throw new Error(`Failed to ensure branding bucket: ${bucketError}`);
    }

    const { data: existingAssetsResponse } = await supabaseAdmin
      .from('platform_settings')
      .select('value')
      .eq('key', 'branding_assets')
      .maybeSingle();

    const currentAssets = (existingAssetsResponse?.value as Partial<BrandingAssets> | null) ?? {};

    const removeLogo = formData.get('removeLogo') === 'true';
    const removeFavicon = formData.get('removeFavicon') === 'true';

    const currentLogoPath = extractObjectPathFromPublicUrl(currentAssets.logoUrl ?? null, BRANDING_BUCKET);
    const currentFaviconPath = extractObjectPathFromPublicUrl(currentAssets.faviconUrl ?? null, BRANDING_BUCKET);

    let logoObjectPathToDelete = removeLogo ? currentLogoPath : null;
    let faviconObjectPathToDelete = removeFavicon ? currentFaviconPath : null;

    let newLogoObjectPath: string | null = null;
    let newFaviconObjectPath: string | null = null;

    let nextLogoUrl = removeLogo ? null : currentAssets.logoUrl ?? null;
    let nextFaviconUrl = removeFavicon ? null : currentAssets.faviconUrl ?? null;

    const logoFile = formData.get('logo');
    if (logoFile instanceof File && logoFile.size > 0) {
      const logoPath = `logo-${Date.now()}-${logoFile.name}`;
      newLogoObjectPath = logoPath;
      const { error: uploadError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(logoPath, logoFile, {
        contentType: logoFile.type || 'image/png',
        upsert: true,
      });

      if (uploadError) {
        throw new Error(`Failed to upload logo: ${uploadError.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(logoPath);
      nextLogoUrl = data.publicUrl;

      if (currentLogoPath) {
        logoObjectPathToDelete = currentLogoPath;
      }
    }

    const faviconFile = formData.get('favicon');
    if (faviconFile instanceof File && faviconFile.size > 0) {
      const faviconPath = `favicon-${Date.now()}-${faviconFile.name}`;
      newFaviconObjectPath = faviconPath;
      const { error: uploadError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(faviconPath, faviconFile, {
        contentType: faviconFile.type || 'image/png',
        upsert: true,
      });

      if (uploadError) {
        throw new Error(`Failed to upload favicon: ${uploadError.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(faviconPath);
      nextFaviconUrl = data.publicUrl;

      if (currentFaviconPath) {
        faviconObjectPathToDelete = currentFaviconPath;
      }
    }

    if (logoObjectPathToDelete && logoObjectPathToDelete !== newLogoObjectPath) {
      const { error: deleteLogoError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([logoObjectPathToDelete]);
      if (deleteLogoError) {
        if (newLogoObjectPath && newLogoObjectPath !== logoObjectPathToDelete) {
          await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([newLogoObjectPath]).catch(() => {});
        }
        throw new Error(`Failed to delete previous logo: ${deleteLogoError.message}`);
      }
    }

    if (faviconObjectPathToDelete && faviconObjectPathToDelete !== newFaviconObjectPath) {
      const { error: deleteFaviconError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([faviconObjectPathToDelete]);
      if (deleteFaviconError) {
        if (newFaviconObjectPath && newFaviconObjectPath !== faviconObjectPathToDelete) {
          await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([newFaviconObjectPath]).catch(() => {});
        }
        throw new Error(`Failed to delete previous favicon: ${deleteFaviconError.message}`);
      }
    }

    const assets: BrandingAssets = {
      logoUrl: nextLogoUrl,
      faviconUrl: nextFaviconUrl,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('platform_settings')
      .upsert(
        {
          key: 'branding_assets',
          value: assets,
        },
        { onConflict: 'key' },
      );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_id: user.id,
      action: 'branding_assets_update',
      details: `Updated branding assets (logo: ${assets.logoUrl ? 'set' : 'cleared'}, favicon: ${assets.faviconUrl ? 'set' : 'cleared'}).`,
    });

    revalidatePath('/');
    revalidatePath('/admin/marketing');

    return { success: true, error: null, assets };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

export async function updateDonationSettings(formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Forbidden: Admins only.');
    }

    const rawSettings = formData.get('settings');
    if (typeof rawSettings !== 'string') {
      throw new Error('Invalid payload.');
    }

    const parsed = donationSettingsSchema.parse(JSON.parse(rawSettings));

    const supabaseAdmin = getSupabaseAdmin();

    const mutations = [
      supabaseAdmin
        .from('app_config')
        .upsert({ key: 'donation_goal', value: String(parsed.donationGoal) }, { onConflict: 'key' }),
      supabaseAdmin
        .from('app_config')
        .upsert({ key: 'impact_students_helped', value: String(parsed.impactStudentsHelped) }, { onConflict: 'key' }),
      supabaseAdmin
        .from('app_config')
        .upsert({ key: 'impact_notes_shared', value: String(parsed.impactNotesShared) }, { onConflict: 'key' }),
      supabaseAdmin
        .from('app_config')
        .upsert({ key: 'impact_libraries_digitized', value: String(parsed.impactLibrariesDigitized) }, { onConflict: 'key' }),
      supabaseAdmin
        .from('app_config')
        .upsert({ key: 'donation_milestones', value: parsed.milestones }, { onConflict: 'key' }),
    ];

    const results = await Promise.all(mutations);
    const failing = results.find((result) => result.error);
    if (failing?.error) {
      throw new Error(failing.error.message);
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_id: user.id,
      action: 'donation_settings_update',
      details: `Updated donation goal to ₹${parsed.donationGoal.toLocaleString()} and ${parsed.milestones.length} milestone(s).`,
    });

    revalidatePath('/donate');
    revalidatePath('/donate/thank-you');
    revalidatePath('/admin/marketing/donations');

    return { success: true, error: null };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: message };
  }
}

const uploadPosterAsset = async (
  supabaseAdmin: SupabaseClient,
  file: File,
  pathPrefix: string,
  index: number,
): Promise<{ url: string | null; error: string | null }> => {
  if (!file || file.size === 0) {
    return { url: null, error: null };
  }

  const sanitizedName = file.name.replace(/\s+/g, '-');
  const filePath = `${pathPrefix}/${Date.now()}-${index}-${sanitizedName}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from(POSTER_BUCKET)
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabaseAdmin.storage.from(POSTER_BUCKET).getPublicUrl(filePath);
  return { url: data.publicUrl, error: null };
};

export async function updateHomePoster(formData: FormData) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.user_metadata?.role !== 'admin') {
      throw new Error('Forbidden: Admins only.');
    }

    const heroSlidesJson = formData.get('heroSlides');
    const quickAccessJson = formData.get('quickAccessCards');
    const curatedCollectionsJson = formData.get('curatedCollections');

    if (typeof heroSlidesJson !== 'string' || typeof quickAccessJson !== 'string' || typeof curatedCollectionsJson !== 'string') {
      throw new Error('Invalid payload.');
    }

    const parsed = configSchema.parse({
      heroSlides: JSON.parse(heroSlidesJson),
      quickAccessCards: JSON.parse(quickAccessJson),
      curatedCollections: JSON.parse(curatedCollectionsJson),
    });

    const supabaseAdmin = getSupabaseAdmin();

    const { error: bucketError } = await ensureBucketExists(supabaseAdmin, POSTER_BUCKET);
    if (bucketError) {
      throw new Error(`Failed to ensure poster bucket: ${bucketError}`);
    }

    const processedSlides: HomeHeroSlide[] = [];

    for (let index = 0; index < parsed.heroSlides.length; index += 1) {
      const slideInput = parsed.heroSlides[index];
      const file = formData.get(`slide-${index}-image`);

      let imageUrl = (slideInput.imageUrl ?? '').toString().trim();

      if (file instanceof File && file.size > 0) {
        const { url, error } = await uploadPosterAsset(supabaseAdmin, file, 'home-poster/slides', index);
        if (error || !url) {
          throw new Error(`Failed to upload image for slide ${index + 1}: ${error}`);
        }
        imageUrl = url;
      }

      if (!imageUrl) {
        throw new Error(`Slide ${index + 1} requires an image.`);
      }

      processedSlides.push({
        id: slideInput.id && slideInput.id.trim().length > 0 ? slideInput.id : `slide-${Date.now()}-${index}`,
        title: slideInput.title,
        subtitle: slideInput.subtitle ?? undefined,
        imageUrl,
        ctaLabel: slideInput.ctaLabel ?? undefined,
        ctaHref: slideInput.ctaHref ?? undefined,
        secondaryCtaLabel: slideInput.secondaryCtaLabel ?? undefined,
        secondaryCtaHref: slideInput.secondaryCtaHref ?? undefined,
        tag: slideInput.tag ?? undefined,
      });
    }

    const processedQuickAccessCards: HomeQuickAccessCard[] = [];

    for (let index = 0; index < parsed.quickAccessCards.length; index += 1) {
      const cardInput = parsed.quickAccessCards[index];
      const file = formData.get(`quick-${index}-image`);

      let imageUrl = (cardInput.imageUrl ?? '').toString().trim();

      if (file instanceof File && file.size > 0) {
        const { url, error } = await uploadPosterAsset(supabaseAdmin, file, 'home-poster/quick-access', index);
        if (error || !url) {
          throw new Error(`Failed to upload image for quick access card ${index + 1}: ${error}`);
        }
        imageUrl = url;
      }

      if (!imageUrl) {
        throw new Error(`Quick access card ${index + 1} requires an image.`);
      }

      processedQuickAccessCards.push({
        id: cardInput.id && cardInput.id.trim().length > 0 ? cardInput.id : `quick-${Date.now()}-${index}`,
        title: cardInput.title,
        description: cardInput.description,
        href: cardInput.href,
        imageUrl,
        icon: cardInput.icon ?? undefined,
      });
    }

    const processedCuratedCollections: HomeCuratedCollection[] = [];

    for (let index = 0; index < parsed.curatedCollections.length; index += 1) {
      const collectionInput = parsed.curatedCollections[index];
      const file = formData.get(`collection-${index}-image`);

      let imageUrl = (collectionInput.imageUrl ?? '').toString().trim();

      if (file instanceof File && file.size > 0) {
        const { url, error } = await uploadPosterAsset(supabaseAdmin, file, 'home-poster/curated-collections', index);
        if (error || !url) {
          throw new Error(`Failed to upload image for curated collection ${index + 1}: ${error}`);
        }
        imageUrl = url;
      }

      if (!imageUrl) {
        throw new Error(`Curated collection ${index + 1} requires an image.`);
      }

      processedCuratedCollections.push({
        id: collectionInput.id && collectionInput.id.trim().length > 0 ? collectionInput.id : `collection-${Date.now()}-${index}`,
        title: collectionInput.title,
        description: collectionInput.description,
        href: collectionInput.href,
        imageUrl,
      });
    }

    const posterConfig: HomePosterConfig = {
      heroSlides: processedSlides,
      quickAccessCards: processedQuickAccessCards,
      curatedCollections: processedCuratedCollections,
    };

    const { error: upsertError } = await supabaseAdmin
      .from('platform_settings')
      .upsert(
        {
          key: 'home_poster',
          value: posterConfig,
        },
        { onConflict: 'key' }
      );

    if (upsertError) {
      throw new Error(upsertError.message);
    }

    await supabaseAdmin.from('audit_log').insert({
      admin_id: user.id,
      action: 'home_poster_update',
      details: `Updated home poster with ${posterConfig.heroSlides.length} slide(s).`,
    });

    revalidatePath('/');
    revalidatePath('/admin/marketing');

    return { error: null, success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return { error: message, success: false };
  }
}
