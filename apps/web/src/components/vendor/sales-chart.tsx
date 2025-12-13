
'use client';

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type SalesChartProps = {
    data: any[];
    loading: boolean;
}

export default function SalesChart({ data, loading }: SalesChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle>Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        {loading ? (
             <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
                Loading chart data...
            </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={data}>
              <XAxis
                dataKey="name"
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#888888"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `₹${value}`}
              />
              <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex h-[350px] w-full items-center justify-center text-muted-foreground">
            No sales data available.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

    
