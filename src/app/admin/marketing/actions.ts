'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type {
  HomePosterConfig,
  HomeHeroSlide,
  HomeQuickAccessCard,
  HomeCuratedCollection,
} from '@/lib/types';

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

const quickAccessSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  imageUrl: z.string().url(),
  icon: z.string().optional().nullable(),
});

const curatedCollectionSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1),
  description: z.string().min(1),
  href: z.string().min(1),
  imageUrl: z.string().url(),
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

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
};

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

const uploadSlideImage = async (file: File, index: number) => {
  if (!file || file.size === 0) return { url: null, error: null };

  const supabaseAdmin = getSupabaseAdmin();
  const filePath = `home-poster/${Date.now()}-${index}-${file.name}`;

  const { error: uploadError } = await supabaseAdmin.storage
    .from('products')
    .upload(filePath, file, {
      contentType: file.type || 'image/jpeg',
      upsert: true,
    });

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const { data } = supabaseAdmin.storage.from('products').getPublicUrl(filePath);
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

    const processedSlides: HomeHeroSlide[] = [];

    for (let index = 0; index < parsed.heroSlides.length; index += 1) {
      const slideInput = parsed.heroSlides[index];
      const file = formData.get(`slide-${index}-image`);

      let imageUrl = slideInput.imageUrl ?? undefined;

      if (file instanceof File && file.size > 0) {
        const { url, error } = await uploadSlideImage(file, index);
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

    const quickAccessCards: HomeQuickAccessCard[] = parsed.quickAccessCards.map((card, index) => ({
      id: card.id && card.id.trim().length > 0 ? card.id : `quick-${Date.now()}-${index}`,
      title: card.title,
      description: card.description,
      href: card.href,
      imageUrl: card.imageUrl,
      icon: card.icon ?? undefined,
    }));

    const curatedCollections: HomeCuratedCollection[] = parsed.curatedCollections.map((collection, index) => ({
      id: collection.id && collection.id.trim().length > 0 ? collection.id : `collection-${Date.now()}-${index}`,
      title: collection.title,
      description: collection.description,
      href: collection.href,
      imageUrl: collection.imageUrl,
    }));

    const posterConfig: HomePosterConfig = {
      heroSlides: processedSlides,
      quickAccessCards,
      curatedCollections,
    };

    const supabaseAdmin = getSupabaseAdmin();

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
