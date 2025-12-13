
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import HostelDetailClient from '@/components/hostels/hostel-detail-client';
import type { Product } from '@/lib/types';

type HostelDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: HostelDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: hostel } = await supabase
    .from('products')
    .select('name, description, image_url')
    .eq('id', params.id)
    .eq('category', 'Hostels')
    .single();

  if (!hostel) {
    return {
      title: 'Hostel Not Found | UniNest',
    };
  }

  return {
    title: `${hostel.name} | UniNest Hostels`,
    description: hostel.description,
    openGraph: {
        images: [
            {
                url: hostel.image_url || '/images/uninest-og-new.png',
                width: 1200,
                height: 630,
                alt: hostel.name,
            }
        ]
    }
  };
}

export default async function HostelDetailPage({ params }: HostelDetailPageProps) {
    const supabase = createClient();
    const { data: hostel, error } = await supabase
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
        .eq('category', 'Hostels')
        .single();
    
    if (error || !hostel) {
        notFound();
    }
    
    const { data: { user } } = await supabase.auth.getUser();

    // Fetch rooms for this hostel
    const { data: rooms } = await supabase
        .from('products')
        .select('*')
        .eq('category', 'Hostel Room')
        .eq('seller_id', hostel.seller_id);
    
    // Fetch all relevant orders to determine room status
    const roomIds = (rooms || []).map(r => r.id);
    const { data: orders } = await supabase
        .from('orders')
        .select('id, status, order_items!inner(product_id)')
        .eq('vendor_id', hostel.seller_id)
        .in('order_items.product_id', roomIds)
        .in('status', ['pending_approval', 'approved']);
        
    return <HostelDetailClient 
        hostel={hostel as Product} 
        initialRooms={rooms || []}
        initialOrders={orders || []} 
        currentUser={user} 
    />;
}
