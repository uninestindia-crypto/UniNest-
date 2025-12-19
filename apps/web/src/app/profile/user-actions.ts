
'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { createClient as createServerClient } from '@/lib/supabase/server';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

/**
 * Delete user's own product listing
 * Only the owner can delete their own listing
 */
export async function deleteOwnProduct(productId: number) {
    try {
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'You must be logged in to delete a listing.' };
        }

        const supabaseAdmin = getSupabaseAdmin();

        // First verify ownership
        const { data: product, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('seller_id')
            .eq('id', productId)
            .single();

        if (fetchError || !product) {
            return { error: 'Listing not found.' };
        }

        if (product.seller_id !== user.id) {
            return { error: 'You can only delete your own listings.' };
        }

        // Soft delete by setting status
        const { error } = await supabaseAdmin
            .from('products')
            .update({ status: 'deleted_by_owner' })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/profile');
        revalidatePath('/marketplace');
        return { error: null, success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}

/**
 * Resubmit a rejected product for review
 * Sets status back to 'pending' so admin can re-review
 */
export async function resubmitProduct(productId: number) {
    try {
        const supabase = createServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return { error: 'You must be logged in to resubmit a listing.' };
        }

        const supabaseAdmin = getSupabaseAdmin();

        // Verify ownership and that it's rejected
        const { data: product, error: fetchError } = await supabaseAdmin
            .from('products')
            .select('seller_id, status')
            .eq('id', productId)
            .single();

        if (fetchError || !product) {
            return { error: 'Listing not found.' };
        }

        if (product.seller_id !== user.id) {
            return { error: 'You can only resubmit your own listings.' };
        }

        if (product.status !== 'rejected') {
            return { error: 'Only rejected listings can be resubmitted.' };
        }

        // Reset status to pending for re-review
        const { error } = await supabaseAdmin
            .from('products')
            .update({
                status: 'pending',
                rejection_reason: null // Clear rejection reason
            })
            .eq('id', productId);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/profile');
        return { error: null, success: true };
    } catch (e: any) {
        return { error: e.message };
    }
}
