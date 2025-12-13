import { NextResponse } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Force dynamic rendering to ensure env vars are available at runtime
export const dynamic = 'force-dynamic';

const getServiceRoleClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase configuration missing for donations stats route.');
  }

  return createSupabaseClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      persistSession: false,
    },
  });
};

const IMPACT_KEYS = {
  studentsHelped: 'impact_students_helped',
  notesShared: 'impact_notes_shared',
  librariesDigitized: 'impact_libraries_digitized',
} as const;

const DEFAULT_IMPACT = {
  studentsHelped: 4521,
  notesShared: 12300,
  librariesDigitized: 2,
};

const MILESTONE_REWARDS = [
  { goal: 5000, title: "Peer Mentorship Boost", description: "Unlock mentor office hours for freshers." },
  { goal: 15000, title: "Skill Sprint Weekend", description: "Fund campus-wide learning workshops." },
  { goal: 30000, title: "Founders' Innovation Grant", description: "Sponsor prototyping grants for student teams." },
];

type DonationRow = {
  amount: number;
  created_at: string;
  user_id: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

type AppConfigRow = {
  key: string;
  value: string | null;
};

const parseNumber = (value: string | null | undefined, fallback = 0) => {
  if (!value) return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const isMissingTableError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'PGRST205';

const computeImpactFromRaised = (raised: number) => {
  const studentsHelped = Math.max(
    DEFAULT_IMPACT.studentsHelped,
    Math.round(raised / 75)
  );

  const notesShared = Math.max(
    DEFAULT_IMPACT.notesShared,
    Math.round(studentsHelped * 2.5)
  );

  const librariesDigitized = Math.max(
    DEFAULT_IMPACT.librariesDigitized,
    Math.floor(raised / 6000)
  );

  return {
    studentsHelped,
    notesShared,
    librariesDigitized,
  };
};

export async function GET() {
  try {
    const supabase = getServiceRoleClient();

    const [donationsResult, configResult] = await Promise.all([
      supabase
        .from('donations')
        .select('amount, created_at, user_id, profiles(full_name, avatar_url)')
        .order('created_at', { ascending: false })
        .limit(200),
      supabase
        .from('app_config')
        .select('key, value')
        .in('key', [
          'donation_goal',
          IMPACT_KEYS.studentsHelped,
          IMPACT_KEYS.notesShared,
          IMPACT_KEYS.librariesDigitized,
          'donation_milestones',
        ]),
    ]);

    const donations = (() => {
      if (!donationsResult.error) {
        return (donationsResult.data ?? []) as unknown as DonationRow[];
      }
      if (isMissingTableError(donationsResult.error)) {
        console.warn('[donations/stats] donations table missing. Returning empty donations list.');
        return [] as DonationRow[];
      }
      throw donationsResult.error;
    })();

    const configEntries = (() => {
      if (!configResult.error) {
        return (configResult.data ?? []) as AppConfigRow[];
      }
      if (isMissingTableError(configResult.error)) {
        console.warn('[donations/stats] app_config table missing. Using default configuration.');
        return [] as AppConfigRow[];
      }
      throw configResult.error;
    })();

    const configMap = configEntries.reduce<Record<string, string | null>>((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const goalAmount = parseNumber(configMap['donation_goal'], 50000);
    const raisedAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const progressPercentage = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

    const computedImpact = computeImpactFromRaised(raisedAmount);
    const impact = {
      studentsHelped: parseNumber(configMap[IMPACT_KEYS.studentsHelped], computedImpact.studentsHelped),
      notesShared: parseNumber(configMap[IMPACT_KEYS.notesShared], computedImpact.notesShared),
      librariesDigitized: parseNumber(
        configMap[IMPACT_KEYS.librariesDigitized],
        computedImpact.librariesDigitized,
      ),
    };

    const configuredMilestones = (() => {
      const raw = configMap['donation_milestones'];
      if (!raw) return null;
      try {
        const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
        if (!Array.isArray(parsed)) return null;
        return parsed
          .map((item) => ({
            goal: parseNumber(item.goal, 0),
            title: typeof item.title === 'string' && item.title.length > 0 ? item.title : 'Milestone',
            description: typeof item.description === 'string' ? item.description : undefined,
          }))
          .filter((item) => item.goal > 0)
          .sort((a, b) => a.goal - b.goal);
      } catch (error) {
        console.warn('[donations/stats] failed to parse milestones config', error);
        return null;
      }
    })();

    const donorTotals = new Map<
      string,
      {
        name: string;
        avatar: string | null;
        total: number;
      }
    >();

    donations.forEach((donation) => {
      const { user_id: userId, profiles, amount } = donation;
      if (!userId) return;
      const existing = donorTotals.get(userId);
      const name = profiles?.full_name || 'Anonymous';
      const avatar = profiles?.avatar_url || null;

      if (existing) {
        existing.total += amount;
        if (!existing.avatar && avatar) {
          existing.avatar = avatar;
        }
        if (existing.name === 'Anonymous' && name !== 'Anonymous') {
          existing.name = name;
        }
      } else {
        donorTotals.set(userId, { name, avatar, total: amount });
      }
    });

    const leaderboard = Array.from(donorTotals.entries())
      .map(([userId, donor]) => ({
        userId,
        name: donor.name,
        avatar: donor.avatar,
        total: donor.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    const recentDonors = donations
      .filter((donor) => donor.amount > 0)
      .slice(0, 12)
      .map((donation) => ({
        name: donation.profiles?.full_name || 'Anonymous',
        avatar: donation.profiles?.avatar_url,
        amount: donation.amount,
      }));

    const milestonesSource = configuredMilestones ?? MILESTONE_REWARDS;
    const milestones = milestonesSource.map((milestone) => ({
      ...milestone,
      achieved: raisedAmount >= milestone.goal,
    }));

    return NextResponse.json({
      goal: {
        amount: goalAmount,
        raised: raisedAmount,
        progress: progressPercentage,
      },
      impact,
      donors: {
        leaderboard,
        recent: recentDonors,
      },
      milestones,
    }, {
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate=300',
      },
    });
  } catch (error: any) {
    console.error('[donations/stats] failed to load stats', error);
    return NextResponse.json(
      { error: 'Failed to load donation stats' },
      { status: 500 },
    );
  }
}
