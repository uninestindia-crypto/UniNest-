'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  ArrowUpRight,
  Sparkles,
  Package,
  ShoppingCart,
  Star,
  Wallet,
  BarChart3,
  Settings,
  Plus,
} from 'lucide-react';

import StatsCard from '@/components/ui/stats-card';

type VendorCategoryInput = string | { id?: string | null; label?: string | null } | null | undefined;

type VendorDashboardContentProps = {
  userName: string;
  vendorCategories: VendorCategoryInput[];
  stats: {
    products: number;
    orders: number;
    revenue: number;
    rating: number;
  };
};

export default function VendorDashboardContent({ userName, vendorCategories, stats }: VendorDashboardContentProps) {
  const normalizedVendorCategories = Array.isArray(vendorCategories)
    ? vendorCategories
      .map((category) => {
        if (typeof category === 'string') {
          return category;
        }
        if (category && typeof category === 'object') {
          if (category.id && typeof category.id === 'string') {
            return category.id;
          }
          if (category.label && typeof category.label === 'string') {
            return category.label;
          }
        }
        return null;
      })
      .filter((category): category is string => Boolean(category))
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-8 md:space-y-10 min-w-0">
      {/* Header */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between min-w-0">
        <div className="min-w-0">
          <p className="text-[10px] md:text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Vendor HQ</p>
          <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-foreground lg:text-4xl truncate">Welcome back, {userName}</h1>
          <p className="mt-2 md:mt-3 max-w-xl text-xs md:text-sm text-muted-foreground leading-relaxed">
            Manage your listings, track orders, and grow your business on UniNest.
          </p>
          {normalizedVendorCategories.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {normalizedVendorCategories.map((category) => (
                <Badge key={category} className="rounded-full bg-secondary/10 px-3 py-1 text-secondary-foreground hover:bg-secondary/20">
                  {category.replace(/-/g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Button size="lg" className="rounded-full px-6 py-2 shadow-sm" asChild>
            <Link href="/marketplace/new">
              <Plus className="mr-2 size-4" />
              Add new listing
            </Link>
          </Button>
          <Button variant="outline" size="lg" className="rounded-full px-6 py-2" asChild>
            <Link href="/vendor/orders">
              <ShoppingCart className="mr-2 size-4" />
              View orders
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards - Real data from database */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Listings"
          value={stats.products.toString()}
          icon={Package}
          description="Active products/services listed"
        />
        <StatsCard
          title="Total Orders"
          value={stats.orders.toString()}
          icon={ShoppingCart}
          description="Completed transactions"
        />
        <StatsCard
          title="Total Revenue"
          value={`₹${stats.revenue.toLocaleString()}`}
          icon={Wallet}
          description="Net earnings processed"
        />
        <StatsCard
          title="Average Rating"
          value={stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
          icon={Star}
          description="Based on customer reviews"
        />
      </div>

      {/* Quick Actions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="size-5 text-primary" />
              Manage Listings
            </CardTitle>
            <CardDescription>
              View, edit, or remove your products and services.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/vendor/products">
                Go to Products
                <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShoppingCart className="size-5 text-primary" />
              Order Management
            </CardTitle>
            <CardDescription>
              Track and manage incoming orders from customers.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/vendor/orders">
                View Orders
                <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <BarChart3 className="size-5 text-primary" />
              Analytics
            </CardTitle>
            <CardDescription>
              View performance metrics and insights.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/vendor/analytics">
                View Analytics
                <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="size-5 text-primary" />
              Create New Listing
            </CardTitle>
            <CardDescription>
              Add a new product or service to the marketplace.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full" asChild>
              <Link href="/marketplace/new">
                <Plus className="mr-2 size-4" />
                Create Listing
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border shadow-sm hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings className="size-5 text-primary" />
              Settings
            </CardTitle>
            <CardDescription>
              Manage your vendor profile and preferences.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/settings">
                Open Settings
                <ArrowUpRight className="ml-2 size-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started / Empty State */}
      {stats.products === 0 && (
        <Card className="rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Sparkles className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get started as a vendor</h3>
            <p className="text-muted-foreground mb-6 max-w-md">
              Create your first listing to start selling on UniNest. Reach thousands of students looking for products and services.
            </p>
            <Button size="lg" asChild>
              <Link href="/marketplace/new">
                <Plus className="mr-2 size-4" />
                Create Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
