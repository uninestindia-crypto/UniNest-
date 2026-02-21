'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent } from '@/components/ui/card';
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
    Heart,
    MessageCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { ProductGallery } from './product-gallery';
import { Separator } from '@/components/ui/separator';
import ProductVariants from './product-variants';
import ProductReviews from './product-reviews';

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

    // Variant Selection State
    const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

    // Sort images: Main image first, then additional images by order
    const galleryImages = useMemo(() => {
        const others = (product.images || [])
            .sort((a, b) => a.display_order - b.display_order)
            .map(i => i.image_url);
        return [product.image_url, ...others].filter((url): url is string => !!url);
    }, [product.image_url, product.images]);

    // Pre-select first options if none selected
    useEffect(() => {
        if (!product.variants?.length) return;

        const defaults: Record<string, string> = {};
        let hasChanges = false;

        product.variants.forEach(v => {
            if (!selectedVariants[v.name]) {
                // Find the first variant of this name (or the specific one)
                // Simply picking the first one in the list that matches the name
                if (!defaults[v.name]) {
                    defaults[v.name] = v.value;
                    hasChanges = true;
                }
            }
        });

        if (hasChanges) {
            setSelectedVariants(prev => ({ ...prev, ...defaults }));
        }
    }, [product.variants, selectedVariants]);

    // Calculate dynamic price based on variants
    const currentPrice = useMemo(() => {
        let price = product.price;
        if (!product.variants) return price;

        Object.entries(selectedVariants).forEach(([name, value]) => {
            const variant = product.variants?.find(v => v.name === name && v.value === value);
            if (variant) {
                price += (Number(variant.price_modifier) || 0);
            }
        });
        return price;
    }, [product.price, product.variants, selectedVariants]);

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
                body: JSON.stringify({ amount: currentPrice * 100, currency: 'INR' }),
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
                            total_amount: currentPrice,
                            razorpay_payment_id: response.razorpay_payment_id,
                            // Store selected variants in metadata if we had a column, or notes?
                            // For MVP, we just store order
                        })
                        .select('id')
                        .single();

                    if (orderError || !newOrder) {
                        toast({ variant: 'destructive', title: 'Error Saving Order', description: 'Payment received, but failed to save your order.' });
                        setIsBuying(false);
                        return;
                    }

                    const { error: itemError } = await supabase
                        .from('order_items')
                        .insert({
                            order_id: newOrder.id,
                            product_id: product.id,
                            quantity: 1,
                            price: currentPrice,
                            // Ideally store variant selection here
                        });

                    if (itemError) {
                        toast({ variant: 'destructive', title: 'Error Saving Order Item', description: 'Issue saving order details.' });
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
                    variants: JSON.stringify(selectedVariants)
                },
                theme: {
                    color: '#4338CA',
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
    }, [currentUser, supabase, toast, openCheckout, router, product, currentPrice, selectedVariants]);

    const canInteract = currentUser && currentUser.id !== product.seller_id;
    const averageRating = useMemo(() => {
        const reviews = product.reviews || [];
        if (!reviews.length) return "New";
        return (reviews.reduce((a, b) => a + b.rating, 0) / reviews.length).toFixed(1);
    }, [product.reviews]);

    return (
        <div className="min-h-screen bg-background pb-12 animate-in fade-in duration-500">
            <main className="container-wrapper max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-2 gap-12 mb-16">

                    {/* Left Column: Gallery */}
                    <div className="space-y-6">
                        <ProductGallery images={galleryImages} productName={product.name} />

                        {/* Desktop Trust Signals */}
                        <div className="hidden lg:grid grid-cols-2 gap-4">
                            <Card className="bg-blue-50/50 dark:bg-blue-950/20 border-blue-100 dark:border-blue-900 shadow-sm">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <ShieldCheck className="w-5 h-5 text-blue-600 mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-blue-900 dark:text-blue-100">Secure Transaction</p>
                                        <p className="text-xs text-blue-700/80 dark:text-blue-300/80">Payments processed by Razorpay.</p>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="bg-green-50/50 dark:bg-green-950/20 border-green-100 dark:border-green-900 shadow-sm">
                                <CardContent className="p-4 flex items-start gap-3">
                                    <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                                    <div>
                                        <p className="font-semibold text-sm text-green-900 dark:text-green-100">Verified Seller</p>
                                        <p className="text-xs text-green-700/80 dark:text-green-300/80">Identity verified by UniNest.</p>
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
                                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium capitalize bg-secondary/50 hover:bg-secondary/70 transition-colors">
                                    {product.category}
                                </Badge>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted">
                                        <Share2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-muted text-red-500 hover:text-red-600">
                                        <Heart className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-bold font-headline leading-tight text-foreground tracking-tight">
                                {product.name}
                            </h1>

                            <div className="flex items-center gap-2">
                                <div className="flex items-center text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md">
                                    <Star className="w-4 h-4 fill-current mr-1" />
                                    <span className="font-bold text-sm">{averageRating}</span>
                                </div>
                                <span className="text-muted-foreground text-sm">
                                    {product.reviews?.length ? `(${product.reviews.length} reviews)` : 'No reviews yet'}
                                </span>
                            </div>
                        </div>

                        <Separator className="bg-border/60" />

                        {/* Price Section */}
                        <div className="space-y-1">
                            <div className="flex items-baseline gap-2">
                                <p className="text-4xl font-bold text-primary flex items-center tracking-tight">
                                    <IndianRupee className="w-8 h-8 stroke-[2.5]" />
                                    {currentPrice.toLocaleString()}
                                </p>
                                <p className="text-lg text-muted-foreground line-through decoration-muted-foreground/50">
                                    ₹{(currentPrice * 1.2).toFixed(0)}
                                </p>
                                <Badge className="bg-green-600 hover:bg-green-700 font-bold ml-2">20% OFF</Badge>
                            </div>
                            <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5" /> Includes all taxes and fees
                            </p>
                        </div>

                        {/* Variants */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="py-2">
                                <ProductVariants
                                    variants={product.variants}
                                    selectedVariants={selectedVariants}
                                    onSelect={(name, value) => setSelectedVariants(prev => ({ ...prev, [name]: value }))}
                                />
                            </div>
                        )}

                        {/* Actions */}
                        <Card className="border-2 border-primary/10 bg-card/50 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                {canInteract ? (
                                    <div className="grid grid-cols-2 gap-3">
                                        <Button
                                            size="lg"
                                            variant="outline"
                                            className="w-full text-lg font-bold h-14 border-primary/20 hover:bg-primary/5 hover:border-primary/50"
                                            onClick={() => toast({ title: "Added to Cart", description: "This item has been added to your cart." })}
                                        >
                                            <ShoppingBag className="mr-2 h-5 w-5" />
                                            Add to Cart
                                        </Button>
                                        <Button
                                            size="lg"
                                            className="w-full text-lg font-bold h-14 shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98]"
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
                                            <Button size="lg" variant="outline" className="w-full h-12 text-base font-semibold" asChild>
                                                <Link href="/vendor/products">Manage Listing</Link>
                                            </Button>
                                        ) : (
                                            <Button size="lg" variant="secondary" className="w-full h-12 text-base font-semibold" asChild>
                                                <Link href="/login">Login to Buy</Link>
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Seller Info */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 rounded-xl border bg-card/50 backdrop-blur-sm shadow-sm transition-all hover:shadow-md hover:border-primary/20">
                            <div className="flex items-center gap-4 flex-1">
                                <Avatar className="h-14 w-14 border-2 border-background shadow-sm">
                                    <AvatarImage src={product.seller.avatar_url || undefined} />
                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">{product.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sold by</p>
                                    <Link href={`/profile/${product.seller.handle}`} className="font-bold text-lg hover:text-primary transition-colors flex items-center gap-1 group">
                                        {product.seller.full_name}
                                        <Store className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                    </Link>
                                </div>
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                                {canInteract && (
                                    <Button
                                        variant="secondary"
                                        size="default"
                                        className="rounded-full flex-1 sm:flex-none h-10 px-6 font-semibold bg-muted/50 border border-border/50 hover:bg-muted transition-all active:scale-95"
                                        onClick={async () => {
                                            if (!currentUser) {
                                                toast({ title: "Login required", description: "Log in to chat with sellers", variant: "destructive" });
                                                router.push('/login');
                                                return;
                                            }
                                            try {
                                                const { error } = await supabase.rpc('create_private_chat', {
                                                    p_user1_id: currentUser.id,
                                                    p_user2_id: product.seller_id,
                                                });
                                                if (error) throw error;
                                                toast({ title: "Opening Chat", description: "Taking you to your messages." });
                                                router.push('/chat');
                                            } catch (err) {
                                                console.error('Failed to start chat:', err);
                                                toast({ title: "Connection Error", description: "Could not start chat.", variant: "destructive" });
                                            }
                                        }}
                                    >
                                        <MessageCircle className="w-4.5 h-4.5 mr-2 text-primary" />
                                        Chat
                                    </Button>
                                )}
                                <Button variant="outline" size="sm" className="rounded-full flex-1 sm:flex-none" asChild>
                                    <Link href={`/profile/${product.seller.handle}`}>View Profile</Link>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Full Width Tabs Section */}
                <div className="mt-12">
                    <Tabs defaultValue="description" className="w-full">
                        <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent gap-8">
                            <TabsTrigger value="description" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 text-base font-medium text-muted-foreground transition-all">
                                Description
                            </TabsTrigger>
                            <TabsTrigger value="specs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 text-base font-medium text-muted-foreground transition-all">
                                Specifications
                            </TabsTrigger>
                            <TabsTrigger value="delivery" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 text-base font-medium text-muted-foreground transition-all">
                                Delivery
                            </TabsTrigger>
                            <TabsTrigger value="reviews" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-primary px-0 py-3 text-base font-medium text-muted-foreground transition-all">
                                Reviews ({product.reviews?.length || 0})
                            </TabsTrigger>
                        </TabsList>

                        <div className="py-8">
                            <TabsContent value="description" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="prose dark:prose-invert max-w-4xl text-muted-foreground leading-relaxed text-lg">
                                    <p className="whitespace-pre-line">{product.description}</p>
                                </div>
                            </TabsContent>
                            <TabsContent value="specs" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 max-w-2xl text-sm">
                                    <div className="flex justify-between py-3 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium">Category</span>
                                        <span className="font-semibold text-foreground">{product.category}</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium">Condition</span>
                                        <span className="font-semibold text-foreground">New</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium">Stock Status</span>
                                        <span className="font-semibold text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full text-xs">In Stock</span>
                                    </div>
                                    <div className="flex justify-between py-3 border-b border-border/50">
                                        <span className="text-muted-foreground font-medium">Location</span>
                                        <span className="font-semibold text-foreground">{product.location || 'Campus Hub'}</span>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="delivery" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                <div className="flex items-start gap-4 p-6 bg-muted/30 rounded-2xl max-w-2xl border border-border/50">
                                    <div className="p-3 bg-primary/10 rounded-xl">
                                        <Truck className="w-8 h-8 text-primary" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-lg mb-2">Campus Delivery</h4>
                                        <p className="text-muted-foreground leading-relaxed">
                                            This item is available for pickup or delivery within the campus premises.
                                            Contact the seller after purchase to coordinate the best time and place.
                                        </p>
                                    </div>
                                </div>
                            </TabsContent>
                            <TabsContent value="reviews" className="mt-0 animate-in fade-in slide-in-from-left-4 duration-500">
                                <ProductReviews productId={product.id} initialReviews={product.reviews || []} />
                            </TabsContent>
                        </div>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}
