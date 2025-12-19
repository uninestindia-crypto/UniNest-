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
import { Search, ListFilter, Library, Utensils, Laptop, Bed, Book, Package, X, Loader2, Plus, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';
import type { Product } from '@/lib/types';
import Link from 'next/link';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useRouter } from 'next/navigation';

const categories = [
  { name: 'Books', icon: Book, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
  { name: 'Hostels', icon: Bed, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  { name: 'Food Mess', icon: Utensils, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
  { name: 'Cyber Café', icon: Laptop, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
  { name: 'Library', icon: Library, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/20' },
  { name: 'Other Products', icon: Package, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' },
];

type SortOption = 'featured' | 'price-low' | 'price-high' | 'newest';

type FilterControlsProps = {
  selectedLocation: string;
  onLocationChange: (value: string) => void;
  availableLocations: string[];
  selectedType: string;
  onTypeChange: (value: string) => void;
  availableTypes: string[];
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  priceBounds: { min: number; max: number };
  sliderStep: number;
  hasProducts: boolean;
  resetFilters: () => void;
  hasPriceFilter: boolean;
  activeFilterCount: number;
};

function FilterControls({
  selectedLocation,
  onLocationChange,
  availableLocations,
  selectedType,
  onTypeChange,
  availableTypes,
  priceRange,
  onPriceRangeChange,
  priceBounds,
  sliderStep,
  hasProducts,
  resetFilters,
  hasPriceFilter,
  activeFilterCount,
}: FilterControlsProps) {
  const handleMinInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasProducts) return;
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    const clamped = Math.min(Math.max(next, priceBounds.min), priceRange[1]);
    onPriceRangeChange([clamped, priceRange[1]]);
  };

  const handleMaxInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!hasProducts) return;
    const next = Number(event.target.value);
    if (Number.isNaN(next)) return;
    const clamped = Math.max(Math.min(next, priceBounds.max), priceRange[0]);
    onPriceRangeChange([priceRange[0], clamped]);
  };

  return (
    <div className="space-y-8">
      <div className="space-y-1.5">
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2">
          <ListFilter className="w-5 h-5 text-primary" />
          Refine Results
        </h2>
        <p className="text-xs text-muted-foreground">Customize your search to find the perfect match.</p>
      </div>

      <div className="space-y-4">
        <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Location</Label>
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="w-full h-11 rounded-xl bg-background border-input/50 focus:ring-primary/20 hover:border-primary/50 transition-colors">
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

      <div className="space-y-4">
        <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Category</Label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full h-11 rounded-xl bg-background border-input/50 focus:ring-primary/20 hover:border-primary/50 transition-colors">
            <SelectValue placeholder="All categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {availableTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Label className="text-[11px] uppercase tracking-wider font-bold text-muted-foreground">Price Range</Label>
          <Badge variant="outline" className="text-[10px] font-mono font-medium px-2 py-0.5 h-auto">
            ₹{Math.round(priceRange[0]).toLocaleString()} – ₹{Math.round(priceRange[1]).toLocaleString()}
          </Badge>
        </div>
        <Slider
          value={priceRange}
          onValueChange={value => onPriceRangeChange([value[0], value[1]])}
          min={priceBounds.min}
          max={priceBounds.max}
          step={sliderStep}
          disabled={!hasProducts}
          className="py-4 cursor-pointer"
        />
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="marketplace-price-min" className="text-[10px] font-medium text-muted-foreground">MIN PRICE</Label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium group-focus-within:text-primary transition-colors">₹</span>
              <Input
                id="marketplace-price-min"
                type="number"
                min={priceBounds.min}
                max={priceRange[1]}
                value={priceRange[0]}
                disabled={!hasProducts}
                onChange={handleMinInputChange}
                className="pl-7 h-10 rounded-xl text-sm bg-background border-input/50 focus-visible:ring-primary/20"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketplace-price-max" className="text-[10px] font-medium text-muted-foreground">MAX PRICE</Label>
            <div className="relative group">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-medium group-focus-within:text-primary transition-colors">₹</span>
              <Input
                id="marketplace-price-max"
                type="number"
                min={priceRange[0]}
                max={priceBounds.max}
                value={priceRange[1]}
                disabled={!hasProducts}
                onChange={handleMaxInputChange}
                className="pl-7 h-10 rounded-xl text-sm bg-background border-input/50 focus-visible:ring-primary/20"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/50">
        <Button
          variant="secondary"
          onClick={resetFilters}
          className="w-full h-11 rounded-xl font-semibold shadow-sm hover:translate-y-0.5 active:translate-y-0 transition-all"
          disabled={!hasProducts || (!activeFilterCount && !hasPriceFilter)}
        >
          Reset All Filters
        </Button>
      </div>
    </div>
  );
}

type MarketplaceContentProps = {
  initialProducts: Product[];
};

export default function MarketplaceContent({ initialProducts }: MarketplaceContentProps) {
  const { user, supabase } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { openCheckout, isLoaded } = useRazorpay();

  const [products, setProducts] = useState<Product[]>(initialProducts);
  // Loading is false by default because we have data! 
  // (unless we want to show loading during navigation, but Suspense handles that mostly)
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [purchasingProductId, setPurchasingProductId] = useState<number | null>(null);
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption>('featured');
  const selectedCategory = searchParams.get('category');

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
            toast({ variant: 'destructive', title: 'Error Saving Order', description: 'Payment received, but failed to save your order. Please contact support@uninest.co.in.' });
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
            toast({ variant: 'destructive', title: 'Error Saving Order Item', description: 'Your order was processed but had an issue. Please contact support@uninest.co.in.' });
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

  const createCategoryLink = (categoryName: string) => {
    if (selectedCategory === categoryName) {
      return '/marketplace'; // Clicking again clears the filter
    }
    return `/marketplace?category=${encodeURIComponent(categoryName)}`;
  };

  /* REMOVED: useEffect fetching logic. Data is now passed from Server Component. */

  // Initialize with server data, but allow updates if needed (though navigating categories will remount/update prop)
  useEffect(() => {
    setProducts(initialProducts);
    setLoading(false);
  }, [initialProducts]);

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

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];
    switch (sortOption) {
      case 'price-low':
        return items.sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
      case 'price-high':
        return items.sort((a, b) => (b.price ?? 0) - (a.price ?? 0));
      case 'newest':
        return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      default:
        return items;
    }
  }, [filteredProducts, sortOption]);

  return (
    <div className="space-y-12 pb-24">
      {/* Premium Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-primary px-6 py-16 md:px-16 md:py-20 shadow-2xl">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-20"></div>
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-accent/20 blur-[100px] animate-pulse-slow"></div>
        <div className="absolute -left-32 -bottom-32 h-[500px] w-[500px] rounded-full bg-secondary/20 blur-[100px] animate-pulse-slow delay-1000"></div>

        <div className="relative z-10 grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium text-white backdrop-blur-md shadow-sm">
              <Sparkles className="mr-2 h-4 w-4 text-yellow-300" />
              <span className="tracking-wide">UniNest Marketplace</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.1]">
                Your Campus <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-cyan-200 to-white animate-gradient-x">Essentials Hub</span>
              </h1>
              <p className="max-w-xl text-lg text-blue-100/90 md:text-xl leading-relaxed">
                Buy, sell, and discover everything you need for student life.
                Verified listings from your campus community.
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              {user && (
                <Button asChild size="lg" className="h-14 rounded-full bg-white px-8 text-base font-bold text-primary shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all hover:-translate-y-1 hover:shadow-[0_20px_40px_rgb(0,0,0,0.12)] active:translate-y-0 text-lg">
                  <Link href="/marketplace/new">
                    <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Start Selling
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="h-14 rounded-full border-white/20 bg-white/5 px-8 text-base text-white backdrop-blur-sm transition-all hover:bg-white/10 hover:border-white/40">
                <ShieldCheck className="mr-2 h-5 w-5" /> Verified Vendors
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-lg lg:ml-auto">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-2 shadow-2xl backdrop-blur-xl transition-transform hover:scale-[1.02] duration-500">
              <div className="relative">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-white/70" />
                <Input
                  placeholder="What are you looking for?"
                  className="h-16 w-full rounded-2xl border-0 bg-transparent pl-14 text-lg text-white placeholder:text-white/50 focus-visible:ring-0 focus-visible:bg-white/5 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Scroller */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-xl font-bold tracking-tight">Browse Categories</h3>
        </div>
        <div className="-mx-4 flex gap-4 overflow-x-auto px-4 pb-6 pt-2 scrollbar-hide snap-x md:mx-0 md:px-0">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            return (
              <Link
                key={category.name}
                href={createCategoryLink(category.name)}
                className="snap-start focus:outline-none"
              >
                <div className={`
                  group flex flex-col items-center justify-center gap-4 rounded-[1.25rem] border p-6 min-w-[140px] transition-all duration-300
                  ${isSelected
                    ? 'bg-primary border-primary ring-4 ring-primary/20 shadow-xl scale-105'
                    : 'bg-card hover:border-primary/30 hover:shadow-lg hover:-translate-y-1'
                  }
                `}>
                  <div className={`
                    flex h-12 w-12 items-center justify-center rounded-2xl transition-colors duration-300
                    ${isSelected ? 'bg-white/20 text-white' : `${category.bg} ${category.color} group-hover:scale-110`}
                  `}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`
                    text-sm font-semibold text-center line-clamp-1
                    ${isSelected ? 'text-white' : 'text-foreground group-hover:text-primary'}
                  `}>
                    {category.name}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[320px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-24 rounded-3xl border bg-card/50 p-6 shadow-sm backdrop-blur-md transition-all hover:shadow-md">
            <FilterControls
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              availableLocations={availableLocations}
              selectedType={selectedType}
              onTypeChange={setSelectedType}
              availableTypes={availableTypes}
              priceRange={priceRange}
              onPriceRangeChange={setPriceRange}
              priceBounds={priceBounds}
              sliderStep={sliderStep}
              hasProducts={products.length > 0}
              resetFilters={resetFilters}
              hasPriceFilter={hasPriceFilter}
              activeFilterCount={activeFilterCount}
            />
          </div>
        </aside>

        <div className="space-y-8">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-muted/30 p-4 border border-border/50 backdrop-blur-sm">
            <div className="flex-1">
              {appliedFilters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-muted-foreground mr-2">Active filters:</span>
                  {appliedFilters.map(filter => (
                    <Badge key={filter.id} variant="secondary" className="gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary hover:bg-primary/20 border border-primary/10 transition-colors">
                      {filter.label}
                      <button
                        onClick={() => {
                          if (filter.id === 'location') setSelectedLocation('all');
                          if (filter.id === 'type') setSelectedType('all');
                          if (filter.id === 'price') setPriceRange([priceBounds.min, priceBounds.max]);
                        }}
                        className="ml-1 rounded-full p-0.5 hover:bg-primary/20 hover:text-red-500 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="ml-2 h-7 rounded-full text-xs font-medium hover:bg-muted text-muted-foreground">
                    Clear all
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Showing <strong className="text-foreground">{sortedProducts.length}</strong> items
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="flex-1 sm:flex-initial lg:hidden rounded-xl border-border/60 bg-background/50 backdrop-blur-sm hover:bg-accent hover:text-accent-foreground">
                    <ListFilter className="mr-2 h-4 w-4" />
                    Filters {activeFilterCount > 0 && <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-[10px] text-primary-foreground">{activeFilterCount}</span>}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full max-w-[340px] p-6">
                  <SheetHeader className="pb-6">
                    <SheetTitle className="text-2xl font-bold">Filters</SheetTitle>
                  </SheetHeader>
                  <FilterControls
                    selectedLocation={selectedLocation}
                    onLocationChange={setSelectedLocation}
                    availableLocations={availableLocations}
                    selectedType={selectedType}
                    onTypeChange={setSelectedType}
                    availableTypes={availableTypes}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    priceBounds={priceBounds}
                    sliderStep={sliderStep}
                    hasProducts={products.length > 0}
                    resetFilters={resetFilters}
                    hasPriceFilter={hasPriceFilter}
                    activeFilterCount={activeFilterCount}
                  />
                  <SheetClose asChild>
                    <Button className="mt-8 w-full rounded-xl py-6 font-bold text-lg" onClick={() => setIsFilterSheetOpen(false)}>
                      Show {filteredProducts.length} Results
                    </Button>
                  </SheetClose>
                </SheetContent>
              </Sheet>

              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[200px] h-11 rounded-xl bg-background border-border/60 hover:border-primary/40 focus:ring-primary/20 transition-all">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="end" className="rounded-xl border-border/60 shadow-lg">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex h-96 flex-col items-center justify-center gap-4 rounded-3xl border border-dashed bg-card/30">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 animate-ping rounded-full bg-primary/20"></div>
                <div className="relative flex h-full w-full items-center justify-center rounded-full bg-primary/10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              </div>
              <p className="animate-pulse text-lg font-medium text-muted-foreground">Loading marketplace...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {sortedProducts.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    user={user}
                    onBuyNow={handleBuyNow}
                    isBuying={purchasingProductId === product.id}
                    isRazorpayLoaded={isLoaded}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-[400px] flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-muted-foreground/20 bg-muted/10 p-12 text-center animate-fade-in">
              <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-3xl bg-muted shadow-inner">
                <ShoppingBag className="h-10 w-10 text-muted-foreground/50" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">No listings found</h2>
              <p className="mt-2 max-w-sm text-balance text-muted-foreground">
                {selectedCategory
                  ? `We couldn't find any products in "${selectedCategory}".`
                  : 'No products match your current filters.'}
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-8 h-11 rounded-full border-primary/20 px-8 hover:bg-primary/5 hover:text-primary">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
