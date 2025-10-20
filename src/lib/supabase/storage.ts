import type { SupabaseClient } from '@supabase/supabase-js';

type EnsureBucketResult = {
  error: string | null;
};

export const ensureBucketExists = async (
  supabaseAdmin: SupabaseClient,
  bucket: string,
): Promise<EnsureBucketResult> => {
  const { data, error } = await supabaseAdmin.storage.getBucket(bucket);

  if (data) {
    return { error: null };
  }

  const shouldAttemptCreate = !error || (error.message && error.message.toLowerCase().includes('not found'));

  if (!shouldAttemptCreate) {
    return { error: error?.message ?? 'Unknown error while checking bucket.' };
  }

  const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: true });

  if (createError) {
    return { error: createError.message };
  }

  return { error: null };
};

export const extractObjectPathFromPublicUrl = (publicUrl: string | null | undefined, bucket: string): string | null => {
  if (!publicUrl) {
    return null;
  }

  try {
    const url = new URL(publicUrl);
    const pattern = `/storage/v1/object/public/${bucket}/`;
    const index = url.pathname.indexOf(pattern);

    if (index === -1) {
      return null;
    }

    const relativePath = url.pathname.slice(index + pattern.length);

    if (!relativePath) {
      return null;
    }

    return decodeURIComponent(relativePath);
  } catch (error) {
    console.error('Failed to parse public URL for storage path extraction.', error);
    return null;
  }
};
