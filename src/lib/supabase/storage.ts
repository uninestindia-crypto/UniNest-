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
