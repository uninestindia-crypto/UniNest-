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

export async function deleteCompetitionEntry(entryId: number, competitionId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('competition_entries')
            .delete()
            .eq('id', entryId);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath(`/admin/competitions/${competitionId}/applicants`);
        revalidatePath('/admin/competitions'); // Also revalidate main page for entry counts
        return { error: null };

    } catch(e: any) {
        return { error: e.message };
    }
}
