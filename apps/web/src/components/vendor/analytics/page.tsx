'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BarChart3, TrendingUp, ArrowUpRight, Package, ShoppingCart, Wallet, Star } from 'lucide-react';
import StatsCard from '@/components/vendor/stats-card';

type VendorAnalyticsContentProps = {
  userName: string;
  stats?: {
    products: number;
    orders: number;
    revenue: number;
    rating: number;
  };
};

export default function VendorAnalyticsContent({ userName, stats }: VendorAnalyticsContentProps) {
  const hasData = stats && (stats.orders > 0 || stats.revenue > 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Analytics Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Hi {userName}, track your performance metrics and business insights.
          </p>
        </div>
      </section>

      {/* Stats Cards */}
      {stats && (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Listings"
            value={stats.products.toString()}
            icon={Package}
            change=""
          />
          <StatsCard
            title="Total Orders"
            value={stats.orders.toString()}
            icon={ShoppingCart}
            change=""
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            icon={Wallet}
            change=""
          />
          <StatsCard
            title="Average Rating"
            value={stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
            icon={Star}
            change=""
          />
        </section>
      )}

      {/* Analytics Content */}
      {hasData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="size-5 text-primary" />
                Revenue Trends
              </CardTitle>
              <CardDescription>
                Track your earnings over time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <BarChart3 className="size-12 mb-4 opacity-50" />
                <p>Detailed analytics charts coming soon.</p>
                <p className="text-sm mt-1">Your data is being collected and will be displayed here.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="size-5 text-primary" />
                Order History
              </CardTitle>
              <CardDescription>
                View your recent orders and transactions.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/vendor/orders">
                  View All Orders
                  <ArrowUpRight className="ml-2 size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Empty State */
        <Card className="rounded-2xl border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BarChart3 className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No analytics data yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Start selling on UniNest to see your analytics. Create listings and complete orders to generate insights.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/vendor/products/new">Create a Listing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vendor/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
