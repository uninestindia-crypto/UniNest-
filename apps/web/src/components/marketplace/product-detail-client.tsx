'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    IndianRupee,
    Loader2,
    CheckCircle,
    ShieldCheck,
    ShoppingBag,
    Truck,
    Store,
    Star,
    Share2,
    Heart
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { ProductGallery } from './product-gallery';
import { Separator } from '@/components/ui/separator';

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
                    color: '#4338CA', // Indigo Primary
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

    // Fallback images logic
    const productImages = product.image_url ? [product.image_url] : [];

    return (
        <div className="min-h-screen bg-background pb-12">
            {/* Breadcrumb / Top Nav Placeholder could go here */}

            <main className="container-wrapper max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-12">

                    {/* Left Column: Gallery */}
                    <div className="space-y-6">
                        <ProductGallery images={productImages} productName={product.name} />

                        {/* Desktop Trust Signals */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm">Secure-Transaction</p>
                                        <p className="text-xs text-muted-foreground">Payments processed by Razorpay.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm">Verified Seller</p>
                                        <p className="text-xs text-muted-foreground">Identity verified by UniNest.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Right Column: Key Info & Actions */}
                    <div className="space-y-8">
                        {/* Header */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium capitalize">
                                    {product.category}
                                </Badge>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold font-headline leading-tight text-foreground">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-1 text-amber-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg text-foreground">4.8</span>
                                <span className="text-muted-foreground text-sm ml-1">(No reviews yet)</span>
                            </div>
                        </div>

                        <Separator />

                        {/* Price Section */}
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-primary flex items-center">
                                    <IndianRupee className="w-8 h-8 stroke-[2.5]" />
                                    {product.price.toLocaleString()}
                                </p>
                                {/* Simulated Original Price/Discount */}
                                <p className="text-lg text-muted-foreground line-through">
                                    ₹{(product.price * 1.2).toFixed(0)}
                                </p>
                                <Badge className="bg-green-600 hover:bg-green-700">20% OFF</Badge>
                            </div>
                            <p className="text-sm text-green-600 font-medium">Includes all taxes</p>
                        </div>

                        {/* Actions */}
                        <Card className="border-2 border-muted">
                            <CardContent className="p-6 space-y-4">
                                {canInteract ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full text-lg font-bold h-12"
                                            onClick={() => toast({ title: "Added to Cart", description: "This item has been added to your cart." })}
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="w-full text-lg font-bold h-12 shadow-primary/25 shadow-lg"
                                            onClick={handleBuyNow}
                                            disabled={!isLoaded || isBuying}
                                        >
                                            {isBuying ? (
                                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                            ) : (
                                                <ShoppingBag className="mr-2 h-5 w-5" />
                                            )}
                                            Buy Now
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {currentUser?.id === product.seller_id ? (
                                            <Button size="lg" variant="outline" className="w-full" asChild>
                                                <Link href="/vendor/products">Manage Listing</Link>
                                            </Button>
                                        ) : (
                                            <Button size="lg" variant="secondary" className="w-full" asChild>
                                                <Link href="/login">Login to Buy</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Seller Info */}
                        <div className="flex items-center gap-4 p-4 rounded-lg border bg-card text-card-foreground shadow-sm">
                            <Avatar className="h-12 w-12 border-2 border-background">
                                <AvatarImage src={product.seller.avatar_url || undefined} />
                                <AvatarFallback>{product.seller.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                                <p className="text-sm font-medium text-muted-foreground">Sold by</p>
                                <Link href={`/profile/${product.seller.handle}`} className="font-bold text-lg hover:underline flex items-center gap-1">
                                    {product.seller.full_name}
                                    <Store className="w-4 h-4 text-primary" />
                                </Link>
                            </div>
                            <Button variant="outline" size="sm" asChild>
                                <Link href={`/profile/${product.seller.handle}`}>View Profile</Link>
                            </Button>
                        </div>

                        {/* Product Details Tabs */}
                        <Tabs defaultValue="description" className="w-full">
                            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
                                <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                                    Description
                                </TabsTrigger>
                                <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                                    Specifications
                                </TabsTrigger>
                                <TabsTrigger value="delivery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-4 py-2">
                                    Delivery
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="description" className="pt-4 space-y-4">
                                <div className="prose dark:prose-invert max-w-none text-muted-foreground leading-relaxed">
                                    <p>{product.description}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="specs" className="pt-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Category</span>
                                        <span className="font-medium">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Condition</span>
                                        <span className="font-medium">New</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Stock Status</span>
                                        <span className="font-medium text-green-600">In Stock</span>
                                    </div>
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground">Location</span>
                                        <span className="font-medium">{product.location || 'Campus Hub'}</span>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="delivery" className="pt-4">
                                <div className="flex items-start gap-4">
                                    <div className="p-2 bg-primary/10 rounded-full">
                                        <Truck className="w-6 h-6 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-semibold">Campus Delivery</h4>
                                        <p className="text-muted-foreground text-sm mt-1">
                                            This item is available for pickup or delivery within the campus premises.
                                            Contact the seller after purchase to coordinate.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>
                </div>
            </main>
        </div>
    );
}
