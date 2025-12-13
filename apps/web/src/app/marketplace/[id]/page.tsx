
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/marketplace/product-detail-client';
import type { Product } from '@/lib/types';
import type { Metadata } from 'next';

type ProductDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: product } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', params.id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found | UniNest',
    };
  }

  return {
    title: `${product.name} | UniNest Marketplace`,
    description: product.description,
    openGraph: {
        images: [
            {
                url: product.image_url || '/images/uninest-og-new.png',
                width: 1200,
                height: 630,
                alt: product.name,
            }
        ]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const supabase = createClient();
    const { data: product, error } = await supabase
        .from('products')
        .select(`
            *,
            seller:seller_id (
                id,
                full_name,
                avatar_url,
                handle
            )
        `)
        .eq('id', params.id)
        .single();
    
    if (error || !product) {
        notFound();
    }

    const { data: { user } } = await supabase.auth.getUser();

    return <ProductDetailClient product={product as Product} currentUser={user} />;
}
