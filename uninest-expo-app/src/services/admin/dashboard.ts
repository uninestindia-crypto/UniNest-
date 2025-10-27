import { supabase } from '@/services/supabase/client';

export type AdminStatSummary = {
  revenue: number;
  donations: number;
  users: number;
  listings: number;
  donationsCount: number;
};

export type RevenueDatum = {
  name: string;
  revenue: number;
};

export type CategoryDatum = {
  name: string;
  value: number;
};

export type AggregatedDonor = {
  userId: string;
  name: string;
  avatar: string | null;
  total: number;
};

export type AdminDashboardPayload = {
  stats: AdminStatSummary;
  revenueData: RevenueDatum[];
  categoryData: CategoryDatum[];
  topDonors: AggregatedDonor[];
};

function bucketMonthlyRevenue(transactions: { amount: number; created_at: string }[]) {
  const now = new Date();
  const months: RevenueDatum[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = date.toLocaleString('default', { month: 'short', year: '2-digit' });
    months.push({ name: key, revenue: 0 });
  }

  const monthIndexMap = new Map(months.map((item, index) => [item.name, index] as const));

  transactions.forEach((transaction) => {
    const timestamp = new Date(transaction.created_at);
    if (!Number.isFinite(timestamp.valueOf())) {
      return;
    }
    const key = timestamp.toLocaleString('default', { month: 'short', year: '2-digit' });
    const bucketIndex = monthIndexMap.get(key);
    if (bucketIndex === undefined) {
      return;
    }
    months[bucketIndex].revenue += transaction.amount;
  });

  return months;
}

export async function fetchAdminDashboard(): Promise<AdminDashboardPayload> {
  const [donationsResult, competitionResult, usersResult, listingsResult, categoriesResult] = await Promise.all([
    supabase.from('donations').select('user_id, amount, created_at, profiles:profiles(full_name, avatar_url)'),
    supabase.from('competition_entries').select('competitions(entry_fee), created_at'),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('id', { count: 'exact', head: true }),
    supabase.from('products').select('category'),
  ]);

  const donations = (donationsResult.data ?? []) as {
    user_id: string;
    amount: number;
    created_at: string;
    profiles: { full_name: string | null; avatar_url: string | null } | null;
  }[];
  const competitionEntries = (competitionResult.data ?? []) as {
    competitions: { entry_fee: number | null } | null;
    created_at: string;
  }[];
  const usersCount = usersResult.count ?? 0;
  const listingsCount = listingsResult.count ?? 0;
  const productCategories = (categoriesResult.data ?? []) as { category: string | null }[];

  const donorsMap = new Map<string, AggregatedDonor>();
  let totalDonations = 0;

  donations.forEach((donation) => {
    totalDonations += donation.amount;
    const existing = donorsMap.get(donation.user_id);
    const name = donation.profiles?.full_name || 'Anonymous';
    const avatar = donation.profiles?.avatar_url ?? null;
    if (existing) {
      existing.total += donation.amount;
      if (!existing.avatar && avatar) {
        existing.avatar = avatar;
      }
      if (existing.name === 'Anonymous' && name !== 'Anonymous') {
        existing.name = name;
      }
    } else {
      donorsMap.set(donation.user_id, {
        userId: donation.user_id,
        name,
        avatar,
        total: donation.amount,
      });
    }
  });

  const competitionFees = competitionEntries.reduce(
    (sum, entry) => sum + (entry.competitions?.entry_fee ?? 0),
    0,
  );

  const allTransactions = [
    ...donations.map((donation) => ({ amount: donation.amount, created_at: donation.created_at })),
    ...competitionEntries
      .filter((entry) => (entry.competitions?.entry_fee ?? 0) > 0)
      .map((entry) => ({ amount: entry.competitions?.entry_fee ?? 0, created_at: entry.created_at })),
  ];

  const categoryBuckets = productCategories.reduce<Record<string, number>>((acc, row) => {
    const key = row.category ?? 'Uncategorized';
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const categoryData: CategoryDatum[] = Object.entries(categoryBuckets).map(([name, value]) => ({ name, value }));

  const payload: AdminDashboardPayload = {
    stats: {
      revenue: totalDonations + competitionFees,
      donations: totalDonations,
      users: usersCount,
      listings: listingsCount,
      donationsCount: donations.length,
    },
    revenueData: bucketMonthlyRevenue(allTransactions),
    categoryData,
    topDonors: Array.from(donorsMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
  };

  return payload;
}
