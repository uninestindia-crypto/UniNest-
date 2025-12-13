'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import StatsCard from '@/components/vendor/stats-card';
import SalesChart from '@/components/vendor/sales-chart';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ArrowUpRight, BarChart3, CalendarRange, CheckCircle2, Flame, Info, Layers, LineChart, LaptopMinimalCheck, TrendingUp } from 'lucide-react';

const timeRanges = [
  { id: '7d', label: 'Last 7 days' },
  { id: '30d', label: 'Last 30 days' },
  { id: '90d', label: 'Last 90 days' },
] as const;

const propertySegments = [
  { id: 'all', label: 'All services' },
  { id: 'hostel', label: 'Hostels' },
  { id: 'food', label: 'Food mess' },
  { id: 'library', label: 'Library' },
  { id: 'cyber', label: 'Cyber café' },
] as const;

const kpiByRange = {
  '7d': [
    { title: 'Gross revenue', value: '₹4.8L', change: '+12% vs last week', icon: TrendingUp },
    { title: 'Bookings', value: '186', change: '+8% vs last week', icon: BarChart3 },
    { title: 'Avg. order value', value: '₹2,580', change: '+5% vs last week', icon: ArrowUpRight },
    { title: 'Repeat guests', value: '32%', change: '+4 pts vs last week', icon: Layers },
  ],
  '30d': [
    { title: 'Gross revenue', value: '₹18.2L', change: '+9% vs prior period', icon: TrendingUp },
    { title: 'Bookings', value: '712', change: '+6% vs prior period', icon: BarChart3 },
    { title: 'Avg. order value', value: '₹2,560', change: '+3% vs prior period', icon: ArrowUpRight },
    { title: 'Repeat guests', value: '29%', change: '+2 pts vs prior period', icon: Layers },
  ],
  '90d': [
    { title: 'Gross revenue', value: '₹51.5L', change: '+14% vs prior period', icon: TrendingUp },
    { title: 'Bookings', value: '2,028', change: '+11% vs prior period', icon: BarChart3 },
    { title: 'Avg. order value', value: '₹2,540', change: '+1% vs prior period', icon: ArrowUpRight },
    { title: 'Repeat guests', value: '27%', change: '+3 pts vs prior period', icon: Layers },
  ],
} as const;

const salesByRange = {
  '7d': [
    { name: 'Mon', total: 38000 },
    { name: 'Tue', total: 42000 },
    { name: 'Wed', total: 46500 },
    { name: 'Thu', total: 53000 },
    { name: 'Fri', total: 57000 },
    { name: 'Sat', total: 61000 },
    { name: 'Sun', total: 52000 },
  ],
  '30d': Array.from({ length: 30 }, (_, index) => ({ name: `Day ${index + 1}`, total: 26000 + (index % 5) * 3200 })),
  '90d': Array.from({ length: 12 }, (_, index) => ({ name: `Week ${index + 1}`, total: 210000 + index * 8500 })),
} as const;

const funnelByRange = {
  '7d': [
    { label: 'Listing views', count: 3120 },
    { label: 'Saved to shortlist', count: 1024 },
    { label: 'Inquiry sent', count: 486 },
    { label: 'Bookings confirmed', count: 186 },
  ],
  '30d': [
    { label: 'Listing views', count: 11840 },
    { label: 'Saved to shortlist', count: 3910 },
    { label: 'Inquiry sent', count: 1682 },
    { label: 'Bookings confirmed', count: 712 },
  ],
  '90d': [
    { label: 'Listing views', count: 32450 },
    { label: 'Saved to shortlist', count: 10682 },
    { label: 'Inquiry sent', count: 4580 },
    { label: 'Bookings confirmed', count: 2028 },
  ],
} as const;

const bookingsByRange = {
  '7d': [
    { id: 'BN-204', guest: 'Ananya Sen', service: 'Hostel room', status: 'Confirmed', value: '₹9,200', date: '19 Oct' },
    { id: 'BN-205', guest: 'Rahul Singh', service: 'Food mess', status: 'Pending', value: '₹2,100', date: '19 Oct' },
    { id: 'BN-198', guest: 'Ishita Verma', service: 'Library plan', status: 'Completed', value: '₹1,499', date: '18 Oct' },
    { id: 'BN-192', guest: 'Zaid Khan', service: 'Cyber café', status: 'Cancelled', value: '₹899', date: '17 Oct' },
  ],
  '30d': [
    { id: 'BN-160', guest: 'Shreya Patil', service: 'Hostel room', status: 'Completed', value: '₹10,800', date: '04 Oct' },
    { id: 'BN-141', guest: 'Vikram Rao', service: 'Food mess', status: 'Completed', value: '₹2,100', date: '28 Sep' },
    { id: 'BN-133', guest: 'Ritika Jain', service: 'Hostel room', status: 'Confirmed', value: '₹9,800', date: '26 Sep' },
    { id: 'BN-122', guest: 'Tarun Das', service: 'Library plan', status: 'Completed', value: '₹1,499', date: '23 Sep' },
  ],
  '90d': [
    { id: 'BN-085', guest: 'Sneha Roy', service: 'Hostel room', status: 'Completed', value: '₹28,500', date: '02 Aug' },
    { id: 'BN-072', guest: 'Amit Kulkarni', service: 'Food mess', status: 'Completed', value: '₹6,300', date: '24 Jul' },
    { id: 'BN-068', guest: 'Devika Nair', service: 'Cyber café', status: 'Completed', value: '₹2,699', date: '20 Jul' },
    { id: 'BN-055', guest: 'Arjun Mehta', service: 'Hostel room', status: 'Completed', value: '₹27,900', date: '12 Jul' },
  ],
} as const;

const insights = [
  {
    title: 'Improve response time',
    description: 'Vendors with under 30 min response see 22% higher conversions. Automate replies for off-hours.',
    actionLabel: 'Enable auto replies',
  },
  {
    title: 'Boost meal plan visibility',
    description: 'Add photos and menu cards to improve click-through by 18% for food mess listings.',
    actionLabel: 'Update catalog',
  },
  {
    title: 'Upsell add-ons',
    description: 'Offer laundry or shuttle services to raise average order value by ₹540 per booking.',
    actionLabel: 'Create add-on',
  },
] as const;

const statusColor: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  Confirmed: 'default',
  Completed: 'secondary',
  Pending: 'outline',
  Cancelled: 'destructive',
};

type VendorAnalyticsContentProps = {
  userName: string;
};

export default function VendorAnalyticsContent({ userName }: VendorAnalyticsContentProps) {
  const [timeRange, setTimeRange] = useState<(typeof timeRanges)[number]['id']>('7d');
  const [segment, setSegment] = useState<(typeof propertySegments)[number]['id']>('all');
  const [showQuickStart, setShowQuickStart] = useState(true);

  const kpis = useMemo(() => kpiByRange[timeRange], [timeRange]);
  const chartData = useMemo(() => salesByRange[timeRange], [timeRange]);
  const funnel = useMemo(() => funnelByRange[timeRange], [timeRange]);
  const bookings = useMemo(() => bookingsByRange[timeRange], [timeRange]);
  const maxFunnel = useMemo(() => (funnel[0]?.count || 1), [funnel]);

  const filteredBookings = useMemo(() => {
    if (segment === 'all') {
      return bookings;
    }
    return bookings.filter((item) => {
      if (segment === 'hostel') {
        return item.service.toLowerCase().includes('hostel');
      }
      if (segment === 'food') {
        return item.service.toLowerCase().includes('food');
      }
      if (segment === 'library') {
        return item.service.toLowerCase().includes('library');
      }
      if (segment === 'cyber') {
        return item.service.toLowerCase().includes('cyber');
      }
      return true;
    });
  }, [bookings, segment]);

  return (
    <div className="space-y-8">
      {showQuickStart && (
        <Alert className="flex flex-col gap-2 border-primary/40 bg-primary/5 text-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-primary" />
            <div>
              <AlertTitle>Quick start tip</AlertTitle>
              <AlertDescription>
                Use time range and service filters before drilling into tables so insights match your goals.
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowQuickStart(false)} className="self-end md:self-center">
            Got it
          </Button>
        </Alert>
      )}
      <section className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Analytics overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">Hi {userName}, track performance and uncover what drives bookings.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Select value={timeRange} onValueChange={(value) => setTimeRange(value as typeof timeRanges[number]['id'])}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <CalendarRange className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.id} value={range.id}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={segment} onValueChange={(value) => setSegment(value as typeof propertySegments[number]['id'])}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <LaptopMinimalCheck className="mr-2 size-4 text-muted-foreground" />
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent>
              {propertySegments.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <StatsCard key={kpi.title} title={kpi.title} value={kpi.value} change={kpi.change} icon={kpi.icon} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <SalesChart data={chartData} loading={false} />
        <Card className="h-full border border-muted-foreground/20 shadow-sm">
          <CardHeader>
            <CardTitle>Smart insights</CardTitle>
            <CardDescription>Tap an insight to take quick action.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {insights.map((insight) => (
              <div key={insight.title} className="rounded-lg border border-muted/40 p-4">
                <p className="text-sm font-semibold">{insight.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                <Button variant="ghost" size="sm" className="mt-3 px-0 text-primary">
                  {insight.actionLabel}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Conversion funnel</CardTitle>
              <CardDescription>Identify drop-offs and improve lead-to-booking ratio.</CardDescription>
            </div>
            <Badge variant="secondary" className="w-fit">
              {timeRanges.find((item) => item.id === timeRange)?.label}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-4">
            {funnel.map((step) => {
              const progressPercent = Math.round((step.count / maxFunnel) * 100);
              return (
                <div key={step.label} className="space-y-2 rounded-lg border border-muted/40 p-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{step.label}</span>
                    <span>{step.count.toLocaleString()}</span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <CheckCircle2 className="size-3 text-primary" />
                    <span>{progressPercent}% of initial stage</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card className="self-start border border-muted-foreground/20 shadow-sm">
          <CardHeader>
            <CardTitle>Peak booking windows</CardTitle>
            <CardDescription>Plan promotions when demand is highest.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
              <Flame className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Fridays 6–9pm</p>
                <p>Highest conversion for meal plans. Schedule flash offers before dinner rush.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
              <LineChart className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Month-end</p>
                <p>Hostel renewals spike on the 28th. Automate reminder campaigns.</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-muted/60 p-3">
              <BarChart3 className="mt-0.5 size-4 text-primary" />
              <div>
                <p className="font-semibold text-foreground">Exam weeks</p>
                <p>Library passes see 2.3× bookings. Offer bundled study snacks.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Recent bookings</CardTitle>
              <CardDescription>Monitor status and take swift actions.</CardDescription>
            </div>
            <Button variant="outline" size="sm">Export CSV</Button>
          </CardHeader>
          <CardContent>
            <div className="hidden md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Booking</TableHead>
                    <TableHead>Guest</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell className="font-medium">{booking.id}</TableCell>
                      <TableCell>{booking.guest}</TableCell>
                      <TableCell>{booking.service}</TableCell>
                      <TableCell>
                        <Badge variant={statusColor[booking.status] || 'outline'}>{booking.status}</Badge>
                      </TableCell>
                      <TableCell>{booking.value}</TableCell>
                      <TableCell>{booking.date}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            <div className="space-y-4 md:hidden">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="rounded-lg border border-muted/40 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">{booking.guest}</p>
                    <Badge variant={statusColor[booking.status] || 'outline'}>{booking.status}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{booking.id} · {booking.date}</p>
                  <p className="mt-3 text-sm">{booking.service}</p>
                  <div className="mt-3 flex items-center justify-between text-sm font-medium">
                    <span>{booking.value}</span>
                    <Button variant="ghost" size="sm" className="px-0 text-primary">Message guest</Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card className="self-start border border-muted-foreground/20 shadow-sm">
          <CardHeader>
            <CardTitle>Action planner</CardTitle>
            <CardDescription>Stay on top of growth levers each week.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border border-muted/40 p-4">
              <p className="text-sm font-semibold">Refresh listings</p>
              <p className="mt-1 text-sm text-muted-foreground">Add three new photos for hostel rooms to climb in search rank.</p>
              <Button variant="outline" size="sm" className="mt-3">Update photos</Button>
            </div>
            <div className="rounded-lg border border-muted/40 p-4">
              <p className="text-sm font-semibold">Activate retargeting</p>
              <p className="mt-1 text-sm text-muted-foreground">Send WhatsApp reminders to saved leads still deciding.</p>
              <Button variant="outline" size="sm" className="mt-3">Launch workflow</Button>
            </div>
            <div className="rounded-lg border border-muted/40 p-4">
              <p className="text-sm font-semibold">Collect reviews</p>
              <p className="mt-1 text-sm text-muted-foreground">Invite guests from the past week to share feedback.</p>
              <Button variant="outline" size="sm" className="mt-3">Send invites</Button>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
