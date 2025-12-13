
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
import { IndianRupee, Loader2, CheckCircle, Shield, ShoppingBag } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type ProductDetailClientProps = {
    product: Product;
    currentUser: User | null;
}

export default function ProductDetailClient({ product, currentUser }: ProductDetailClientProps) {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { openCheckout, isLoaded } = useRazorpay();
    const [isBuying, setIsBuying] = useState(false);

    const handleBuyNow = useCallback(async () => {
        if (!currentUser || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to purchase items.' });
            return;
        }
        setIsBuying(true);

        try {
            const response = await fetch('/api/create-order', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: product.price * 100, currency: 'INR' }),
            });

            if (!response.ok) {
                const orderError = await response.json();
                throw new Error(orderError.error || 'Failed to create Razorpay order.');
            }
            
            const order = await response.json();

            const options = {
              key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
              amount: order.amount,
              currency: order.currency,
              name: `Purchase: ${product.name}`,
              description: `Order from vendor: ${product.seller.full_name}`,
              order_id: order.id,
              handler: async function (response: any) {
                const { data: newOrder, error: orderError } = await supabase
                  .from('orders')
                  .insert({
                    buyer_id: currentUser.id,
                    vendor_id: product.seller_id,
                    total_amount: product.price,
                    razorpay_payment_id: response.razorpay_payment_id,
                  })
                  .select('id')
                  .single();

                if (orderError || !newOrder) {
                    toast({ variant: 'destructive', title: 'Error Saving Order', description: 'Payment received, but failed to save your order. Please contact support@uninest.co.in.' });
                    setIsBuying(false); 
                    return;
                }

                const { error: itemError } = await supabase
                  .from('order_items')
                  .insert({
                    order_id: newOrder.id,
                    product_id: product.id,
                    quantity: 1,
                    price: product.price,
                  });

                 if (itemError) {
                    toast({ variant: 'destructive', title: 'Error Saving Order Item', description: 'Your order was processed but had an issue. Please contact support@uninest.co.in.' });
                 } else {
                    toast({ title: 'Payment Successful!', description: `${product.name} has been purchased.` });
                    router.push('/vendor/orders');
                 }
              },
              modal: {
                ondismiss: () => setIsBuying(false),
              },
              prefill: {
                name: currentUser.user_metadata?.full_name || '',
                email: currentUser.email || '',
              },
              notes: {
                type: 'product_purchase',
                productId: product.id,
                userId: currentUser.id,
              },
              theme: {
                color: '#1B365D',
              },
            };
            openCheckout(options);
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: 'Purchase Failed',
                description: error instanceof Error ? error.message : 'Could not connect to the payment gateway.',
            });
            setIsBuying(false);
        }
    }, [currentUser, supabase, toast, openCheckout, router, product]);

    const canInteract = currentUser && currentUser.id !== product.seller_id;
    const isBookable = ['Library', 'Hostels', 'Food Mess', 'Cyber Café'].includes(product.category);


    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
                <div>
                    <Card className="overflow-hidden">
                        <div className="relative aspect-video">
                            <Image
                                src={product.image_url || 'https://picsum.photos/seed/product-detail/800/450'}
                                alt={product.name}
                                fill
                                data-ai-hint="product image"
                                className="object-cover"
                                priority
                            />
                        </div>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Badge variant="secondary" className="capitalize">{product.category}</Badge>
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
                    <p className="text-lg text-muted-foreground">{product.description}</p>
                    <p className="text-4xl font-bold text-primary flex items-center">
                        <IndianRupee className="size-8" />
                        {product.price.toLocaleString()}
                    </p>
                    
                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                             <Link href={`/profile/${product.seller.handle}`} className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={product.seller.avatar_url || undefined} />
                                    <AvatarFallback>{product.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-muted-foreground">Sold by</p>
                                    <p className="font-bold text-lg">{product.seller.full_name}</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>

                    {canInteract && (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button
                              size="lg"
                              className="flex-1 text-lg"
                              onClick={handleBuyNow}
                              disabled={!isLoaded || isBuying}
                            >
                              {isBuying ? (
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              ) : (
                                <ShoppingBag className="mr-2 h-5 w-5" />
                              )}
                              Buy now
                            </Button>
                        </div>
                    )}
                    {currentUser && currentUser.id === product.seller_id && (
                        <Button size="lg" variant="outline" className="w-full" asChild>
                            <Link href="/vendor/products">Manage your listings</Link>
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-8 pt-8 border-t">
                <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2"><CheckCircle className="text-green-500"/> Why Shop on UniNest?</h3>
                        <ul className="list-disc list-inside text-muted-foreground space-y-2">
                            <li>Directly support fellow students and campus vendors.</li>
                            <li>Secure payments powered by Razorpay.</li>
                            <li>Clear order trail for every purchase.</li>
                            <li>All transactions contribute to the UniNest community.</li>
                        </ul>
                    </CardContent>
                </Card>
                 <Card>
                    <CardContent className="p-6 space-y-4">
                        <h3 className="font-bold text-lg flex items-center gap-2"><Shield className="text-blue-500"/> Buyer Protection</h3>
                        <p className="text-muted-foreground">
                            If your item doesn't arrive or isn't as described, contact the seller first. For payment issues, our support team is here to assist you with the transaction details.
                        </p>
                        <Button variant="link" className="p-0">Learn More</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
