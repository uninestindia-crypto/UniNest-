
import PageHeader from "@/components/admin/page-header";
import ProductForm from "@/components/marketplace/product-form";
import { createClient } from "@/lib/supabase/server";
import { redirect } from 'next/navigation';

type EditProductPageProps = {
    params: {
        id: string;
    }
}

export default async function EditProductPage({ params }: EditProductPageProps) {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: product, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
    
    if (error || !product) {
        console.error("Failed to fetch product or product not found", error);
        redirect('/vendor/products');
    }
    
    // Security check: ensure the user is the seller of the product
    if (product.seller_id !== user.id) {
        redirect('/vendor/products');
    }
    
    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageHeader title="Edit Product" description="Update the details of your product listing." />
            <ProductForm product={product} />
        </div>
    )
}
