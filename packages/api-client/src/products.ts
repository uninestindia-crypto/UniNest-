import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product, ProductCategory } from '@uninest/shared-types';

/**
 * Products API module
 */
export function createProductsApi(supabase: SupabaseClient) {
    return {
        /**
         * Fetch all active products, optionally filtered by category
         */
        async getProducts(category?: ProductCategory): Promise<Product[]> {
            let query = supabase
                .from('products')
                .select('*, profiles!seller_id(id, full_name, avatar_url, handle)')
                .eq('status', 'active')
                .order('created_at', { ascending: false });

            if (category) {
                query = query.eq('category', category);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data as Product[];
        },

        /**
         * Fetch a single product by ID
         */
        async getProduct(id: number): Promise<Product | null> {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles!seller_id(id, full_name, avatar_url, handle)')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data as Product;
        },

        /**
         * Search products by name
         */
        async searchProducts(query: string): Promise<Product[]> {
            const { data, error } = await supabase
                .from('products')
                .select('*, profiles!seller_id(id, full_name, avatar_url, handle)')
                .eq('status', 'active')
                .ilike('name', `%${query}%`)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Product[];
        },

        /**
         * Get products by seller (for vendor dashboard)
         */
        async getSellerProducts(sellerId: string): Promise<Product[]> {
            const { data, error } = await supabase
                .from('products')
                .select('*')
                .eq('seller_id', sellerId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Product[];
        },
    };
}
