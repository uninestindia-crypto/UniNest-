
"use client"

import * as React from "react"
import { Pie, PieChart, ResponsiveContainer, Cell } from "recharts"
import ChartCard from "../chart-card"
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { Loader2 } from "lucide-react"

type ListingsByCategoryChartProps = {
  data: { name: string; value: number; fill: string }[];
  loading: boolean;
};

const chartConfig = {
  value: {
    label: "Listings",
  },
} satisfies ChartConfig

export default function ListingsByCategoryChart({ data, loading }: ListingsByCategoryChartProps) {

  const chartData = data.map(item => ({
    ...item,
    // Add a color property to each item for the legend
    color: item.fill,
  }));

  // Dynamically create chartConfig for labels and colors
  const dynamicChartConfig: ChartConfig = data.reduce((acc, item) => {
    acc[item.name] = { label: item.name, color: item.fill };
    return acc;
  }, {} as ChartConfig);
  

  return (
    <ChartCard 
        title="Listings by Category"
        description="Distribution of active marketplace listings."
        className="flex flex-col h-full"
    >
        {loading ? (
           <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                <Loader2 className="animate-spin" />
            </div>
        ) : data.length > 0 ? (
            <ChartContainer
                config={dynamicChartConfig}
                className="mx-auto aspect-square max-h-[300px]"
            >
                <PieChart>
                    <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent hideLabel />}
                    />
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={60}
                        strokeWidth={5}
                    >
                      {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <ChartLegend
                        content={<ChartLegendContent nameKey="name" />}
                        className="-translate-y-[20px] flex-wrap gap-2 [&>*]:basis-1/3 [&>*]:justify-center"
                    />
                </PieChart>
            </ChartContainer>
        ) : (
             <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                No data available
            </div>
        )}
    </ChartCard>
  )
}
