type SupabaseFailureContext = {
  libraryId: number | string;
  sellerId: string;
  error: unknown;
};

const supabaseFailureCounters = new Map<string, number>();

function extractErrorMetadata(error: unknown) {
  if (error instanceof Error) {
    return { message: error.message, stack: error.stack };
  }
  if (typeof error === 'object' && error !== null) {
    try {
      return { message: JSON.stringify(error) };
    } catch {
      return { message: '[unserializable_error_object]' };
    }
  }
  return { message: String(error) };
}

export function recordSupabaseAdminGetUserFailure(context: SupabaseFailureContext) {
  const counterKey = `supabase_admin_get_user:${context.sellerId}`;
  const currentCount = supabaseFailureCounters.get(counterKey) ?? 0;
  const nextCount = currentCount + 1;
  supabaseFailureCounters.set(counterKey, nextCount);

  const errorMetadata = extractErrorMetadata(context.error);

  console.error(
    JSON.stringify({
      level: 'error',
      event: 'supabase_admin_get_user_failed',
      sellerId: context.sellerId,
      libraryId: context.libraryId,
      occurrence: nextCount,
      timestamp: new Date().toISOString(),
      ...errorMetadata,
    })
  );

  if (nextCount > 1 && nextCount % 3 === 0) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        event: 'supabase_admin_get_user_repeated_failure',
        sellerId: context.sellerId,
        libraryId: context.libraryId,
        totalOccurrences: nextCount,
        timestamp: new Date().toISOString(),
      })
    );
  }
}
