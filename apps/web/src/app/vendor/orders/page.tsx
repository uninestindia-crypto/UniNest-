
import type { Metadata } from 'next';
import VendorOrdersContent from '@/components/vendor/orders/page';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import type { Order } from '@/lib/types';

export const metadata: Metadata = {
  title: 'My Orders | Uninest',
  description: 'View and manage your customer orders.',
};

export default async function VendorOrdersPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          total_amount,
          status,
          order_items (
            quantity,
            products ( name )
          ),
          buyer:profiles!buyer_id(
            id, full_name, avatar_url
          )
        `)
        .eq('vendor_id', user.id)
        .order('created_at', { ascending: false });

    const orders = (data as unknown as Order[]) || [];

    return (
        <VendorOrdersContent initialOrders={orders} />
    )
}
