
import PageHeader from '@/components/admin/page-header';
import AdminDashboardContent from '@/components/admin/dashboard/page';
import { createClient } from '@/lib/supabase/server';
import { subMonths, startOfMonth, format } from 'date-fns';

type DonationRow = {
  user_id: string;
  amount: number;
  created_at: string;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  } | {
    full_name: string | null;
    avatar_url: string | null;
  }[] | null;
};

type CompetitionEntryRow = {
  competitions: {
    entry_fee: number | null;
  } | {
    entry_fee: number | null;
  }[] | null;
  created_at: string;
};

type CategoryRow = {
  category: string | null;
};

export default async function AdminDashboardPage() {
  const supabase = createClient();

  const [donationsResult, competitionResult, usersResult, listingsResult, categoriesResult] = await Promise.all([
    supabase
      .from('donations')
      .select('user_id, amount, created_at, profiles(full_name, avatar_url)'),
    supabase
      .from('competition_entries')
      .select('competitions(entry_fee), created_at'),
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('products')
      .select('category'),
  ]);

  if (donationsResult.error) {
    console.error('Error fetching donations for dashboard:', donationsResult.error.message);
  }
  if (competitionResult.error) {
    console.error('Error fetching competition entries for dashboard:', competitionResult.error.message);
  }
  if (categoriesResult.error) {
    console.error('Error fetching product categories for dashboard:', categoriesResult.error.message);
  }

  const donations = (donationsResult.data ?? []) as unknown as DonationRow[];
  const competitionEntries = (competitionResult.data ?? []) as unknown as CompetitionEntryRow[];
  const productCategories = (categoriesResult.data ?? []) as CategoryRow[];
  const usersCount = usersResult.count ?? 0;
  const listingsCount = listingsResult.count ?? 0;

  const startOfCurrentMonth = startOfMonth(new Date());

  const aggregateDonations = (source: DonationRow[], predicate: (createdAt: Date) => boolean) => {
    const map = new Map<
      string,
      {
        name: string;
        avatar: string | null;
        total: number;
      }
    >();

    source.forEach((donation) => {
      const createdAt = new Date(donation.created_at);
      if (!Number.isFinite(createdAt.valueOf()) || !predicate(createdAt)) {
        return;
      }

      const profileData = Array.isArray(donation.profiles) ? donation.profiles[0] : donation.profiles;
      const existing = map.get(donation.user_id);
      const name = profileData?.full_name || 'Unknown Donor';
      const avatar = profileData?.avatar_url || null;

      if (existing) {
        existing.total += donation.amount;
      } else {
        map.set(donation.user_id, {
          name,
          avatar,
          total: donation.amount,
        });
      }
    });

    return Array.from(map.entries())
      .map(([userId, donor]) => ({
        userId,
        name: donor.name,
        avatar: donor.avatar,
        total: donor.total,
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  };

  const monthlyTopDonors = aggregateDonations(donations, (createdAt) => createdAt >= startOfCurrentMonth);
  const allTimeTopDonors = aggregateDonations(donations, () => true);
  const topDonors = monthlyTopDonors.length > 0 ? monthlyTopDonors : allTimeTopDonors;

  const totalDonations = donations.reduce((sum, donation) => sum + donation.amount, 0);
  const totalCompetitionFees = competitionEntries.reduce(
    (sum, entry) => sum + (entry.competitions?.entry_fee || 0),
    0
  );

  const stats = {
    revenue: totalDonations + totalCompetitionFees,
    donations: totalDonations,
    users: usersCount,
    listings: listingsCount,
    donationsCount: donations.length,
  };

  const allTransactions = [
    ...donations
      .filter((donation) => donation.amount > 0 && donation.created_at)
      .map((donation) => ({ amount: donation.amount, created_at: donation.created_at })),
    ...competitionEntries
      .filter((entry) => (entry.competitions?.entry_fee || 0) > 0 && entry.created_at)
      .map((entry) => ({ amount: entry.competitions?.entry_fee || 0, created_at: entry.created_at })),
  ];

  const monthlyRevenueBuckets: Record<string, number> = {};
  for (let i = 0; i < 12; i += 1) {
    const date = subMonths(new Date(), i);
    const key = format(date, 'MMM yy');
    monthlyRevenueBuckets[key] = 0;
  }

  allTransactions.forEach((transaction) => {
    const key = format(new Date(transaction.created_at), 'MMM yy');
    if (Object.prototype.hasOwnProperty.call(monthlyRevenueBuckets, key)) {
      monthlyRevenueBuckets[key] += transaction.amount;
    }
  });

  const revenueData = Object.entries(monthlyRevenueBuckets)
    .map(([name, revenue]) => ({ name, revenue }))
    .reverse();

  const recentActivity = [
    ...donations.map(d => ({
      id: `donation-${d.created_at}`,
      user: {
        name: d.profiles?.full_name || 'Anonymous',
        email: 'Donor', // We don't fetch email for donors here effectively, keeping generic
        avatar: d.profiles?.avatar_url
      },
      amount: d.amount,
      type: 'donation' as const,
      status: 'completed' as const,
      created_at: d.created_at
    })),
    ...competitionEntries.map(c => ({
      id: `comp-${c.created_at}`,
      user: {
        name: 'Competition Entrant', // We didn't fetch profile for entries in original code
        email: 'User',
        avatar: null
      },
      amount: c.competitions?.entry_fee || 0,
      type: 'competition' as const,
      status: 'completed' as const,
      created_at: c.created_at
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 6);

  const categoryCounts = productCategories.reduce((acc, { category }) => {
    const key = category || 'Uncategorized';
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const categoryData = Object.entries(categoryCounts).map(([name, value]) => ({ name, value }));

  return (
    <div className="space-y-8">
      <PageHeader title="Dashboard" description="An overview of your platform's performance." />
      <AdminDashboardContent
        topDonors={topDonors}
        stats={stats}
        revenueData={revenueData}
        categoryData={categoryData}
        recentActivity={recentActivity}
      />
    </div>
  );
}
