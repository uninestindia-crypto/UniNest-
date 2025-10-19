

'use client';

import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Loader2 } from 'lucide-react';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';

type ProductCardProps = {
  product: Product;
  user: User | null;
  onBuyNow: (product: Product) => void;
  onChat: (sellerId: string, productName: string) => void;
  isBuying: boolean;
  isRazorpayLoaded: boolean;
  layout?: 'grid' | 'list';
};

export default function ProductCard({ product, user, onBuyNow, onChat, isBuying, isRazorpayLoaded, layout = 'grid' }: ProductCardProps) {
  const sellerName = typeof product.seller === 'object' && product.seller !== null 
    ? product.seller.full_name 
    : 'Anonymous';
  
  const canContact = user && user.id !== product.seller_id;
  const isBookable = ['Library', 'Hostels', 'Food Mess', 'Cyber Café'].includes(product.category);
  const cardClassName = layout === 'list'
    ? 'overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col flex-grow group md:flex-row'
    : 'overflow-hidden shadow-sm transition-shadow hover:shadow-lg flex flex-col flex-grow group';
  const imageWrapperClass = layout === 'list'
    ? 'relative aspect-[16/9] block md:w-64 md:flex-shrink-0'
    : 'relative aspect-[16/9] block';
  const contentClassName = layout === 'list'
    ? 'p-4 flex-grow md:flex-1'
    : 'p-4 flex-grow';

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>, action: () => void) => {
    e.stopPropagation();
    e.preventDefault();
    action();
  }

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
        <Badge variant="secondary" className="mb-2 capitalize">{product.category}</Badge>
        <Link href={getCardLink()}>
            <CardTitle className="text-lg font-semibold leading-snug mb-2 h-12 overflow-hidden group-hover:text-primary transition-colors">{product.name}</CardTitle>
        </Link>
        <p className="text-sm text-muted-foreground mb-4 h-10 overflow-hidden text-ellipsis">{product.description}</p>
        <p className="text-sm">Sold by <span className="font-medium text-primary">{sellerName}</span></p>
    </CardContent>
    <CardFooter className="p-4 pt-0 mt-auto">
        <div className="flex items-center justify-between w-full gap-2">
            <p className="text-xl font-bold text-primary">
                {product.category === 'Library' ? `₹${product.price.toLocaleString()}/seat` : `₹${product.price.toLocaleString()}`}
            </p>
            <div className='flex gap-2'>
            {canContact && (
                <Button variant="outline" size="sm" onClick={(e) => handleButtonClick(e, () => onChat(product.seller_id, product.name))}>
                    <MessageSquare className="mr-2 size-4"/>
                    Contact
                </Button>
            )}
            
            {isBookable && (
                <Button size="sm" asChild>
                    <Link href={getCardLink()}>View Details</Link>
                </Button>
            )}
            </div>
        </div>
    </CardFooter>
    </Card>
  );
}

