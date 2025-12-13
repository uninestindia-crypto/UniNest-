
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

export async function updateSuggestionStatus(suggestionId: number, status: 'approved' | 'rejected') {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('suggestions')
            .update({ status })
            .eq('id', suggestionId);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/suggestions');
        return { error: null };

    } catch(e: any) {
        return { error: e.message };
    }
}


export async function deleteSuggestion(suggestionId: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('suggestions')
            .delete()
            .eq('id', suggestionId);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/suggestions');
        return { error: null };

    } catch(e: any) {
        return { error: e.message };
    }
}
