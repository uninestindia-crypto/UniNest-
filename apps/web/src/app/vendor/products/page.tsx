
import type { Metadata } from 'next';
import VendorProductsContent from '@/components/vendor/products/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'My Products | Uninest',
  description: 'Manage your product listings.',
};

export default async function VendorProductsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('seller_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching vendor products", error);
    // Render a state within the component instead of returning null
  }

  return (
    <VendorProductsContent initialProducts={products || []} />
    );
}

    