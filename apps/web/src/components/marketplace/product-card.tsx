'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck, ShoppingBag, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';
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

    // Favorites Logic
    const [isFavorited, setIsFavorited] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const favorites = JSON.parse(localStorage.getItem('uninest_favorites') || '[]');
        setIsFavorited(favorites.includes(product.id));

        // Listen for updates
        const handleUpdate = () => {
            const updated = JSON.parse(localStorage.getItem('uninest_favorites') || '[]');
            setIsFavorited(updated.includes(product.id));
        }
        window.addEventListener('favorites-updated', handleUpdate);
        return () => window.removeEventListener('favorites-updated', handleUpdate);
    }, [product.id]);

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const favorites = JSON.parse(localStorage.getItem('uninest_favorites') || '[]');
        let newFavorites;
        if (favorites.includes(product.id)) {
            newFavorites = favorites.filter((id: number) => id !== product.id);
        } else {
            newFavorites = [...favorites, product.id];
        }
        localStorage.setItem('uninest_favorites', JSON.stringify(newFavorites));
        setIsFavorited(!isFavorited);

        // Dispatch custom event to notify other components (like Profile page)
        window.dispatchEvent(new Event('favorites-updated'));
        window.dispatchEvent(new Event('storage'));
    };

    const getCardLink = () => {
        if (product.category === 'Library') return `/marketplace/library/${product.id}`;
        if (product.category === 'Hostels') return `/hostels/${product.id}`;
        return `/marketplace/${product.id}`;
    }

    return (
        <Card className="group h-full overflow-hidden border-border/50 bg-card transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1.5 duration-300 rounded-[1.5rem] flex flex-col relative ring-1 ring-border/50">
            <button
                onClick={toggleFavorite}
                className="absolute top-3 right-3 z-20 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-sm hover:bg-white text-muted-foreground hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 sm:opacity-0 translate-y-2 group-hover:translate-y-0"
                title={isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
                <Star className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : 'fill-none'}`} />
            </button>
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted">
                <Link href={getCardLink()} className="block h-full w-full cursor-pointer">
                    <Image
                        src={product.image_url || 'https://picsum.photos/seed/product/400/300'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                        sizes="(min-width: 1536px) 25vw, (min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                    />
                </Link>
                <div className="absolute top-3 left-3 flex flex-col gap-2">
                    <Badge className="bg-white/95 text-foreground/80 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white text-[10px] font-bold px-2.5 py-1 tracking-wide uppercase">
                        {product.category}
                    </Badge>
                </div>
            </div>

            <CardContent className="flex flex-col gap-3 p-5 flex-grow relative">
                <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                        <Link href={getCardLink()} className="group/title focus:outline-none">
                            <h3 className="font-bold text-base sm:text-lg leading-snug line-clamp-2 text-foreground group-hover/title:text-primary transition-colors" title={product.name}>
                                {product.name}
                            </h3>
                        </Link>
                    </div>
                </div>

                <div className="flex items-end justify-between border-b pb-3 border-dashed">
                    <span className="font-extrabold text-lg sm:text-xl text-primary font-mono tracking-tight">
                        {product.category === 'Library' ? `₹${product.price}/s` : `₹${product.price.toLocaleString()}`}
                    </span>
                    <div className="flex items-center gap-1 text-amber-500 text-xs font-semibold bg-amber-500/10 px-2 py-1 rounded-md">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span>{derivedRating}</span>
                    </div>
                </div>

                <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                    {product.description}
                </p>

                <div className="mt-auto pt-2 flex items-center gap-2 text-xs text-muted-foreground">
                    <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                        <Truck className="w-3 h-3" />
                    </div>
                    <span className="truncate max-w-[150px]">Sold by <span className="text-foreground font-medium hover:underline">{sellerName}</span></span>
                </div>
            </CardContent>

            <CardFooter className="p-5 pt-0 flex gap-2">
                {isBookable ? (
                    <Button variant="outline" className="w-full rounded-xl gap-2 hover:bg-primary hover:text-primary-foreground border-primary/20 h-10 font-semibold" asChild>
                        <Link href={getCardLink()}>
                            Details <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Button>
                ) : (
                    <Button
                        onClick={() => onBuyNow(product)}
                        disabled={!isRazorpayLoaded || isBuying}
                        className="w-full rounded-xl gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95 h-10 font-bold bg-gradient-to-r from-primary to-primary/90 hover:to-primary"
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
