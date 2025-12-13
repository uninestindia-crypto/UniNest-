
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatsCardProps = {
  title: string;
  value: string;
  icon: LucideIcon;
  change: string;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
};

export default function StatsCard({ title, value, icon: Icon, change, trend = 'neutral', className }: StatsCardProps) {
  return (
    <Card className={cn("overflow-hidden border-border/50 shadow-sm transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="p-2 bg-primary/10 rounded-full">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold tracking-tight">{value}</div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          {trend === 'up' && <span className="text-emerald-500 font-medium">↑</span>}
          {trend === 'down' && <span className="text-rose-500 font-medium">↓</span>}
          {change}
        </p>
      </CardContent>
    </Card>
  );
}
