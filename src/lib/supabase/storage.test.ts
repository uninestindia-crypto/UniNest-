import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ensureBucketExists } from './storage';

type MockBucketResponse = {
  data: unknown;
  error: { message: string } | null;
};

type MockCreateBucketResponse = {
  error: { message: string } | null;
};

type MockStorage = {
  getBucket: ReturnType<typeof vi.fn>;
  createBucket: ReturnType<typeof vi.fn>;
};

type MockSupabase = SupabaseClient & {
  storage: MockStorage;
};

const createMockSupabase = (): MockSupabase => {
  const storage: MockStorage = {
    getBucket: vi.fn(),
    createBucket: vi.fn(),
  };

  return { storage } as unknown as MockSupabase;
};

describe('ensureBucketExists', () => {
  const bucketName = 'test-bucket';
  let supabase: MockSupabase;

  beforeEach(() => {
    supabase = createMockSupabase();
  });

  it('returns success when bucket already exists', async () => {
    supabase.storage.getBucket.mockResolvedValue({ data: {}, error: null } as MockBucketResponse);

    const result = await ensureBucketExists(supabase, bucketName);

    expect(result).toEqual({ error: null });
    expect(supabase.storage.createBucket).not.toHaveBeenCalled();
  });

  it('returns error when getBucket fails for unexpected reason', async () => {
    supabase.storage.getBucket.mockResolvedValue({ data: null, error: { message: 'network issue' } } as MockBucketResponse);

    const result = await ensureBucketExists(supabase, bucketName);

    expect(result).toEqual({ error: 'network issue' });
    expect(supabase.storage.createBucket).not.toHaveBeenCalled();
  });

  it('creates bucket when not found', async () => {
    supabase.storage.getBucket.mockResolvedValue({ data: null, error: { message: 'Bucket not found' } } as MockBucketResponse);
    supabase.storage.createBucket.mockResolvedValue({ error: null } as MockCreateBucketResponse);

    const result = await ensureBucketExists(supabase, bucketName);

    expect(result).toEqual({ error: null });
    expect(supabase.storage.createBucket).toHaveBeenCalledWith(bucketName, { public: true });
  });

  it('returns error when bucket creation fails', async () => {
    supabase.storage.getBucket.mockResolvedValue({ data: null, error: { message: 'not found' } } as MockBucketResponse);
    supabase.storage.createBucket.mockResolvedValue({ error: { message: 'creation failed' } } as MockCreateBucketResponse);

    const result = await ensureBucketExists(supabase, bucketName);

    expect(result).toEqual({ error: 'creation failed' });
    expect(supabase.storage.createBucket).toHaveBeenCalledWith(bucketName, { public: true });
  });
});
