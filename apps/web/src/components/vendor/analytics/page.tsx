'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Package, ShoppingCart, Wallet, Star, TrendingUp, ArrowRight, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, LineChart, Line } from 'recharts';
import { buildWeeklyOrderTrend, computeConversionStats } from '@/components/vendor/dashboard/dashboard-analytics';

type VendorAnalyticsContentProps = {
  userName: string;
  orders: { id: string | number; total_amount: number; status: string; created_at: string }[];
  products: { id: string | number; name: string; status: string; created_at: string }[];
  avgRating: number | null;
  reviewCount: number;
};

export default function VendorAnalyticsContent({
  userName,
  orders,
  products,
  avgRating,
  reviewCount,
}: VendorAnalyticsContentProps) {
  const weeklyTrend = useMemo(() => buildWeeklyOrderTrend(orders, 8), [orders]);
  const conversionStats = useMemo(() => computeConversionStats(orders), [orders]);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
  const totalOrders = orders.length;
  const activeProducts = products.filter((p) => p.status === 'active').length;

  const revenueChartData = weeklyTrend.map((w) => ({
    name: w.label,
    revenue: w.revenue,
    orders: w.total,
  }));

  const hasData = totalOrders > 0 || totalRevenue > 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12 px-2 sm:px-4">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between rounded-2xl bg-card border shadow-sm p-6">
        <div>
          <h1 className="text-2xl font-bold md:text-3xl">Analytics</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Performance overview for the last 90 days, {userName}.
          </p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/vendor/orders">
            View All Orders <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Total Orders</span>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Total Revenue</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">₹{totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Last 90 days</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Active Listings</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{activeProducts}</div>
            <p className="text-xs text-muted-foreground">Currently live</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Avg Rating</span>
              <Star className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">
              {avgRating !== null ? `${avgRating} ★` : 'No reviews'}
            </div>
            <p className="text-xs text-muted-foreground">{reviewCount} review{reviewCount !== 1 ? 's' : ''}</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {hasData ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart */}
          <Card className="shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <TrendingUp className="size-4 text-primary" />
                Weekly Revenue (₹)
              </CardTitle>
              <CardDescription>Revenue earned each week over last 8 weeks.</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueChartData.some((d) => d.revenue > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={revenueChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis
                      tick={{ fontSize: 11 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                    />
                    <Tooltip
                      formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground text-sm gap-2">
                  <BarChart3 className="size-8 opacity-30" />
                  <p>No approved orders in this period yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Orders Chart */}
          <Card className="shadow-sm rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingCart className="size-4 text-primary" />
                Weekly Orders
              </CardTitle>
              <CardDescription>Total orders placed each week.</CardDescription>
            </CardHeader>
            <CardContent>
              {revenueChartData.some((d) => d.orders > 0) ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueChartData}>
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Orders']}
                      contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="orders"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex flex-col items-center justify-center h-[220px] text-muted-foreground text-sm gap-2">
                  <ShoppingCart className="size-8 opacity-30" />
                  <p>No orders in this period yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Conversion Stats */}
          <Card className="shadow-sm rounded-2xl lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Order Breakdown</CardTitle>
              <CardDescription>Summary of how your orders are progressing.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-green-600">{conversionStats.approved}</p>
                  <p className="text-xs text-muted-foreground mt-1">Approved</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-amber-600">{conversionStats.pending}</p>
                  <p className="text-xs text-muted-foreground mt-1">Pending</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold text-red-500">{conversionStats.rejected}</p>
                  <p className="text-xs text-muted-foreground mt-1">Rejected</p>
                </div>
                <div className="rounded-xl bg-muted/50 p-4 text-center">
                  <p className="text-2xl font-bold">
                    {conversionStats.averageTicket > 0
                      ? `₹${Math.round(conversionStats.averageTicket).toLocaleString()}`
                      : '—'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Avg. Order Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="rounded-2xl border-dashed border-2 border-muted-foreground/20">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="rounded-full bg-muted p-4 mb-4">
              <BarChart3 className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No data yet</h3>
            <p className="text-muted-foreground mb-6 max-w-md text-sm">
              Once you start receiving orders, your revenue and order analytics will appear here automatically.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild>
                <Link href="/vendor/products/new">Add a Listing</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vendor/dashboard">Back to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
