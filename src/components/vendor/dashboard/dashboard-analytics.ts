import { addWeeks, startOfWeek, format } from 'date-fns';

export type WeeklyTrendPoint = {
  weekStart: string;
  label: string;
  approved: number;
  total: number;
  revenue: number;
};

export type ConversionStats = {
  approved: number;
  pending: number;
  rejected: number;
  conversionRate: number;
  averageTicket: number;
  totalRevenue: number;
};

const WEEK_OPTIONS = { weekStartsOn: 1 as const };

export function buildWeeklyOrderTrend(orders: any[], weeks = 6): WeeklyTrendPoint[] {
  const now = startOfWeek(new Date(), WEEK_OPTIONS);
  const trendMap = new Map<string, WeeklyTrendPoint>();

  for (let offset = weeks - 1; offset >= 0; offset--) {
    const weekDate = addWeeks(now, -offset);
    const key = weekDate.toISOString();
    trendMap.set(key, {
      weekStart: key,
      label: format(weekDate, 'MMM d'),
      approved: 0,
      total: 0,
      revenue: 0,
    });
  }

  orders.forEach((order) => {
    if (!order?.created_at) return;
    const createdAt = new Date(order.created_at);
    const weekDate = startOfWeek(createdAt, WEEK_OPTIONS);
    const key = weekDate.toISOString();
    const point = trendMap.get(key);
    if (!point) return;

    point.total += 1;
    if (order.status === 'approved') {
      point.approved += 1;
      point.revenue += Number(order.total_amount) || 0;
    }
  });

  return Array.from(trendMap.values());
}

export function computeConversionStats(orders: any[]): ConversionStats {
  let approved = 0;
  let pending = 0;
  let rejected = 0;
  let approvedRevenue = 0;

  orders.forEach((order) => {
    const status = order?.status;
    if (status === 'approved') {
      approved += 1;
      approvedRevenue += Number(order.total_amount) || 0;
    } else if (status === 'pending_approval') {
      pending += 1;
    } else if (status === 'rejected') {
      rejected += 1;
    }
  });

  const considered = approved + pending + rejected;
  const conversionRate = considered > 0 ? approved / considered : 0;
  const averageTicket = approved > 0 ? approvedRevenue / approved : 0;

  return {
    approved,
    pending,
    rejected,
    conversionRate,
    averageTicket,
    totalRevenue: approvedRevenue,
  };
}
