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
    <div className="mx-auto max-w-7xl space-y-8 min-w-0 pb-12">
      {/* Dark Premium Hero Section from Prototype */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-6 py-10 md:px-12 md:py-16 shadow-2xl">
        {/* Subtle glow effects */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-600/20 blur-[80px]" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-purple-600/20 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
          <div>
            <div className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm mb-4">
              <Sparkles className="mr-2 h-3 w-3 text-blue-400" />
              Vendor Operations
            </div>
            <h1 className="text-3xl md:text-5xl font-semibold text-white tracking-tight">Welcome back, <br className="hidden sm:block" />{userName}</h1>
            <p className="mt-3 max-w-md text-sm md:text-base text-white/60 leading-relaxed">
              Manage your campus listings, track new orders, and monitor your business performance.
            </p>
            {normalizedVendorCategories.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {normalizedVendorCategories.map((category) => (
                  <Badge key={category} className="rounded-full border-none bg-white/10 px-3 py-1 text-white hover:bg-white/20 font-medium">
                    {category.replace(/-/g, ' ').toUpperCase()}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Button size="lg" className="rounded-full bg-white px-6 py-2 text-slate-950 hover:bg-white/90 shadow-lg font-bold" asChild>
              <Link href="/marketplace/new">
                <Plus className="mr-2 size-4 stroke-[3]" />
                New Listing
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 px-6 py-2 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm font-semibold" asChild>
              <Link href="/vendor/orders">
                <ShoppingCart className="mr-2 size-4" />
                Orders
              </Link>
            </Button>
          </div>
        </div>

        {/* Prototype Style KPI Grid */}
        <div className="relative z-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Package className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Listings</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.products}</div>
          </div>
          
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <ShoppingCart className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Orders</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.orders}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Wallet className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Revenue</span>
            </div>
            <div className="text-3xl font-bold text-white">₹{stats.revenue.toLocaleString()}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md transition-transform hover:-translate-y-1">
            <div className="flex items-center gap-2 text-white/60 mb-2">
              <Star className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Rating</span>
            </div>
            <div className="text-3xl font-bold text-white">{stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}</div>
          </div>
        </div>
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
