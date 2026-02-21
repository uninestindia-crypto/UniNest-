'use client';

import { MapPin, IndianRupee, Star, Bed, BookOpen, UtensilsCrossed, Package, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

type MarketplaceItem = {
    id: number;
    name: string;
    price: number;
    location: string | null;
    description: string | null;
    image_url: string | null;
    category: string;
    amenities?: string[] | null;
    total_seats?: number | null;
};

const categoryIcons: Record<string, any> = {
    Hostels: Bed,
    Library: BookOpen,
    'Food Mess': UtensilsCrossed,
    'Other Products': Package,
};

const categoryGradients: Record<string, string> = {
    Hostels: 'from-orange-500/10 to-amber-500/10 border-orange-200 dark:border-orange-800',
    Library: 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800',
    'Food Mess': 'from-green-500/10 to-emerald-500/10 border-green-200 dark:border-green-800',
    'Other Products': 'from-purple-500/10 to-violet-500/10 border-purple-200 dark:border-purple-800',
};

const categoryIconColors: Record<string, string> = {
    Hostels: 'text-orange-500',
    Library: 'text-blue-500',
    'Food Mess': 'text-green-500',
    'Other Products': 'text-purple-500',
};

export default function MarketplaceCard({
    item,
    onSelect,
}: {
    item: MarketplaceItem;
    onSelect: (item: MarketplaceItem) => void;
}) {
    const Icon = categoryIcons[item.category] || Package;
    const gradient = categoryGradients[item.category] || 'from-gray-500/10 to-gray-500/10 border-gray-200';
    const iconColor = categoryIconColors[item.category] || 'text-gray-500';

    return (
        <button
            onClick={() => onSelect(item)}
            className={cn(
                'group w-full text-left rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300',
                'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                gradient
            )}
        >
            <div className="flex gap-3">
                {/* Image */}
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-background/50">
                    {item.image_url ? (
                        <Image
                            src={item.image_url}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="80px"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center">
                            <Icon className={cn('h-8 w-8', iconColor)} />
                        </div>
                    )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-semibold text-sm text-foreground truncate">{item.name}</h3>
                        <span className={cn('shrink-0 rounded-full p-1', iconColor)}>
                            <Icon className="h-3.5 w-3.5" />
                        </span>
                    </div>

                    {item.location && (
                        <p className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                            <MapPin className="h-3 w-3" />
                            <span className="truncate">{item.location}</span>
                        </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                        <span className="flex items-center gap-0.5 text-sm font-bold text-foreground">
                            <IndianRupee className="h-3.5 w-3.5" />
                            {item.price.toLocaleString('en-IN')}
                            <span className="text-[10px] font-normal text-muted-foreground">/mo</span>
                        </span>
                        <span className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                            View details
                            <ArrowRight className="h-3 w-3" />
                        </span>
                    </div>
                </div>
            </div>

            {/* Amenities preview */}
            {item.amenities && item.amenities.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2.5">
                    {item.amenities.slice(0, 3).map((amenity, i) => (
                        <span
                            key={i}
                            className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground border"
                        >
                            {amenity}
                        </span>
                    ))}
                    {item.amenities.length > 3 && (
                        <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] text-muted-foreground border">
                            +{item.amenities.length - 3} more
                        </span>
                    )}
                </div>
            )}
        </button>
    );
}

/**
 * Skeleton loader for marketplace cards (the "Thinking" state from the spec).
 */
export function MarketplaceCardSkeleton() {
    return (
        <div className="w-full rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/30 p-4 animate-pulse">
            <div className="flex gap-3">
                <div className="h-20 w-20 shrink-0 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-4 w-1/3 rounded bg-muted mt-1" />
                </div>
            </div>
            <div className="flex gap-1 mt-2.5">
                <div className="h-5 w-14 rounded-full bg-muted" />
                <div className="h-5 w-12 rounded-full bg-muted" />
                <div className="h-5 w-16 rounded-full bg-muted" />
            </div>
        </div>
    );
}
