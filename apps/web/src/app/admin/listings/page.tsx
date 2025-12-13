
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import type { Product, Profile } from "@/lib/types";
import ListingsTable from "@/components/admin/listings/table";

export const revalidate = 0;

// Explicitly define the types for clarity
type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'handle'> | null;
};


export default async function AdminListingsPage() {
    const supabase = createClient();
    
    // Use a direct join in the query for efficiency
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            profiles:seller_id (
                full_name,
                handle
            )
        `)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader title="Listing Management" description="Error loading marketplace listings." />
                <p>Could not fetch data: {error.message}</p>
            </div>
        )
    }

    const listings: ProductWithProfile[] = (data as any) || [];

    return (
        <div className="space-y-8">
            <PageHeader title="Listing Management" description="Manage all active marketplace listings." />
             <ListingsTable initialListings={listings} />
        </div>
    )
}
