import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
  { goal: 5000, title: "Peer Mentorship Boost" },
  { goal: 15000, title: "Skill Sprint Weekend" },
  { goal: 30000, title: "Founders' Innovation Grant" },
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

export async function GET() {
  try {
    const supabase = createClient();

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
        ]),
    ]);

    if (donationsResult.error) {
      throw donationsResult.error;
    }
    if (configResult.error) {
      throw configResult.error;
    }

    const donations = (donationsResult.data ?? []) as DonationRow[];
    const configEntries = (configResult.data ?? []) as AppConfigRow[];

    const configMap = configEntries.reduce<Record<string, string | null>>((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {});

    const goalAmount = parseNumber(configMap['donation_goal'], 50000);
    const raisedAmount = donations.reduce((sum, donation) => sum + donation.amount, 0);
    const progressPercentage = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;

    const impact = {
      studentsHelped: parseNumber(configMap[IMPACT_KEYS.studentsHelped], DEFAULT_IMPACT.studentsHelped),
      notesShared: parseNumber(configMap[IMPACT_KEYS.notesShared], DEFAULT_IMPACT.notesShared),
      librariesDigitized: parseNumber(
        configMap[IMPACT_KEYS.librariesDigitized],
        DEFAULT_IMPACT.librariesDigitized,
      ),
    };

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

    const milestones = MILESTONE_REWARDS.map((milestone) => ({
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
    });
  } catch (error: any) {
    console.error('[donations/stats] failed to load stats', error);
    return NextResponse.json(
      { error: 'Failed to load donation stats' },
      { status: 500 },
    );
  }
}
