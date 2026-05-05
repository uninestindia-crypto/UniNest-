'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Package,
  ShoppingCart,
  Star,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp
} from 'lucide-react';

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
        if (typeof category === 'string') return category;
        if (category && typeof category === 'object') {
          return category.id || category.label || null;
        }
        return null;
      })
      .filter((category): category is string => Boolean(category))
    : [];

  return (
    <div className="mx-auto max-w-7xl space-y-6 min-w-0 pb-12 px-2 sm:px-4">
      {/* Clean Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-card border shadow-sm p-6 md:p-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome, {userName}</h1>
          <p className="mt-1 text-sm md:text-base text-muted-foreground">
            Here's what's happening with your business today.
          </p>
          {normalizedVendorCategories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {normalizedVendorCategories.map((category) => (
                <Badge key={category} variant="secondary" className="rounded-full font-medium">
                  {category.replace(/-/g, ' ').toUpperCase()}
                </Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mt-2 sm:mt-0">
          <Button asChild className="rounded-full font-semibold w-full sm:w-auto shadow-sm">
            <Link href="/vendor/products/new">
              <Plus className="mr-2 size-4" />
              New Product
            </Link>
          </Button>
        </div>
      </div>

      {/* KPI Grid - Mobile Friendly */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Active Listings</span>
              <Package className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{stats.products}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Total Orders</span>
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{stats.orders}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Revenue</span>
              <Wallet className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">₹{stats.revenue.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-4 sm:p-6 flex flex-col gap-2">
            <div className="flex items-center justify-between text-muted-foreground mb-1">
              <span className="text-xs sm:text-sm font-medium">Rating</span>
              <Star className="h-4 w-4" />
            </div>
            <div className="text-2xl sm:text-3xl font-bold">{stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links / Recent Activity section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border flex flex-col justify-between">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <TrendingUp className="h-5 w-5 text-primary" />
               Performance Overview
             </CardTitle>
             <CardDescription>View your detailed business analytics and sales trends.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
             <Button variant="secondary" className="w-full sm:w-auto" asChild>
               <Link href="/vendor/analytics">
                 View Full Analytics <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border flex flex-col justify-between">
          <CardHeader>
             <CardTitle className="flex items-center gap-2">
               <ShoppingCart className="h-5 w-5 text-primary" />
               Recent Orders
             </CardTitle>
             <CardDescription>Manage and fulfill your customer orders.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
             <Button variant="secondary" className="w-full sm:w-auto" asChild>
               <Link href="/vendor/orders">
                 Manage Orders <ArrowRight className="ml-2 h-4 w-4" />
               </Link>
             </Button>
          </CardContent>
        </Card>
      </div>

      {/* Getting Started / Empty State */}
      {stats.products === 0 && (
        <Card className="rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5 mt-6">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Package className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Get started as a vendor</h3>
            <p className="text-muted-foreground mb-6 max-w-sm px-4 mx-auto">
              Create your first listing to start selling on UniNest. Reach thousands of students looking for products and services.
            </p>
            <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
              <Link href="/vendor/products/new">
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
