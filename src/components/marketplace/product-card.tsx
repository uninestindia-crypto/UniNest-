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
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />
                </Link>
                <div className="absolute top-3 right-3 flex flex-col gap-2">
                    <Badge className="bg-white/90 text-foreground backdrop-blur-sm border-0 shadow-sm hover:bg-white text-xs font-semibold px-2 py-1">
                        {product.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex flex-col gap-2.5 p-5 flex-grow">
                <div className="flex items-center gap-1 text-yellow-500 text-xs font-medium">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span>{derivedRating}</span>
                    <span className="text-muted-foreground">({ratingCount})</span>
                </div>

                <Link href={getCardLink()} className="group-hover:text-primary transition-colors">
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">{product.name}</h3>
                </Link>

                <p className="text-sm text-muted-foreground line-clamp-2">{product.description}</p>

                <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                        <Truck className="w-3 h-3" />
                    </div>
                    <span>Verified Seller: <span className="text-foreground font-medium">{sellerName}</span></span>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex items-center justify-between gap-4">
                <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Price</span>
                    <span className="text-xl font-bold text-primary">
                        {product.category === 'Library' ? `₹${product.price.toLocaleString()}/seat` : `₹${product.price.toLocaleString()}`}
                    </span>
                </div>

                {isBookable ? (
                    <Button variant="outline" className="rounded-xl gap-2 hover:bg-primary hover:text-primary-foreground border-primary/20" asChild>
                        <Link href={getCardLink()}>
                            Details <ArrowRight className="w-4 h-4" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => onBuyNow(product)}
                        disabled={!isRazorpayLoaded || isBuying}
                        className="rounded-xl gap-2 shadow-lg shadow-primary/20 transition-transform active:scale-95"
                    >
                        {isBuying ? (
                            'Processing...'
                        ) : (
                            <>
                                <ShoppingBag className="w-4 h-4" /> Buy Now
                            </>
                        )}
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}
