
'use client';

import AnimatedCounter from "@/components/animated-counter";
import { Card, CardContent } from "@/components/ui/card";
import { type LucideIcon } from "lucide-react";

type StatCardProps = {
  value: number;
  label: string;
  icon: LucideIcon;
  isPlus?: boolean;
};

export default function StatCard({ value, label, icon: Icon, isPlus = false }: StatCardProps) {
  return (
    <Card className="text-center p-6 shadow-lg hover:shadow-2xl transition-shadow hover:-translate-y-2">
      <div className="mx-auto bg-primary/10 text-primary size-16 rounded-full flex items-center justify-center mb-4">
        <Icon className="size-8" />
      </div>
      <p className="text-4xl font-bold tracking-tighter">
        <AnimatedCounter to={value} />
        {isPlus && '+'}
      </p>
      <p className="text-muted-foreground">{label}</p>
    </Card>
  );
}
