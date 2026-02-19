import { Suspense } from 'react';
import type { Metadata } from 'next';
import MarketplaceContent from '@/components/marketplace/marketplace-content';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Student Marketplace | Buy & Sell Books, Furniture & More',
  description: 'Explore India’s top student marketplace. Buy and sell second-hand textbooks, cycles, electronics, and hostel essentials within your campus community.',
  keywords: ['student marketplace', 'buy sell books', 'used college supplies', 'student discounts', 'campus classifieds'],
};

async function getProducts(category?: string) {
  const supabase = createClient();
  let query = supabase
    .from('products')
    .select(`
      *,
      profiles:seller_id (
        full_name
      )
    `);

  if (category) {
    if (category === 'Other Products') {
      query = query.not('category', 'in', '("Books", "Hostels", "Food Mess", "Cyber Café", "Library", "Hostel Room", "Library Seat")');
    } else {
      query = query.eq('category', category);
    }
  } else {
    // Exclude child products from main view
    query = query.not('category', 'in', '("Hostel Room", "Library Seat")');
  }

  const { data, error } = await query
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return [];
  }

  // Map Supabase response to Product type expecting 'seller'
  return data.map((p: any) => ({
    ...p,
    seller: p.profiles
  })) as Product[];
}

export default async function MarketplacePage({ searchParams }: { searchParams: { category?: string } }) {
  const category = searchParams.category;
  const initialProducts = await getProducts(category);

  return (
    <Suspense>
      <MarketplaceContent initialProducts={initialProducts} />
    </Suspense>
  );
}
