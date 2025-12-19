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

    const removeFlags = {
      logo: formData.get('removeLogo') === 'true',
      favicon: formData.get('removeFavicon') === 'true',
      pwaIcon192: formData.get('removePwaIcon192') === 'true',
      pwaIcon512: formData.get('removePwaIcon512') === 'true',
      pwaIcon1024: formData.get('removePwaIcon1024') === 'true',
      screenshotDesktop: formData.get('removeScreenshotDesktop') === 'true',
      screenshotMobile: formData.get('removeScreenshotMobile') === 'true',
    } as const;

    type AssetKey = keyof typeof removeFlags;

    const currentPaths: Record<AssetKey, string | null> = {
      logo: extractObjectPathFromPublicUrl(currentAssets.logoUrl ?? null, BRANDING_BUCKET),
      favicon: extractObjectPathFromPublicUrl(currentAssets.faviconUrl ?? null, BRANDING_BUCKET),
      pwaIcon192: extractObjectPathFromPublicUrl(currentAssets.pwaIcon192Url ?? null, BRANDING_BUCKET),
      pwaIcon512: extractObjectPathFromPublicUrl(currentAssets.pwaIcon512Url ?? null, BRANDING_BUCKET),
      pwaIcon1024: extractObjectPathFromPublicUrl(currentAssets.pwaIcon1024Url ?? null, BRANDING_BUCKET),
      screenshotDesktop: extractObjectPathFromPublicUrl(currentAssets.pwaScreenshotDesktopUrl ?? null, BRANDING_BUCKET),
      screenshotMobile: extractObjectPathFromPublicUrl(currentAssets.pwaScreenshotMobileUrl ?? null, BRANDING_BUCKET),
    };

    const nextUrls: Record<AssetKey, string | null> = {
      logo: removeFlags.logo ? null : currentAssets.logoUrl ?? null,
      favicon: removeFlags.favicon ? null : currentAssets.faviconUrl ?? null,
      pwaIcon192: removeFlags.pwaIcon192 ? null : currentAssets.pwaIcon192Url ?? null,
      pwaIcon512: removeFlags.pwaIcon512 ? null : currentAssets.pwaIcon512Url ?? null,
      pwaIcon1024: removeFlags.pwaIcon1024 ? null : currentAssets.pwaIcon1024Url ?? null,
      screenshotDesktop: removeFlags.screenshotDesktop ? null : currentAssets.pwaScreenshotDesktopUrl ?? null,
      screenshotMobile: removeFlags.screenshotMobile ? null : currentAssets.pwaScreenshotMobileUrl ?? null,
    };



    const newObjectPaths: Partial<Record<AssetKey, string>> = {};
    const deleteQueue: Array<{ key: AssetKey; path: string } | null> = [];

    // Text & Color Fields
    const brandName = formData.get('brandName')?.toString() || null;
    const brandDescription = formData.get('brandDescription')?.toString() || null;
    const primaryColor = formData.get('primaryColor')?.toString() || null;
    const secondaryColor = formData.get('secondaryColor')?.toString() || null;

    const logoFile = formData.get('logo');
    if (logoFile instanceof File && logoFile.size > 0) {
      const logoPath = `logo-${Date.now()}-${logoFile.name}`;
      newObjectPaths.logo = logoPath;
      const { error: uploadError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(logoPath, logoFile, {
        contentType: logoFile.type || 'image/png',
        upsert: true,
      });

      if (uploadError) {
        throw new Error(`Failed to upload logo: ${uploadError.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(logoPath);
      nextUrls.logo = data.publicUrl;
      if (currentPaths.logo) {
        deleteQueue.push({ key: 'logo', path: currentPaths.logo });
      }
    }

    const faviconFile = formData.get('favicon');
    if (faviconFile instanceof File && faviconFile.size > 0) {
      const faviconPath = `favicon-${Date.now()}-${faviconFile.name}`;
      newObjectPaths.favicon = faviconPath;
      const { error: uploadError } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(faviconPath, faviconFile, {
        contentType: faviconFile.type || 'image/png',
        upsert: true,
      });

      if (uploadError) {
        throw new Error(`Failed to upload favicon: ${uploadError.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(faviconPath);
      nextUrls.favicon = data.publicUrl;
      if (currentPaths.favicon) {
        deleteQueue.push({ key: 'favicon', path: currentPaths.favicon });
      }
    }

    const pwaIcon192File = formData.get('pwaIcon192');
    if (pwaIcon192File instanceof File && pwaIcon192File.size > 0) {
      const iconPath = `pwa/icon-192-${Date.now()}-${pwaIcon192File.name}`;
      newObjectPaths.pwaIcon192 = iconPath;
      const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(iconPath, pwaIcon192File, {
        contentType: pwaIcon192File.type || 'image/png',
        upsert: true,
      });

      if (error) {
        throw new Error(`Failed to upload 192px icon: ${error.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(iconPath);
      nextUrls.pwaIcon192 = data.publicUrl;
      if (currentPaths.pwaIcon192) {
        deleteQueue.push({ key: 'pwaIcon192', path: currentPaths.pwaIcon192 });
      }
    }

    const pwaIcon512File = formData.get('pwaIcon512');
    if (pwaIcon512File instanceof File && pwaIcon512File.size > 0) {
      const iconPath = `pwa/icon-512-${Date.now()}-${pwaIcon512File.name}`;
      newObjectPaths.pwaIcon512 = iconPath;
      const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(iconPath, pwaIcon512File, {
        contentType: pwaIcon512File.type || 'image/png',
        upsert: true,
      });

      if (error) {
        throw new Error(`Failed to upload 512px icon: ${error.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(iconPath);
      nextUrls.pwaIcon512 = data.publicUrl;
      if (currentPaths.pwaIcon512) {
        deleteQueue.push({ key: 'pwaIcon512', path: currentPaths.pwaIcon512 });
      }
    }

    const pwaIcon1024File = formData.get('pwaIcon1024');
    if (pwaIcon1024File instanceof File && pwaIcon1024File.size > 0) {
      const iconPath = `pwa/icon-1024-${Date.now()}-${pwaIcon1024File.name}`;
      newObjectPaths.pwaIcon1024 = iconPath;
      const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(iconPath, pwaIcon1024File, {
        contentType: pwaIcon1024File.type || 'image/png',
        upsert: true,
      });

      if (error) {
        throw new Error(`Failed to upload 1024px icon: ${error.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(iconPath);
      nextUrls.pwaIcon1024 = data.publicUrl;
      if (currentPaths.pwaIcon1024) {
        deleteQueue.push({ key: 'pwaIcon1024', path: currentPaths.pwaIcon1024 });
      }
    }

    const screenshotDesktopFile = formData.get('pwaScreenshotDesktop');
    if (screenshotDesktopFile instanceof File && screenshotDesktopFile.size > 0) {
      const shotPath = `pwa/screenshot-desktop-${Date.now()}-${screenshotDesktopFile.name}`;
      newObjectPaths.screenshotDesktop = shotPath;
      const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(shotPath, screenshotDesktopFile, {
        contentType: screenshotDesktopFile.type || 'image/png',
        upsert: true,
      });

      if (error) {
        throw new Error(`Failed to upload desktop screenshot: ${error.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(shotPath);
      nextUrls.screenshotDesktop = data.publicUrl;
      if (currentPaths.screenshotDesktop) {
        deleteQueue.push({ key: 'screenshotDesktop', path: currentPaths.screenshotDesktop });
      }
    }

    const screenshotMobileFile = formData.get('pwaScreenshotMobile');
    if (screenshotMobileFile instanceof File && screenshotMobileFile.size > 0) {
      const shotPath = `pwa/screenshot-mobile-${Date.now()}-${screenshotMobileFile.name}`;
      newObjectPaths.screenshotMobile = shotPath;
      const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).upload(shotPath, screenshotMobileFile, {
        contentType: screenshotMobileFile.type || 'image/png',
        upsert: true,
      });

      if (error) {
        throw new Error(`Failed to upload mobile screenshot: ${error.message}`);
      }

      const { data } = supabaseAdmin.storage.from(BRANDING_BUCKET).getPublicUrl(shotPath);
      nextUrls.screenshotMobile = data.publicUrl;
      if (currentPaths.screenshotMobile) {
        deleteQueue.push({ key: 'screenshotMobile', path: currentPaths.screenshotMobile });
      }
    }

    await Promise.all(
      deleteQueue
        .filter((entry): entry is { key: AssetKey; path: string } => Boolean(entry?.path))
        .map(async ({ key, path }) => {
          if (!path || newObjectPaths[key] === path) {
            return;
          }
          const { error } = await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([path]);
          if (error) {
            const newPath = newObjectPaths[key];
            if (newPath && newPath !== path) {
              await supabaseAdmin.storage.from(BRANDING_BUCKET).remove([newPath]).catch(() => { });
            }
            throw new Error(`Failed to delete previous ${key}: ${error.message}`);
          }
        }),
    );

    const assets: BrandingAssets = {
      logoUrl: nextUrls.logo,
      faviconUrl: nextUrls.favicon,
      pwaIcon192Url: nextUrls.pwaIcon192,
      pwaIcon512Url: nextUrls.pwaIcon512,
      pwaIcon1024Url: nextUrls.pwaIcon1024,
      pwaScreenshotDesktopUrl: nextUrls.screenshotDesktop,
      pwaScreenshotMobileUrl: nextUrls.screenshotMobile,
      brandName,
      brandDescription,
      primaryColor,
      secondaryColor,
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
      details: `Updated branding assets (logo: ${assets.logoUrl ? 'set' : 'cleared'}, favicon: ${assets.faviconUrl ? 'set' : 'cleared'}, pwa icons/screenshots updated).`,
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
