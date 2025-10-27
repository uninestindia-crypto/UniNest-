import { supabase } from '@/services/supabase/client';

export type SummaryMetricTone = 'positive' | 'neutral' | 'negative';

export type SummaryMetric = {
  label: string;
  value: string;
  trend: string;
  tone: SummaryMetricTone;
  description: string;
  icon: 'TrendingUp' | 'Wallet' | 'Users' | 'Coins';
};

export type PricingDay = {
  label: string;
  occupancy: number;
  rate: string;
  demand: string;
  highlight: boolean;
};

export type CRMLead = {
  name: string;
  initials: string;
  note: string;
  status: 'new' | 'warm' | 'followup';
  time: string;
};

export type BookingSlot = {
  day: string;
  occupancy: number;
  rate: string;
  status: string;
};

export type Payout = {
  id: string;
  listing: string;
  amount: string;
  status: string;
};

export type MarketingBooster = {
  title: string;
  detail: string;
};

export type OptimizerHighlight = {
  title: string;
  detail: string;
};

export type Nudge = {
  title: string;
  detail: string;
  accentBackground: string;
  accentText: string;
};

export type TierMetric = {
  label: string;
  value: string;
  progress: number;
};

export type VendorDashboardSnapshot = {
  summaryMetrics: SummaryMetric[];
  pricingDays: PricingDay[];
  crmLeads: CRMLead[];
  quickReplies: string[];
  bookingCalendar: BookingSlot[];
  payouts: Payout[];
  marketingBoosters: MarketingBooster[];
  optimizerHighlights: OptimizerHighlight[];
  nudges: Nudge[];
  tierMetrics: TierMetric[];
};

export const FALLBACK_VENDOR_DASHBOARD: VendorDashboardSnapshot = {
  summaryMetrics: [
    {
      label: 'Occupancy rate',
      value: '82%',
      trend: '+5.4%',
      tone: 'positive',
      description: 'Average occupancy across listings (30 days).',
      icon: 'TrendingUp',
    },
    {
      label: 'Monthly revenue',
      value: '₹4.6L',
      trend: '+₹38K',
      tone: 'positive',
      description: 'Net payouts scheduled this month.',
      icon: 'Wallet',
    },
    {
      label: 'Active leads',
      value: '28',
      trend: '+7 new',
      tone: 'positive',
      description: 'Leads in pipeline ready for response.',
      icon: 'Users',
    },
    {
      label: 'Avg nightly rate',
      value: '₹9,200',
      trend: '+₹450',
      tone: 'neutral',
      description: 'Average realized rate across private rooms.',
      icon: 'Coins',
    },
  ],
  pricingDays: [
    { label: 'Mon', occupancy: 78, rate: '₹9,350', demand: 'High', highlight: true },
    { label: 'Tue', occupancy: 74, rate: '₹9,200', demand: 'Medium', highlight: false },
    { label: 'Wed', occupancy: 69, rate: '₹8,980', demand: 'Neutral', highlight: false },
    { label: 'Thu', occupancy: 86, rate: '₹9,650', demand: 'Peak', highlight: true },
    { label: 'Fri', occupancy: 91, rate: '₹9,780', demand: 'Peak', highlight: true },
    { label: 'Sat', occupancy: 88, rate: '₹9,720', demand: 'High', highlight: false },
    { label: 'Sun', occupancy: 72, rate: '₹9,180', demand: 'Medium', highlight: false },
  ],
  crmLeads: [
    { name: 'Ananya Rao', initials: 'AR', note: 'Tour requested for 24 Oct · 3 rooms', status: 'new', time: '2m ago' },
    { name: 'Rahul Singh', initials: 'RS', note: 'Follow-up on shared brochure', status: 'warm', time: '1h ago' },
    { name: 'Priya Menon', initials: 'PM', note: 'Asked for group pricing · 12 seats', status: 'followup', time: 'Yesterday' },
  ],
  quickReplies: ['Send brochure', 'Share occupancy stats', 'Schedule a call'],
  bookingCalendar: [
    { day: 'Mon', occupancy: 85, rate: '₹9,450', status: 'High demand' },
    { day: 'Tue', occupancy: 78, rate: '₹9,200', status: 'Healthy' },
    { day: 'Wed', occupancy: 67, rate: '₹8,960', status: 'Room to fill' },
    { day: 'Thu', occupancy: 92, rate: '₹9,780', status: 'Sold out' },
    { day: 'Fri', occupancy: 94, rate: '₹9,820', status: 'Peak' },
    { day: 'Sat', occupancy: 88, rate: '₹9,740', status: 'Peak' },
    { day: 'Sun', occupancy: 74, rate: '₹9,120', status: 'Moderate' },
  ],
  payouts: [
    { id: 'INV-7842', listing: 'Skyline Premium Dorms', amount: '₹82,400', status: 'Scheduled for 20 Oct' },
    { id: 'INV-7838', listing: 'UrbanStay Standard Rooms', amount: '₹64,900', status: 'Paid on 14 Oct' },
    { id: 'INV-7833', listing: 'MetroView Suites', amount: '₹1,12,000', status: 'Processing' },
  ],
  marketingBoosters: [
    { title: 'Diwali week visibility boost', detail: 'Push to top search slots · +28% clicks last year' },
    { title: 'Lounge event promotion', detail: 'Invite student clubs · includes poster template' },
    { title: 'Weekend staycation offer', detail: 'Pre-fill 2 nights bundle to drive occupancy' },
  ],
  optimizerHighlights: [
    { title: 'Upload 2 bright lobby photos', detail: 'Listings with refreshed visuals convert 34% faster.' },
    { title: 'Rewrite title with neighborhood cues', detail: 'Mention "5 mins from Tech Park" to rank higher.' },
  ],
  nudges: [
    {
      title: 'Your occupancy is 75%',
      detail: 'Add 2 new photos to improve visibility.',
      accentBackground: '#dbeafe',
      accentText: '#1d4ed8',
    },
    {
      title: 'Set your pricing to ₹9,500',
      detail: 'Matches local demand for next weekend.',
      accentBackground: '#dcfce7',
      accentText: '#047857',
    },
  ],
  tierMetrics: [
    { label: 'Response time', value: '1h 12m', progress: 82 },
    { label: 'Review score', value: '4.7 / 5', progress: 94 },
    { label: 'Stay extensions', value: '18%', progress: 68 },
  ],
};

async function fetchSummaryMetrics(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_metrics_summary')
    .select('label,value,trend,tone,description,icon')
    .eq('vendor_id', vendorId);

  if (error || !data?.length) {
    throw error ?? new Error('No summary metrics available');
  }

  return data as SummaryMetric[];
}

async function fetchPricingDays(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_pricing_insights')
    .select('label,occupancy,rate,demand,highlight')
    .eq('vendor_id', vendorId)
    .order('position', { ascending: true });

  if (error || !data?.length) {
    throw error ?? new Error('No pricing insights available');
  }

  return data as PricingDay[];
}

async function fetchCrmLeads(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_leads')
    .select('name,initials,note,status,time')
    .eq('vendor_id', vendorId)
    .order('created_at', { ascending: false })
    .limit(10);

  if (error) {
    throw error;
  }

  return (data ?? []) as CRMLead[];
}

async function fetchQuickReplies(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_quick_replies')
    .select('label')
    .eq('vendor_id', vendorId)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  if (!data?.length) {
    return FALLBACK_VENDOR_DASHBOARD.quickReplies;
  }

  return data.map((item) => item.label as string).filter(Boolean);
}

async function fetchBookingCalendar(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_booking_calendar')
    .select('day,occupancy,rate,status')
    .eq('vendor_id', vendorId)
    .order('day_index', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as BookingSlot[];
}

async function fetchPayouts(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_payouts')
    .select('id,listing,amount,status')
    .eq('vendor_id', vendorId)
    .order('scheduled_for', { ascending: false })
    .limit(5);

  if (error) {
    throw error;
  }

  return (data ?? []) as Payout[];
}

async function fetchMarketingBoosters(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_marketing_boosters')
    .select('title,detail')
    .eq('vendor_id', vendorId)
    .order('priority', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as MarketingBooster[];
}

async function fetchOptimizerHighlights(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_optimizer_highlights')
    .select('title,detail')
    .eq('vendor_id', vendorId)
    .order('priority', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as OptimizerHighlight[];
}

async function fetchNudges(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_nudges')
    .select('title,detail,accent_background,accent_text')
    .eq('vendor_id', vendorId)
    .order('priority', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []).map((item) => ({
    title: item.title as string,
    detail: item.detail as string,
    accentBackground: (item.accent_background as string) ?? '#e2e8f0',
    accentText: (item.accent_text as string) ?? '#334155',
  })) satisfies Nudge[];
}

async function fetchTierMetrics(vendorId: string) {
  const { data, error } = await supabase
    .from('vendor_tier_metrics')
    .select('label,value,progress')
    .eq('vendor_id', vendorId)
    .order('position', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? []) as TierMetric[];
}

export async function fetchVendorDashboardSnapshot(vendorId: string): Promise<VendorDashboardSnapshot> {
  if (!vendorId) {
    throw new Error('Missing vendor id');
  }

  const [summaryMetrics, pricingDays, crmLeads, quickReplies, bookingCalendar, payouts, marketingBoosters, optimizerHighlights, nudges, tierMetrics] = await Promise.all([
    fetchSummaryMetrics(vendorId),
    fetchPricingDays(vendorId),
    fetchCrmLeads(vendorId),
    fetchQuickReplies(vendorId),
    fetchBookingCalendar(vendorId),
    fetchPayouts(vendorId),
    fetchMarketingBoosters(vendorId),
    fetchOptimizerHighlights(vendorId),
    fetchNudges(vendorId),
    fetchTierMetrics(vendorId),
  ]);

  return {
    summaryMetrics,
    pricingDays,
    crmLeads,
    quickReplies,
    bookingCalendar,
    payouts,
    marketingBoosters,
    optimizerHighlights,
    nudges,
    tierMetrics,
  } satisfies VendorDashboardSnapshot;
}
