
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

    // Fetch ALL products for admin review (not just active ones)
    // This allows admins to see pending, active, and rejected listings
    const { data, error } = await supabase
        .from('products')
        .select(`
            *,
            profiles:seller_id (
                full_name,
                handle
            )
        `)
        .not('status', 'eq', 'removed_by_admin') // Exclude only admin-removed listings
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
            <PageHeader title="Listing Management" description="Review and manage all marketplace listings. Approve pending listings to make them visible." />
            <ListingsTable initialListings={listings} />
        </div>
    )
}
