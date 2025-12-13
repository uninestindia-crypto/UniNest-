'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

type ProductCardProps = {
    product: Product;
    user: User | null;
    onBuyNow: (product: Product) => void;
    isBuying: boolean;
    isRazorpayLoaded: boolean;
    layout?: 'grid' | 'list';
};

export default function ProductCard({ product, user, onBuyNow, isBuying, isRazorpayLoaded, layout = 'grid' }: ProductCardProps) {
    const sellerName = typeof product.seller === 'object' && product.seller !== null
        ? product.seller.full_name
        : 'Anonymous';

    const isBookable = ['Library', 'Hostels', 'Food Mess', 'Cyber Café'].includes(product.category);
    const derivedRating = Number((4 + (product.id % 10) * 0.1).toFixed(1));
    const ratingCount = 40 + (product.id % 200);

    const getCardLink = () => {
        if (product.category === 'Library') return `/marketplace/library/${product.id}`;
        if (product.category === 'Hostels') return `/hostels/${product.id}`;
        return `/marketplace/${product.id}`;
    }

    return (
        <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 duration-300 rounded-2xl flex flex-col">
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Link href={getCardLink()} className="block h-full w-full cursor-pointer">
                    <Image
                        src={product.image_url || 'https://picsum.photos/seed/product/400/300'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                </Link>
                <div className="absolute top-2 right-2 flex flex-col gap-2">
                    <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0 shadow-sm hover:bg-white text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 sm:px-2 sm:py-1">
                        {product.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex flex-col gap-2 p-3 sm:p-4 flex-grow relative">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <Link href={getCardLink()} className="hover:underline focus:outline-none">
                            <h3 className="font-bold text-sm sm:text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors" title={product.name}>
                                {product.name}
                            </h3>
                        </Link>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                        <span className="font-bold text-sm sm:text-xl text-primary">
                            {product.category === 'Library' ? `₹${product.price}/s` : `₹${product.price.toLocaleString()}`}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-1 text-yellow-500 text-[10px] sm:text-xs font-medium">
                    <Star className="w-3 h-3 fill-current" />
                    <span>{derivedRating}</span>
                    <span className="text-muted-foreground">({ratingCount})</span>
                </div>

                <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 min-h-[2.5em]">
                    {product.description}
                </p>

                <div className="mt-auto pt-2 flex items-center gap-2 text-[10px] sm:text-xs text-muted-foreground">
                    <div className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Truck className="w-2.5 h-2.5" />
                    </div>
                    <span className="truncate">Seller: <span className="text-foreground font-medium">{sellerName}</span></span>
                </div>
            </CardContent>

            <CardFooter className="p-3 sm:p-5 pt-0 flex gap-2">
                {isBookable ? (
                    <Button variant="outline" className="w-full rounded-xl gap-2 hover:bg-primary hover:text-primary-foreground border-primary/20 h-9 sm:h-10 text-xs sm:text-sm" asChild>
                        <Link href={getCardLink()}>
                            Details <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => onBuyNow(product)}
                        disabled={!isRazorpayLoaded || isBuying}
                        className="w-full rounded-xl gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95 h-9 sm:h-10 text-xs sm:text-sm"
                    >
                        {isBuying ? (
                            'Processing...'
                        ) : (
                            <>
                                <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" /> Buy Now
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
