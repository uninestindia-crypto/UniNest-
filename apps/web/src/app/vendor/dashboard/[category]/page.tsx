
import { notFound } from 'next/navigation';
import CybercafeDashboard from '@/components/vendor/dashboard/cybercafe-dashboard';
import FoodMessDashboard from '@/components/vendor/dashboard/food-mess-dashboard';
import HostelDashboard from '@/components/vendor/dashboard/hostel-dashboard';
import LibraryDashboard from '@/components/vendor/dashboard/library-dashboard';
import PageHeader from '@/components/admin/page-header';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';

const categoryMap: { [key: string]: { label: string; component: React.FC<any> } } = {
    'library': { label: 'Library', component: LibraryDashboard },
    'food-mess': { label: 'Food Mess', component: FoodMessDashboard },
    'hostels': { label: 'Hostels', component: HostelDashboard },
    'cybercafe': { label: 'Cybercafé', component: CybercafeDashboard },
};

// This function now fetches data specifically for the given category, improving efficiency.
async function getVendorDataForCategory(categoryLabel: string, userId: string) {
    const supabase = createClient();

    let productCategories: string[] = [];
    if (categoryLabel === 'Hostels') {
        // For the Hostel dashboard, we need both the main hostel product and its room products.
        productCategories = ['Hostels', 'Hostel Room'];
    } else if (categoryLabel === 'Library') {
        // Include both the primary library listing and seat-level products for accurate order linkage.
        productCategories = ['Library', 'Library Seat'];
    } else {
        productCategories.push(categoryLabel);
    }
    
    // 1. Fetch only the products relevant to this category dashboard
    const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .eq('seller_id', userId)
        .in('category', productCategories);

    if (productsError) {
        console.error(`Error fetching products for ${categoryLabel} dashboard:`, productsError);
        return { products: [], orders: [] };
    }
    
    const productIds = (productsData || []).map(p => p.id);

    // 2. Fetch orders that contain items from the fetched products
    const { data: ordersData, error: ordersError } = productIds.length > 0
        ? await supabase
            .from('orders')
            .select(`
                id,
                created_at,
                total_amount,
                status,
                booking_slot,
                buyer_id,
                buyer:profiles!buyer_id(full_name, avatar_url),
                order_items:order_items!inner(
                    product_id,
                    products ( name, category )
                )
            `)
            .eq('vendor_id', userId)
            .in('order_items.product_id', productIds)
            .order('created_at', { ascending: false })
        : { data: [], error: null };

    if (ordersError) {
        console.error(`Error fetching orders for ${categoryLabel} dashboard:`, ordersError);
        // Return products even if orders fail
        return { products: (productsData as Product[]) || [], orders: [] };
    }

    return {
        products: (productsData as Product[]) || [],
        orders: (ordersData as any[]) || [],
    };
}


export default async function VendorCategoryDashboardPage({ params }: { params: { category: string } }) {
    const categoryKey = params.category;
    const categoryInfo = categoryMap[categoryKey];
    const supabase = createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!categoryInfo || !user) {
        notFound();
    }
    
    const { products, orders } = await getVendorDataForCategory(categoryInfo.label, user.id);

    const DashboardComponent = categoryInfo.component;

    // Pass the already filtered data to the specific dashboard component
    const props = {
        products,
        orders
    };

    return (
        <div>
            <DashboardComponent {...props} />
        </div>
    );
}
