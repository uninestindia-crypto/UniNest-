
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

export async function deleteProductByAdmin(productId: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        // Instead of deleting, we'll update the status to preserve data integrity
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'removed_by_admin' })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/listings');
        return { error: null };
    } catch (e: any) {
        return { error: e.message };
    }
}
