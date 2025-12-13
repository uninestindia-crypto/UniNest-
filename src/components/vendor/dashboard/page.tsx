
'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ArrowRight,
  ArrowUpRight,
  Award,
  CalendarDays,
  Coins,
  Crown,
  Image,
  Info,
  MessageSquare,
  PhoneCall,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingUp,
  UploadCloud,
  Users,
  Wallet,
} from 'lucide-react';

type VendorCategoryInput = string | { id?: string | null; label?: string | null } | null | undefined;

import StatsCard from '@/components/ui/stats-card';
import { Package, ShoppingCart } from 'lucide-react';

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

// ... keep styles ...

const leadStatusStyles = {
  new: 'bg-sky-50 text-sky-600',
  warm: 'bg-amber-50 text-amber-600',
  followup: 'bg-violet-50 text-violet-600',
} as const;

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
    <TooltipProvider>
      <div className="mx-auto max-w-7xl space-y-10 px-4 py-8 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-muted-foreground">Vendor HQ</p>
            <h1 className="mt-2 text-3xl font-semibold text-foreground lg:text-4xl">Welcome back, {userName}</h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground">
              Keep occupancy, pricing, conversations, and payouts aligned from a single clean workspace.
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
            <Button size="lg" className="rounded-full px-6 py-2 shadow-sm">
              <Sparkles className="mr-2 size-4" />
              Add new listing
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-6 py-2">
              <ArrowUpRight className="mr-2 size-4" />
              Export reports
            </Button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatsCard
            title="Total Listings"
            value={stats.products.toString()}
            icon={Package}
            change="+2 new this month"
            trend="up"
            description="Active products/services listed"
          />
          <StatsCard
            title="Total Orders"
            value={stats.orders.toString()}
            icon={ShoppingCart}
            change="+12% from last month"
            trend="up"
            description="Completed transactions"
          />
          <StatsCard
            title="Total Revenue"
            value={`₹${stats.revenue.toLocaleString()}`}
            icon={Wallet}
            change="+₹4.2k this week"
            trend="up"
            description="Net earnings processed"
          />
          <StatsCard
            title="Average Rating"
            value={stats.rating.toString()}
            icon={Star}
            change="4.8/5.0"
            trend="neutral"
            description="Based on customer reviews"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm xl:col-span-7">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-slate-900">Dynamic Pricing & Insights</CardTitle>
                <Badge className="rounded-full bg-blue-50 text-xs font-semibold text-blue-600">Live</Badge>
              </div>
              <p className="text-sm text-slate-600">
                Occupancy is trending up for the coming weekend. Adjust your rates and watch profitability.
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 rounded-2xl border border-slate-100 bg-slate-50/60 p-5 sm:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Current occupancy</p>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-3xl font-semibold text-slate-900">78%</span>
                    <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">+4.2%</span>
                  </div>
                  <Progress value={78} className="mt-4 h-2 rounded-full bg-slate-200" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Market demand</p>
                  <div className="mt-3 flex items-center gap-2 text-lg font-semibold text-blue-600">
                    <Target className="size-5" />
                    High for Thu - Sun
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Based on competitor fill rates within 3 km radius.</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">Smart suggestion</p>
                  <div className="mt-3 flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
                    <span className="text-2xl font-semibold text-slate-900">₹9,500</span>
                    <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">+₹320</span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Optimised nightly rate for premium rooms.</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
                {pricingDays.map((day) => (
                  <Tooltip key={day.label}>
                    <TooltipTrigger asChild>
                      <div
                        className={`rounded-2xl border px-4 py-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${day.highlight ? 'border-blue-200 bg-white' : 'border-slate-100 bg-slate-50'
                          }`}
                      >
                        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{day.label}</p>
                        <p className="mt-2 text-xl font-semibold text-slate-900">{day.occupancy}%</p>
                        <p className="mt-1 text-xs text-slate-500">Occupancy</p>
                        <p className="mt-3 text-sm font-semibold text-blue-600">{day.rate}</p>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="text-xs font-medium text-slate-600">{day.demand}</TooltipContent>
                  </Tooltip>
                ))}
              </div>

              <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Smart queue</p>
                  <p className="text-xs text-slate-600">Apply the suggested rate across 3 listings in two clicks.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" className="rounded-full px-4 py-2">
                    Apply to premium rooms
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full px-4 py-2">
                    Adjust manually
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm xl:col-span-5">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-slate-900">Vendor CRM</CardTitle>
              <p className="text-sm text-slate-600">Reply to fresh inquiries and keep leads warm without juggling tabs.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-3">
                {crmLeads.map((lead) => (
                  <div key={lead.name} className="flex items-start justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-10 rounded-xl">
                        <AvatarFallback className="rounded-xl bg-blue-100 text-sm font-semibold text-blue-700">
                          {lead.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-slate-900">{lead.name}</p>
                          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${leadStatusStyles[lead.status]}`}>
                            {lead.status === 'new' ? 'New lead' : lead.status === 'warm' ? 'Warm' : 'Follow-up'}
                          </span>
                        </div>
                        <p className="mt-1 text-xs text-slate-600">{lead.note}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <Button variant="secondary" size="sm" className="rounded-full bg-white px-4 py-2 shadow-sm">
                            <MessageSquare className="mr-2 size-3.5" />
                            Send reply
                          </Button>
                          <Button variant="ghost" size="sm" className="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100">
                            <PhoneCall className="mr-2 size-3.5" />
                            Schedule call
                          </Button>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{lead.time}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {quickReplies.map((reply) => (
                  <Button key={reply} variant="outline" size="sm" className="rounded-full border-dashed px-4 py-2 text-xs text-slate-600">
                    {reply}
                  </Button>
                ))}
              </div>
            </CardContent>
            <CardFooter className="border-t border-slate-100 px-6 py-4">
              <div className="flex w-full items-center justify-between text-sm text-slate-500">
                <span>Inbox sorted by newest activity.</span>
                <Button variant="link" className="text-blue-600">
                  View all conversations
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm xl:col-span-8">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-slate-900">Bookings & Payments</CardTitle>
              <p className="text-sm text-slate-600">Glance through the calendar and keep payouts predictable.</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <Tabs defaultValue="bookings" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 rounded-full bg-slate-100 p-1">
                  <TabsTrigger value="bookings" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                    Calendar view
                  </TabsTrigger>
                  <TabsTrigger value="payments" className="rounded-full data-[state=active]:bg-white data-[state=active]:shadow">
                    Payout summary
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="bookings" className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {bookingCalendar.map((slot) => (
                      <div key={slot.day} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm">
                        <div className="flex items-center justify-between">
                          <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">{slot.day}</div>
                          <CalendarDays className="size-4 text-slate-400" />
                        </div>
                        <p className="mt-4 text-2xl font-semibold text-slate-900">{slot.occupancy}%</p>
                        <p className="text-xs text-slate-500">Occupancy forecast</p>
                        <p className="mt-3 text-sm font-medium text-blue-600">{slot.rate}</p>
                        <p className="mt-1 text-xs text-slate-500">{slot.status}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button variant="outline" size="sm" className="rounded-full px-4 py-2 text-xs text-slate-600">
                      Block maintenance dates
                    </Button>
                    <Button size="sm" className="rounded-full px-4 py-2 text-xs">
                      Add manual booking
                    </Button>
                  </div>
                </TabsContent>
                <TabsContent value="payments" className="space-y-4">
                  <div className="space-y-3">
                    {payouts.map((payout) => (
                      <div key={payout.id} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{payout.listing}</p>
                          <p className="text-xs text-slate-500">{payout.id}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-base font-semibold text-slate-900">{payout.amount}</p>
                          <p className="text-xs text-slate-500">{payout.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" className="rounded-full px-4 py-2 text-sm text-slate-600">
                    Download payout summary
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-100 bg-gradient-to-br from-blue-50 via-white to-blue-50 shadow-sm xl:col-span-4">
            <CardHeader className="space-y-3">
              <Badge className="w-fit rounded-full bg-blue-100 text-xs font-semibold text-blue-700">Peak season ready</Badge>
              <CardTitle className="text-lg font-semibold text-slate-900">Promotion & Marketing Booster</CardTitle>
              <p className="text-sm text-slate-600">One-click boosts keep you ahead during high-demand weeks.</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {marketingBoosters.map((item) => (
                <div key={item.title} className="rounded-2xl border border-blue-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                </div>
              ))}
            </CardContent>
            <CardFooter className="px-6 pb-6 pt-4">
              <Button className="w-full rounded-full px-4 py-2">
                Boost listing now
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="grid gap-6 xl:grid-cols-12">
          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm xl:col-span-5">
            <CardHeader className="space-y-2">
              <CardTitle className="text-lg font-semibold text-slate-900">AI Listing Optimizer</CardTitle>
              <p className="text-sm text-slate-600">Refresh photos and descriptions to climb search rankings.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 py-10 text-center">
                <UploadCloud className="size-10 text-blue-500" />
                <p className="mt-3 text-sm font-semibold text-slate-900">Drop photos or browse files</p>
                <p className="mt-1 text-xs text-slate-500">We sharpen lighting, fix alignment, and generate captions in seconds.</p>
                <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                  <Button size="sm" className="rounded-full px-4 py-2 text-xs">
                    Upload photo
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full px-4 py-2 text-xs text-slate-600">
                    Try demo listing
                  </Button>
                </div>
              </div>
              <div className="space-y-3">
                {optimizerHighlights.map((item) => (
                  <div key={item.title} className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4">
                    <Image className="mt-1 size-5 text-blue-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{item.title}</p>
                      <p className="mt-1 text-xs text-slate-600">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                {nudges.map((nudge) => (
                  <div key={nudge.title} className={`${nudge.accent} mb-2 flex items-start justify-between rounded-2xl px-4 py-3 last:mb-0`}>
                    <div>
                      <p className="text-sm font-semibold">{nudge.title}</p>
                      <p className="mt-1 text-xs opacity-80">{nudge.detail}</p>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full px-3 py-1 text-xs text-slate-600 hover:bg-white/80">
                      Action
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-3xl border border-slate-100 bg-white shadow-sm xl:col-span-7">
            <CardHeader className="space-y-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-lg font-semibold text-slate-900">Vendor Tier & Badges</CardTitle>
                  <p className="text-sm text-slate-600">Gold status unlocked · maintain momentum to reach Platinum.</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="rounded-full bg-amber-100 text-amber-700">
                    <Crown className="mr-1 size-3.5" /> Gold partner
                  </Badge>
                  <Badge variant="outline" className="rounded-full border-dashed border-blue-200 text-blue-600">
                    <ShieldCheck className="mr-1 size-3.5" /> Verified
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 lg:grid-cols-3">
                {tierMetrics.map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
                      <Star className="size-4 text-blue-500" />
                    </div>
                    <p className="mt-3 text-lg font-semibold text-slate-900">{metric.value}</p>
                    <Progress value={metric.progress} className="mt-3 h-2 rounded-full bg-slate-200" />
                  </div>
                ))}
              </div>
              <div className="rounded-2xl border border-slate-100 bg-gradient-to-r from-white via-blue-50 to-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">68% progress towards Platinum badge</p>
                    <p className="mt-1 text-xs text-slate-600">Complete 5 more five-star reviews and maintain response time under 1 hour.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" className="rounded-full px-4 py-2 text-xs">
                      View checklist
                    </Button>
                    <Button variant="outline" size="sm" className="rounded-full px-4 py-2 text-xs text-slate-600">
                      Share badge
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ShieldCheck className="size-4 text-blue-500" /> Verified listing
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Documents reviewed · visible badge increases trust by 24%.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <Award className="size-4 text-amber-500" /> Platinum preview
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Maintain 30-day satisfaction score above 4.8 to unlock.</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                    <ArrowUpRight className="size-4 text-emerald-500" /> Upsell insights
                  </div>
                  <p className="mt-2 text-xs text-slate-600">Offer late checkout and breakfast bundle for weekday stays.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  );
}
