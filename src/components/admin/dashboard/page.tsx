
'use client';

import { DollarSign, Users, ShoppingCart, Gift } from 'lucide-react';
import StatsCard from '@/components/admin/stats-card';
import MonthlyRevenueChart from '@/components/admin/charts/monthly-revenue-chart';
import ListingsByCategoryChart from '@/components/admin/charts/listings-by-category-chart';
import TopDonorsTable from '@/components/admin/top-donors-table';

const chartColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
];

type AggregatedDonor = {
  name: string;
  userId: string;
  avatar: string | null;
  total: number;
};

type StatSummary = {
  revenue: number;
  donations: number;
  users: number;
  listings: number;
  donationsCount: number;
};

type CategoryDatum = {
  name: string;
  value: number;
};

type RevenueDatum = {
  name: string;
  revenue: number;
};

type AdminDashboardContentProps = {
  topDonors: AggregatedDonor[];
  stats: StatSummary;
  revenueData: RevenueDatum[];
  categoryData: CategoryDatum[];
};

export default function AdminDashboardContent({
  topDonors,
  stats,
  revenueData,
  categoryData,
}: AdminDashboardContentProps) {
  const categoryChartData = categoryData.map((category, index) => ({
    ...category,
    fill: chartColors[index % chartColors.length],
  }));

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Revenue (All Time)"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={DollarSign}
          change="Across all transactions"
        />
        <StatsCard
          title="Total Donations"
          value={`₹${stats.donations.toLocaleString()}`}
          icon={Gift}
          change={`${stats.donationsCount.toLocaleString()} donations`}
        />
        <StatsCard
          title="Total Users"
          value={stats.users.toLocaleString()}
          icon={Users}
          change="Signed up users"
        />
        <StatsCard
          title="Active Listings"
          value={stats.listings.toLocaleString()}
          icon={ShoppingCart}
          change="In marketplace"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <MonthlyRevenueChart data={revenueData} loading={false} />
        </div>
        <div className="lg:col-span-2">
          <ListingsByCategoryChart data={categoryChartData} loading={false} />
        </div>
      </div>
      <div className="grid grid-cols-1">
        <TopDonorsTable donors={topDonors} />
      </div>
    </>
  );
}
