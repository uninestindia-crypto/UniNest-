'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  Package,
  ShoppingCart,
  Wallet,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
} from 'lucide-react';
import type { Order } from '@/lib/types';

type VendorCategoryInput = string | { id?: string | null; label?: string | null } | null | undefined;

type VendorDashboardContentProps = {
  userName: string;
  vendorCategories: VendorCategoryInput[];
  stats: {
    products: number;
    orders: number;
    revenue: number;
  };
  recentOrders: Order[];
};

const statusConfig: Record<string, { label: string; className: string }> = {
  pending_approval: { label: 'Pending', className: 'bg-amber-100 text-amber-800' },
  approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
  completed: { label: 'Completed', className: 'bg-blue-100 text-blue-800' },
  rejected: { label: 'Rejected', className: 'bg-red-100 text-red-800' },
};

export default function VendorDashboardContent({
  userName,
  vendorCategories,
  stats,
  recentOrders,
}: VendorDashboardContentProps) {
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
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-card border shadow-sm p-6 md:p-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Welcome back, {userName} 👋</h1>
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
        <Button asChild className="rounded-full font-semibold w-full sm:w-auto shadow-sm">
          <Link href="/vendor/products/new">
            <Plus className="mr-2 size-4" />
            Add Listing
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-primary/10 p-3">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Active Listings</p>
              <p className="text-2xl font-bold">{stats.products}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-blue-500/10 p-3">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Orders</p>
              <p className="text-2xl font-bold">{stats.orders}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border">
          <CardContent className="p-5 flex items-center gap-4">
            <div className="rounded-full bg-green-500/10 p-3">
              <Wallet className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total Revenue</p>
              <p className="text-2xl font-bold">₹{stats.revenue.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Clock className="size-4 text-primary" />
              Recent Orders
            </CardTitle>
            <CardDescription>Your latest 5 customer orders.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/vendor/orders">
              View all <ArrowRight className="ml-1 size-3" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          {recentOrders.length > 0 ? (
            <div className="divide-y divide-border">
              {recentOrders.map((order) => {
                const status = order.status || 'completed';
                const statusStyle = statusConfig[status] || { label: status, className: 'bg-muted text-foreground' };
                const itemNames = order.order_items
                  ?.map((item: any) => item.products?.name)
                  .filter(Boolean)
                  .join(', ');

                return (
                  <div key={order.id} className="flex items-center gap-4 px-6 py-4">
                    <Avatar className="size-9 border border-border shrink-0">
                      <AvatarImage src={order.buyer?.avatar_url || undefined} />
                      <AvatarFallback>{order.buyer?.full_name?.[0] || 'C'}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{order.buyer?.full_name || 'Customer'}</p>
                      <p className="text-xs text-muted-foreground truncate">{itemNames || 'Order'}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-semibold">₹{order.total_amount?.toLocaleString()}</p>
                      <span className={`inline-block text-[10px] px-2 py-0.5 rounded-full font-medium ${statusStyle.className}`}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground hidden sm:block shrink-0 w-20 text-right">
                      {format(new Date(order.created_at), 'dd MMM')}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <ShoppingCart className="size-8 mb-3 opacity-30" />
              <p className="text-sm">No orders yet. Share your listings to get started!</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="rounded-2xl shadow-sm border flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="h-5 w-5 text-primary" />
              Business Analytics
            </CardTitle>
            <CardDescription>Track revenue trends, order patterns, and your ratings.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Button variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href="/vendor/analytics">
                View Analytics <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-sm border flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="h-5 w-5 text-primary" />
              Manage Listings
            </CardTitle>
            <CardDescription>Edit your products, pricing, and availability.</CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <Button variant="secondary" className="w-full sm:w-auto" asChild>
              <Link href="/vendor/products">
                My Listings <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Empty State for new vendors */}
      {stats.products === 0 && (
        <Card className="rounded-2xl border-dashed border-2 border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16 text-center">
            <div className="rounded-full bg-primary/10 p-4 mb-4">
              <Package className="size-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Create your first listing</h3>
            <p className="text-muted-foreground mb-6 max-w-sm px-4 mx-auto text-sm">
              Add your hostel, food mess, library, or product and start reaching students on UniNest.
            </p>
            <Button size="lg" className="rounded-full w-full sm:w-auto" asChild>
              <Link href="/vendor/products/new">
                <Plus className="mr-2 size-4" />
                Add Your First Listing
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
