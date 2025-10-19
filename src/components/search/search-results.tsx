
'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Package, BookCopy, Users, Frown } from 'lucide-react';
import type { Product, Profile } from '@/lib/types';

import ProductCard from '@/components/marketplace/product-card';
import UserListCard from '@/components/profile/user-list-card';

type SearchResults = {
  products: Product[];
  profiles: Profile[];
};

export default function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q');
  const { supabase } = useAuth();
  const { toast } = useToast();

  const [results, setResults] = useState<SearchResults>({ products: [], profiles: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const performSearch = async () => {
      const trimmedQuery = (query || '').trim();

      if (!trimmedQuery) {
        setResults({ products: [], profiles: [] });
        setLoading(false);
        return;
      }

      setLoading(true);

      const ilikePattern = `%${trimmedQuery.replace(/[%_]/g, '')}%`;

      try {
        const [productRes, profileRes] = await Promise.all([
          supabase
            .from('products')
            .select('*, profiles:seller_id(full_name)')
            .or(`name.ilike.${ilikePattern},description.ilike.${ilikePattern}`),
          supabase
            .from('profiles')
            .select('*')
            .ilike('full_name', ilikePattern),
        ]);

        if (productRes.error || profileRes.error) {
          toast({ variant: 'destructive', title: 'Search Error', description: 'Could not perform search.' });
          console.error('Search errors:', { p: productRes.error, u: profileRes.error });
          setResults({ products: [], profiles: [] });
          return;
        }

        setResults({
          products: ((productRes.data as any[]) || []).map((p) => ({ ...p, seller: p.profiles })) as Product[],
          profiles: (profileRes.data as Profile[]) || [],
        });
      } catch (error) {
        toast({ variant: 'destructive', title: 'Search Error', description: 'Could not perform search.' });
        console.error('Unexpected search error:', error);
        setResults({ products: [], profiles: [] });
      } finally {
        setLoading(false);
      }
    };

    performSearch();
  }, [query, supabase, toast]);

  const totalResults = useMemo(() => {
      return results.products.length + results.profiles.length;
  }, [results]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Searching for "{query}"...</p>
      </div>
    );
  }
  
  if (!query) {
    return (
      <div className="text-center py-10">
        <h1 className="text-2xl font-bold">Search UniNest</h1>
        <p className="text-muted-foreground">Enter a term in the search bar to find what you're looking for.</p>
      </div>
    );
  }


  return (
    <div className="space-y-12">
        <section>
            <h1 className="text-3xl font-bold tracking-tight">Search Results</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Found {totalResults} results for <span className="font-bold text-primary">"{query}"</span>
            </p>
        </section>
        
        {totalResults === 0 && (
            <div className="flex flex-col items-center justify-center min-h-[calc(100vh-400px)] text-center bg-card p-8 rounded-2xl">
                <Frown className="size-16 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-bold">No Results Found</h2>
                <p className="text-muted-foreground">Try searching for something else.</p>
            </div>
        )}

        {results.products.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2"><Package /> Marketplace Listings</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {results.products.map(p => <ProductCard key={`prod-${p.id}`} product={p} user={null} onBuyNow={()=>{}} onChat={()=>{}} isBuying={false} isRazorpayLoaded={false}/>)}
                </div>
            </section>
        )}

        {results.profiles.length > 0 && (
            <section>
                <h2 className="text-2xl font-bold tracking-tight mb-6 flex items-center gap-2"><Users /> People</h2>
                <UserListCard users={results.profiles} emptyMessage="" />
            </section>
        )}
    </div>
  );
}
