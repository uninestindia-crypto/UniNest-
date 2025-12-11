

'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Truck } from 'lucide-react';
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
  
  const canContact = user && user.id !== product.seller_id;
  const isBookable = ['Library', 'Hostels', 'Food Mess', 'Cyber Café'].includes(product.category);
  const derivedRating = Number((4 + (product.id % 10) * 0.1).toFixed(1));
  const ratingCount = 40 + (product.id % 200);
  const cardClassName = layout === 'list'
    ? 'overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col flex-grow group md:flex-row'
    : 'overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col flex-grow group';
  const imageWrapperClass = layout === 'list'
    ? 'relative aspect-[16/9] block md:w-64 md:flex-shrink-0'
    : 'relative aspect-[16/9] block';
  const contentClassName = layout === 'list'
    ? 'p-4 flex-grow md:flex-1'
    : 'p-4 flex-grow';

  const getCardLink = () => {
    if (product.category === 'Library') return `/marketplace/library/${product.id}`;
    if (product.category === 'Hostels') return `/hostels/${product.id}`;
    return `/marketplace/${product.id}`;
  }

  return (
    <Card className={cardClassName}>
    <CardHeader className="p-0">
        <Link href={getCardLink()} className={imageWrapperClass}>
        <Image
            src={product.image_url || 'https://picsum.photos/seed/product/400/225'}
            alt={product.name}
            width={400}
            height={225}
            data-ai-hint="product image"
            className="object-cover transition-transform group-hover:scale-105"
        />
        </Link>
    </CardHeader>
    <CardContent className={contentClassName}>
        <div className="flex items-center justify-between gap-2">
            <Badge variant="secondary" className="capitalize">{product.category}</Badge>
            <Badge variant="outline" className="border-dashed text-xs">UniPrime</Badge>
        </div>
        <Link href={getCardLink()}>
            <CardTitle className="text-lg font-semibold leading-snug mt-3 h-12 overflow-hidden group-hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        <div className="mt-3 flex items-center gap-1 text-sm">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star
                    key={index}
                    className={index < Math.round(derivedRating) ? 'size-4 text-amber-500 fill-amber-500' : 'size-4 text-muted-foreground'}
                />
            ))}
            <span className="ml-1 text-xs text-muted-foreground">{derivedRating.toFixed(1)} ({ratingCount})</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{product.description}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1 font-medium text-emerald-600">
                <Truck className="size-3.5" />
                Fast delivery available
            </span>
            <span>Sold by <span className="font-medium text-primary">{sellerName}</span></span>
        </div>
    </CardContent>
    <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex w-full flex-col gap-3">
            <div className="flex items-baseline gap-2">
                <p className="text-2xl font-semibold text-[#B12704]">
                    {product.category === 'Library' ? `₹${product.price.toLocaleString()}/seat` : `₹${product.price.toLocaleString()}`}
                </p>
                <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-600">Limited offer</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
            {isBookable && (
                <Button size="sm" className="rounded-full" asChild>
                    <Link href={getCardLink()}>See details</Link>
                </Button>
            )}
            {!isBookable && (
                <Button size="sm" className="rounded-full" onClick={() => onBuyNow(product)} disabled={!isRazorpayLoaded || isBuying}>
                    Buy now
                </Button>
            )}
            </div>
        </div>
    </CardFooter>
    </Card>
  );
}

