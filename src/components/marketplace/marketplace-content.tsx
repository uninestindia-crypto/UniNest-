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
      <div className="space-y-1">
        <h2 className="text-xl font-bold tracking-tight">Refine Results</h2>
        <p className="text-sm text-muted-foreground">Find exactly what you need.</p>
      </div>

      <div className="space-y-4">
        <Label className="text-sm font-semibold">Location</Label>
        <Select value={selectedLocation} onValueChange={onLocationChange}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-background">
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
        <Label className="text-sm font-semibold">Type</Label>
        <Select value={selectedType} onValueChange={onTypeChange}>
          <SelectTrigger className="w-full h-10 rounded-xl bg-background">
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

      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-semibold">Price Range</Label>
          <span className="text-xs font-medium text-muted-foreground">
            ₹{Math.round(priceRange[0]).toLocaleString()} – ₹{Math.round(priceRange[1]).toLocaleString()}
          </span>
        </div>
        <Slider
          value={priceRange}
          onValueChange={value => onPriceRangeChange([value[0], value[1]])}
          min={priceBounds.min}
          max={priceBounds.max}
          step={sliderStep}
          disabled={!hasProducts}
          className="py-4"
        />
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="marketplace-price-min" className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Min Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
              <Input
                id="marketplace-price-min"
                type="number"
                min={priceBounds.min}
                max={priceRange[1]}
                value={priceRange[0]}
                disabled={!hasProducts}
                onChange={handleMinInputChange}
                className="pl-6 h-9 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="marketplace-price-max" className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Max Price</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">₹</span>
              <Input
                id="marketplace-price-max"
                type="number"
                min={priceRange[0]}
                max={priceBounds.max}
                value={priceRange[1]}
                disabled={!hasProducts}
                onChange={handleMaxInputChange}
                className="pl-6 h-9 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={resetFilters}
          className="w-full rounded-xl"
          disabled={!hasProducts || (!activeFilterCount && !hasPriceFilter)}
        >
          Reset Filters
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
    <div className="space-y-10 pb-20">
      {/* Modern Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-primary text-primary-foreground p-8 md:p-12 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10"></div>
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-accent/20 blur-3xl rounded-full"></div>
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-secondary/20 blur-3xl rounded-full"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="max-w-2xl space-y-4">
            <Badge variant="secondary" className="bg-white/10 text-white hover:bg-white/20 border-0 backdrop-blur-md">
              <Sparkles className="w-3 h-3 mr-2 text-yellow-300" />
              UniNest Marketplace
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-loose">
              Buy, Sell & Explore <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">Campus Needs</span>
            </h1>
            <p className="text-lg text-primary-foreground/80 max-w-xl">
              The trusted platform for verified stays, textbooks, and essentials. By students, for students.
            </p>

            <div className="flex flex-wrap gap-4 pt-4">
              {user && (
                <Button asChild size="lg" className="rounded-full bg-white text-primary hover:bg-white/90 font-bold shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95">
                  <Link href="/marketplace/new">
                    <Plus className="mr-2 h-5 w-5" /> Start Selling
                  </Link>
                </Button>
              )}
              <Button variant="outline" size="lg" className="rounded-full bg-transparent border-white/30 text-white hover:bg-white/10 hover:text-white backdrop-blur-sm">
                <ShieldCheck className="mr-2 h-5 w-5" /> Verified Vendors
              </Button>
            </div>
          </div>

          <div className="w-full max-w-md bg-white/10 backdrop-blur-xl p-2 rounded-2xl border border-white/20 shadow-xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
              <Input
                placeholder="Search for books, hostels, etc..."
                className="bg-transparent border-0 text-white placeholder:text-white/50 pl-11 h-12 text-lg focus-visible:ring-0 focus-visible:bg-white/10 rounded-xl transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Scroller */}
      <section>
        <div className="flex items-center justify-between mb-4 md:mb-6 px-1">
          <h3 className="text-lg font-bold text-foreground">Browse Categories</h3>
        </div>
        <div className="-mx-4 md:mx-0 px-4 md:px-0 flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar scroll-pl-4">
          {categories.map(category => {
            const Icon = category.icon;
            const isSelected = selectedCategory === category.name;
            return (
              <Link
                key={category.name}
                href={createCategoryLink(category.name)}
                className="snap-start"
              >
                <div className={`
                                flex flex-col items-center justify-center gap-3 p-4 md:p-6 min-w-[120px] md:min-w-[140px] rounded-2xl border transition-all duration-300 cursor-pointer
                                ${isSelected
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg scale-105'
                    : 'bg-card hover:border-primary/50 hover:shadow-md hover:-translate-y-1'
                  }
                            `}>
                  <div className={`p-3 rounded-full ${isSelected ? 'bg-white/20' : category.bg}`}>
                    <Icon className={`w-5 h-5 md:w-6 md:h-6 ${isSelected ? 'text-white' : category.color}`} />
                  </div>
                  <span className="font-semibold text-xs md:text-sm text-center line-clamp-1">{category.name}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <section className="grid gap-6 lg:gap-8 lg:grid-cols-[280px_1fr] xl:grid-cols-[300px_1fr]">
        <aside className="hidden lg:block relative">
          <div className="sticky top-24 space-y-6 rounded-3xl border bg-card/50 backdrop-blur-sm p-6 shadow-sm">
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

        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card/30 p-4 rounded-2xl border border-transparent sm:border-border/50">
            <div className="flex-1 w-full sm:w-auto">
              {appliedFilters.length > 0 ? (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-muted-foreground mr-2 hidden sm:inline">Active filters:</span>
                  {appliedFilters.map(filter => (
                    <Badge key={filter.id} variant="secondary" className="rounded-full px-3 py-1 text-xs font-medium bg-primary/10 text-primary border-primary/20">
                      {filter.label}
                      <button onClick={() => {
                        if (filter.id === 'location') setSelectedLocation('all');
                        if (filter.id === 'type') setSelectedType('all');
                        if (filter.id === 'price') setPriceRange([priceBounds.min, priceBounds.max]);
                      }} className="ml-2 hover:text-destructive">
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="text-xs h-7 ml-2 text-muted-foreground hover:text-foreground">
                    Clear
                  </Button>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground font-medium">
                  Showing <span className="text-foreground font-bold">{sortedProducts.length}</span> results
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden flex-1 sm:flex-initial rounded-xl bg-card">
                    <ListFilter className="w-4 h-4 mr-2" />
                    Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto z-[60]">
                  <SheetHeader className="mb-6">
                    <SheetTitle className="text-left text-2xl font-bold">Filters</SheetTitle>
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
                    <Button className="w-full mt-6" onClick={() => setIsFilterSheetOpen(false)}>
                      Show {filteredProducts.length} Results
                    </Button>
                  </SheetClose>
                </SheetContent>
              </Sheet>

              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-full sm:w-[180px] rounded-xl bg-card">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest Arrivals</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center h-96 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <p className="text-muted-foreground animate-pulse">Loading marketplace...</p>
            </div>
          ) : sortedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
              {sortedProducts.map((product, index) => (
                <div key={product.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full" style={{ animationDelay: `${index * 50}ms` }}>
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
            <div className="flex flex-col items-center justify-center py-24 text-center bg-card/50 border border-dashed rounded-3xl">
              <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">No listings found</h2>
              <p className="text-muted-foreground max-w-sm mt-2">
                {selectedCategory ? `We couldn't find any products in "${selectedCategory}".` : 'No products have been listed yet.'}
                <br /> Try adjusting your filters or check back later.
              </p>
              <Button variant="outline" onClick={resetFilters} className="mt-8 rounded-full">
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
