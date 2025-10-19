'use server';

import { createClient as createAdminClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import type { HomePosterConfig, HomeHeroSlide } from '@/lib/types';

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

const configSchema = z.object({
  heroSlides: z.array(slideSchema).min(1),
});

const getSupabaseAdmin = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase service role key is not configured.');
  }

  return createAdminClient(supabaseUrl, supabaseServiceKey);
};

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

    const slidesJson = formData.get('slides');
    if (typeof slidesJson !== 'string') {
      throw new Error('Invalid payload.');
    }

    const parsed = configSchema.parse({ heroSlides: JSON.parse(slidesJson) });

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

    const posterConfig: HomePosterConfig = {
      heroSlides: processedSlides,
    };

    const { error: upsertError } = await supabase
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

    await supabase.from('audit_log').insert({
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
