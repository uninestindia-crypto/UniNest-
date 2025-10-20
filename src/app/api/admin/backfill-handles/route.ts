import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

type ProfileRow = {
  id: string;
  full_name: string | null;
  handle: string | null;
};

type BackfillResult = {
  id: string;
  handle: string;
};

type BackfillFailure = {
  id: string;
  error: string;
};

const MAX_HANDLE_LENGTH = 24;

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_{2,}/g, '_');

const buildCandidate = (base: string, suffix: number | null) => {
  const suffixPart = suffix ? `_${suffix}` : '';
  const trimmedBase = base.slice(0, Math.max(1, MAX_HANDLE_LENGTH - suffixPart.length));
  const candidate = `${trimmedBase}${suffixPart}`;
  return candidate.slice(0, MAX_HANDLE_LENGTH).replace(/^_+/, '').replace(/_+$/g, '');
};

export async function POST(request: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
  const adminToken = process.env.ADMIN_AUTOMATION_TOKEN;

  if (!supabaseUrl || !supabaseServiceKey) {
    return NextResponse.json({ error: 'Supabase admin credentials are not configured.' }, { status: 500 });
  }

  if (adminToken) {
    const providedToken = request.headers.get('x-api-key');
    if (providedToken !== adminToken) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });
    }
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: profiles, error: profilesError } = await supabaseAdmin
    .from('profiles')
    .select('id, full_name, handle')
    .or('handle.is.null,handle.eq.')
    .order('id');

  if (profilesError) {
    return NextResponse.json({ error: profilesError.message }, { status: 500 });
  }

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ updated: 0, failed: [], message: 'No profiles required backfill.' });
  }

  const takenHandles = new Set<string>();
  const handleExists = async (candidate: string) => {
    if (takenHandles.has(candidate)) {
      return true;
    }
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('handle', candidate)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    if (data) {
      takenHandles.add(candidate);
      return true;
    }
    return false;
  };

  const successes: BackfillResult[] = [];
  const failures: BackfillFailure[] = [];

  for (const profile of profiles as ProfileRow[]) {
    try {
      const { data: authData } = await supabaseAdmin.auth.admin.getUserById(profile.id);
      const authUser = authData?.user ?? null;

      const baseCandidates = [
        slugify(profile.full_name || ''),
        slugify((authUser?.user_metadata?.full_name as string | undefined) || ''),
        slugify((authUser?.email?.split('@')[0] as string | undefined) || ''),
      ];

      let base = baseCandidates.find((candidate) => candidate.length >= 3) ?? slugify(`uninest_user_${profile.id.slice(0, 8)}`);
      if (!base || base.length < 3) {
        base = slugify(`uninest_${Math.random().toString(36).slice(2, 10)}`);
      }

      let suffix = 0;
      let candidate = buildCandidate(base, null);

      while (candidate.length < 3 || (await handleExists(candidate))) {
        suffix += 1;
        if (suffix > 50) {
          base = slugify(`uninest_${Math.random().toString(36).slice(2, 10)}`);
          suffix = 0;
        }
        candidate = buildCandidate(base, suffix === 0 ? null : suffix);
      }

      const { error: profileUpdateError } = await supabaseAdmin
        .from('profiles')
        .update({ handle: candidate })
        .eq('id', profile.id);

      if (profileUpdateError) {
        throw new Error(profileUpdateError.message);
      }

      if (authUser) {
        const metadata = { ...(authUser.user_metadata || {}), handle: candidate };
        const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(profile.id, {
          user_metadata: metadata,
        });
        if (authUpdateError) {
          throw new Error(authUpdateError.message);
        }
      }

      takenHandles.add(candidate);
      successes.push({ id: profile.id, handle: candidate });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      failures.push({ id: profile.id, error: message });
    }
  }

  return NextResponse.json({
    updated: successes.length,
    failed: failures,
    total: profiles.length,
    sample: successes.slice(0, 10),
  });
}
