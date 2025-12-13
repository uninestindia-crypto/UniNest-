
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/marketplace/product-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';
import type { MonetizationSettings } from "@/lib/types";

const defaultSettings: MonetizationSettings = {
    student: {
        charge_for_posts: false,
        post_price: 10,
    },
    vendor: {
        charge_for_posts: false,
        post_price: 10,
    },
    start_date: null,
};


export default async function NewListingPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }
    
    // Fetch monetization settings
    const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();
        
    const monetizationSettings: MonetizationSettings = {
        ...defaultSettings,
        ...(settingsData?.value as Partial<MonetizationSettings> || {}),
        student: { ...defaultSettings.student, ...(settingsData?.value as any)?.student },
        vendor: { ...defaultSettings.vendor, ...(settingsData?.value as any)?.vendor },
    };

    const userRole = user.user_metadata?.role || 'student';
    const roleSettings = userRole === 'vendor' ? monetizationSettings.vendor : monetizationSettings.student;

    const isChargingActive = () => {
        if (!roleSettings.charge_for_posts) {
            return false;
        }
        if (monetizationSettings.start_date) {
            return new Date() >= new Date(monetizationSettings.start_date);
        }
        return true;
    }

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageHeader title="Create New Listing" description="Fill out the form to add a new product to the marketplace." />
            <ProductForm 
                chargeForPosts={isChargingActive()}
                postPrice={roleSettings.post_price}
            />
        </div>
    )
}
