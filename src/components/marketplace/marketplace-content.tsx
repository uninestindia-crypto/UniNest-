'use client';

import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/marketplace/product-card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Search, ListFilter, Library, Utensils, Laptop, Bed, Book, Package, X, Loader2, Plus, MessageSquare, Rows3, Rows } from 'lucide-react';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Books', icon: Book },
  { name: 'Hostels', icon: Bed },
  { name: 'Food Mess', icon: Utensils },
  { name: 'Cyber Café', icon: Laptop },
  { name: 'Library', icon: Library },
  { name: 'Other Products', icon: Package },
];

type LayoutMode = 'grid' | 'list';

const MARKETPLACE_LAYOUT_KEY = 'uninest_marketplace_layout';

export default function MarketplaceContent() {
  const { user, supabase } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { openCheckout, isLoaded } = useRazorpay();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingProductId, setPurchasingProductId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  const selectedCategory = searchParams.get('category');

  useEffect(() => {
    const storedLayout = typeof window !== 'undefined' ? window.sessionStorage.getItem(MARKETPLACE_LAYOUT_KEY) : null;
    if (storedLayout === 'grid' || storedLayout === 'list') {
      setLayoutMode(storedLayout);
    }
  }, []);

  const handleLayoutChange = useCallback((mode: LayoutMode) => {
    setLayoutMode(mode);
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(MARKETPLACE_LAYOUT_KEY, mode);
    }
  }, []);

  const layoutToggle = useMemo(() => (
    <div className="inline-flex items-center gap-2 rounded-full border bg-card px-2 py-1 text-sm">
      <span className="text-muted-foreground">Layout</span>
      <div className="flex rounded-full bg-muted p-1">
        <Button
          size="sm"
          variant={layoutMode === 'grid' ? 'default' : 'ghost'}
          className="rounded-full px-2"
          onClick={() => handleLayoutChange('grid')}
        >
          <Rows3 className="size-4" />
        </Button>
        <Button
          size="sm"
          variant={layoutMode === 'list' ? 'default' : 'ghost'}
          className="rounded-full px-2"
          onClick={() => handleLayoutChange('list')}
        >
          <Rows className="size-4" />
        </Button>
      </div>
    </div>
  ), [handleLayoutChange, layoutMode]);

  const priceBounds = useMemo(() => {
    if (!products.length) return { min: 0, max: 0 };
    const prices = products
      .map(product => product.price)
      .filter((value): value is number => typeof value === 'number');
    if (!prices.length) return { min: 0, max: 0 };
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    return { min, max: max === min ? min + 100 : max };
  }, [products]);

  const sliderStep = useMemo(() => {
    const span = priceBounds.max - priceBounds.min;
    if (span <= 1000) return 50;
    if (span <= 5000) return 100;
    if (span <= 20000) return 500;
    return 1000;
  }, [priceBounds.max, priceBounds.min]);

  const availableLocations = useMemo(() => {
    const uniques = new Set<string>();
    products.forEach(product => {
      if (product.location) uniques.add(product.location);
    });
    return Array.from(uniques).sort((a, b) => a.localeCompare(b));
  }, [products]);

  const availableTypes = useMemo(() => {
    const uniques = new Set<string>(categories.map(category => category.name));
    products.forEach(product => {
      if (product.category) uniques.add(product.category);
    });
    return Array.from(uniques);
  }, [products]);

  useEffect(() => {
    if (!products.length) {
      setPriceRange([0, 0]);
      return;
    }
    setPriceRange(previous => {
      const next: [number, number] = [priceBounds.min, priceBounds.max];
      if (previous[0] === next[0] && previous[1] === next[1]) return previous;
      return next;
    });
  }, [priceBounds.min, priceBounds.max, products.length]);

  const hasPriceFilter = useMemo(() => {
    if (!products.length) return false;
    return priceRange[0] > priceBounds.min || priceRange[1] < priceBounds.max;
  }, [priceBounds.max, priceBounds.min, priceRange, products.length]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedLocation !== 'all') count += 1;
    if (selectedType !== 'all') count += 1;
    if (hasPriceFilter) count += 1;
    return count;
  }, [hasPriceFilter, selectedLocation, selectedType]);

  const appliedFilters = useMemo(() => {
    const result: { id: string; label: string }[] = [];
    if (selectedLocation !== 'all') {
      result.push({ id: 'location', label: selectedLocation });
    }
    if (selectedType !== 'all') {
      result.push({ id: 'type', label: selectedType });
    }
    if (hasPriceFilter) {
      result.push({
        id: 'price',
        label: `₹${Math.round(priceRange[0]).toLocaleString()} – ₹${Math.round(priceRange[1]).toLocaleString()}`,
      });
    }
    return result;
  }, [hasPriceFilter, priceRange, selectedLocation, selectedType]);

  const resetFilters = useCallback(() => {
    setSelectedLocation('all');
    setSelectedType('all');
    if (products.length) {
      setPriceRange([priceBounds.min, priceBounds.max]);
    } else {
      setPriceRange([0, 0]);
    }
  }, [priceBounds.max, priceBounds.min, products.length]);

  const FilterControls = () => (
    <div className="space-y-6">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Refine results</h2>
        <p className="text-sm text-muted-foreground">Narrow listings to match what you&apos;re looking for.</p>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Location</Label>
        <Select value={selectedLocation} onValueChange={setSelectedLocation}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All locations" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All locations</SelectItem>
            {availableLocations.map(location => (
              <SelectItem key={location} value={location}>
                {location}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">Type</Label>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Price range</Label>
          <span className="text-sm text-muted-foreground">
            ₹{Math.round(priceRange[0]).toLocaleString()} – ₹{Math.round(priceRange[1]).toLocaleString()}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={value => setPriceRange([value[0], value[1]])}
          min={priceBounds.min}
          max={priceBounds.max}
          step={sliderStep}
          disabled={!products.length}
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="marketplace-price-min" className="text-xs uppercase tracking-wide text-muted-foreground">Min</Label>
            <Input
              id="marketplace-price-min"
              type="number"
              min={priceBounds.min}
              max={priceRange[1]}
              value={priceRange[0]}
              disabled={!products.length}
              onChange={event => {
                if (!products.length) return;
                const next = Number(event.target.value);
                if (Number.isNaN(next)) return;
                const clamped = Math.min(Math.max(next, priceBounds.min), priceRange[1]);
                setPriceRange([clamped, priceRange[1]]);
              }}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="marketplace-price-max" className="text-xs uppercase tracking-wide text-muted-foreground">Max</Label>
            <Input
              id="marketplace-price-max"
              type="number"
              min={priceRange[0]}
              max={priceBounds.max}
              value={priceRange[1]}
              disabled={!products.length}
              onChange={event => {
                if (!products.length) return;
                const next = Number(event.target.value);
                if (Number.isNaN(next)) return;
                const clamped = Math.max(Math.min(next, priceBounds.max), priceRange[0]);
                setPriceRange([priceRange[0], clamped]);
              }}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <Button variant="outline" size="sm" onClick={resetFilters} disabled={!products.length || (!activeFilterCount && !hasPriceFilter)}>
          Clear filters
        </Button>
      </div>
    </div>
  );

  const handleBuyNow = useCallback(async (product: Product) => {
    if (!user || !supabase) {
        toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to purchase items.' });
        return;
    }
    setPurchasingProductId(product.id);

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
                buyer_id: user.id,
                vendor_id: product.seller_id,
                total_amount: product.price,
                razorpay_payment_id: response.razorpay_payment_id,
              })
              .select('id')
              .single();

            if (orderError || !newOrder) {
                toast({ variant: 'destructive', title: 'Error Saving Order', description: 'Payment received, but failed to save your order. Please contact support.' });
                setPurchasingProductId(null);
                return;
            }

            const { error: itemError } = await supabase
              .from('order_items')
              .insert({
                order_id: newOrder.id,
                product_id: product.id,
                quantity: 1, // Assuming quantity is always 1 for now
                price: product.price,
              });

             if (itemError) {
                toast({ variant: 'destructive', title: 'Error Saving Order Item', description: 'Your order was processed but had an issue. Please contact support.' });
             } else {
                toast({ title: 'Payment Successful!', description: `${product.name} has been purchased.` });
                router.push('/vendor/orders');
             }
          },
          modal: {
            ondismiss: () => setPurchasingProductId(null),
          },
          prefill: {
            name: user.user_metadata?.full_name || '',
            email: user.email || '',
          },
          notes: {
            type: 'product_purchase',
            productId: product.id,
            userId: user.id,
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
        setPurchasingProductId(null);
    }
  }, [user, supabase, toast, openCheckout, router]);

    const handleChat = useCallback(async (sellerId: string, productName: string) => {
        if (!user || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
            return;
        }
        if (user.id === sellerId) {
            toast({ variant: 'destructive', title: 'Error', description: 'You cannot start a chat with yourself.' });
            return;
        }

        try {
            const { error } = await supabase.rpc('create_private_chat', {
                p_user1_id: user.id,
                p_user2_id: sellerId,
            });

            if (error) throw error;

            router.push('/chat');
        } catch (error) {
            console.error('Error starting chat session:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start chat session.' });
        }
    }, [user, supabase, toast, router]);
  
  const createCategoryLink = (categoryName: string) => {
    if (selectedCategory === categoryName) {
        return '/marketplace'; // Clicking again clears the filter
    }
    return `/marketplace?category=${encodeURIComponent(categoryName)}`;
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!supabase) return;
      setLoading(true);
      let query = supabase
        .from('products')
        .select(`
          *,
          profiles:seller_id (
            full_name
          )
        `);

      if (selectedCategory) {
        let categoryQuery = selectedCategory;
        if (selectedCategory === 'Other Products') {
           // A bit of a hack to show products not in the main categories
           query = query.not('category', 'in', '("Books", "Hostels", "Food Mess", "Cyber Café", "Library", "Hostel Room", "Library Seat")');
        } else {
            query = query.eq('category', selectedCategory);
        }
      } else {
        // Exclude child products from main view
        query = query.not('category', 'in', '("Hostel Room", "Library Seat")');
      }


      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching products:', error);
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not fetch product listings.',
        });
      } else {
        const mappedData = data.map(p => ({
          ...p,
          seller: p.profiles
        }));
        setProducts(mappedData as Product[]);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [selectedCategory, supabase, toast]);

  const filteredProducts = useMemo(() => {
    const trimmedQuery = searchQuery.trim().toLowerCase();
    return products.filter(product => {
      const matchesSearch = !trimmedQuery
        || product.name.toLowerCase().includes(trimmedQuery)
        || product.description.toLowerCase().includes(trimmedQuery);
      if (!matchesSearch) return false;

      if (selectedLocation !== 'all') {
        if (!product.location) return false;
        if (product.location.toLowerCase() !== selectedLocation.toLowerCase()) return false;
      }

      if (selectedType !== 'all' && product.category !== selectedType) {
        return false;
      }

      if (products.length) {
        if (product.price < priceRange[0] || product.price > priceRange[1]) {
          return false;
        }
      }

      return true;
    });
  }, [priceRange, products, searchQuery, selectedLocation, selectedType]);

  return (
    <div className="space-y-8">
       {/* New Header Section */}
       <section className="bg-card p-6 rounded-2xl shadow-md border space-y-6">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-primary">Marketplace</h1>
                    <p className="mt-1 text-muted-foreground">Buy, Sell & Support – by Students, for Students.</p>
                </div>
                {user && (
                    <Button asChild>
                        <Link href="/marketplace/new"><Plus className="mr-2"/> Create Listing</Link>
                    </Button>
                )}
            </div>
             <div className="flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-full flex-grow">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                    <Input 
                        placeholder="Search for textbooks, notes, bikes..." 
                        className="pl-11 h-12 text-base rounded-full" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                    <SheetTrigger asChild>
                        <Button variant="outline" className="gap-2 h-12 rounded-full w-full sm:w-auto lg:hidden">
                            <ListFilter className="size-5" />
                            <span className="font-semibold">Filters{activeFilterCount ? ` (${activeFilterCount})` : ''}</span>
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="w-full sm:max-w-sm overflow-y-auto">
                        <SheetHeader>
                            <SheetTitle>Filters</SheetTitle>
                        </SheetHeader>
                        <div className="mt-6 space-y-6">
                            <FilterControls />
                            <SheetClose asChild>
                                <Button className="w-full" onClick={() => setIsFilterSheetOpen(false)}>
                                    Show results
                                </Button>
                            </SheetClose>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
            <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold mr-2">Categories:</span>
                {categories.map((category) => (
                     <Button
                        key={category.name}
                        asChild
                        variant={selectedCategory === category.name ? 'default' : 'outline'}
                        size="sm"
                        className="rounded-full gap-2"
                     >
                        <Link href={createCategoryLink(category.name)}>
                           <category.icon className="size-4" />
                           {category.name}
                           {selectedCategory === category.name && <X className="size-4 -mr-1" />}
                        </Link>
                    </Button>
                ))}
            </div>
       </section>
      
      {/* Listings Section */}
      <section className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="hidden lg:block">
            <div className="sticky top-24 space-y-6 rounded-2xl border bg-card p-6 shadow-md">
                <FilterControls />
            </div>
        </aside>
        <div className="space-y-6">
            {appliedFilters.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    {appliedFilters.map(filter => (
                        <Badge key={filter.id} variant="secondary" className="rounded-full px-3 py-1 text-sm font-medium">
                            {filter.label}
                        </Badge>
                    ))}
                    <Button variant="ghost" size="sm" onClick={resetFilters}>
                        Clear all
                    </Button>
                </div>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {appliedFilters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  {appliedFilters.map(filter => (
                    <Badge key={filter.id} variant="secondary" className="rounded-full px-3 py-1 text-sm font-medium">
                      {filter.label}
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={resetFilters}>
                    Clear all
                  </Button>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground">Showing {filteredProducts.length} listings</div>
              )}
              {layoutToggle}
            </div>
            {loading ? (
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="size-8 animate-spin text-muted-foreground" />
                </div>
            ) : filteredProducts.length > 0 ? (
                <div className={layoutMode === 'grid' ? 'grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5' : 'space-y-4'}>
                  {filteredProducts.map((product) => (
                    <div key={product.id} className={layoutMode === 'list' ? 'rounded-2xl border bg-card p-4 shadow-sm hover:shadow-md transition-shadow' : undefined}>
                      <ProductCard
                        product={product}
                        user={user}
                        onBuyNow={handleBuyNow}
                        onChat={handleChat}
                        isBuying={purchasingProductId === product.id}
                        isRazorpayLoaded={isLoaded}
                        layout={layoutMode}
                      />
                    </div>
                  ))}
                </div>
            ) : (
                <div className="text-center text-muted-foreground py-16 bg-card rounded-2xl">
                    <h2 className="text-xl font-semibold">No listings found</h2>
                    <p>{selectedCategory ? `There are no products in the "${selectedCategory}" category yet.` : 'No products have been listed on the marketplace yet.'} Check back later!</p>
                </div>
            )}
        </div>
      </section>
    </div>
  );
}
