'use client';

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ProductVariant } from '@/lib/types';
import { Check } from 'lucide-react';

type ProductVariantsProps = {
    variants: ProductVariant[];
    selectedVariants: Record<string, string>;
    onSelect: (name: string, value: string) => void;
};

export default function ProductVariants({
    variants,
    selectedVariants,
    onSelect,
}: ProductVariantsProps) {
    // Group variants by name (e.g. "Size" -> [S, M, L])
    const groupedVariants = useMemo(() => {
        const groups: Record<string, ProductVariant[]> = {};
        variants.forEach((variant) => {
            if (!groups[variant.name]) {
                groups[variant.name] = [];
            }
            groups[variant.name].push(variant);
        });
        return groups;
    }, [variants]);

    if (!variants || variants.length === 0) {
        return null;
    }

    return (
        <div className="space-y-4">
            {Object.entries(groupedVariants).map(([name, options]) => (
                <div key={name} className="space-y-2">
                    <label className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                        {name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {options.map((option) => {
                            const isSelected = selectedVariants[name] === option.value;
                            const isOutOfStock = option.stock_count <= 0;

                            return (
                                <Button
                                    key={option.id}
                                    variant={isSelected ? 'default' : 'outline'}
                                    disabled={isOutOfStock}
                                    onClick={() => onSelect(name, option.value)}
                                    className={cn(
                                        'relative h-10 px-4 min-w-[3rem] rounded-lg transition-all',
                                        isSelected
                                            ? 'bg-primary text-primary-foreground shadow-md ring-2 ring-primary ring-offset-2'
                                            : 'hover:border-primary/50 bg-background',
                                        isOutOfStock && 'opacity-50 cursor-not-allowed decoration-slice'
                                    )}
                                >
                                    <span className="flex items-center gap-2">
                                        {option.value}
                                        {option.price_modifier !== 0 && (
                                            <span className={cn(
                                                "text-[10px] font-mono",
                                                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                                            )}>
                                                {option.price_modifier > 0 ? '+' : ''}{option.price_modifier}
                                            </span>
                                        )}
                                    </span>
                                    {isSelected && (
                                        <div className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-white shadow-sm ring-2 ring-background">
                                            <Check className="h-2.5 w-2.5" />
                                        </div>
                                    )}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
