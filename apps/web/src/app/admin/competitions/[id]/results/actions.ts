
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

export async function declareWinner(formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const competitionId = formData.get('competitionId') as string;
        const winnerId = formData.get('winnerId') as string;
        const resultDescription = formData.get('resultDescription') as string;

        if (!competitionId || !winnerId) {
            return { error: 'Competition ID and Winner ID are required.' };
        }

        const { error } = await supabaseAdmin
            .from('competitions')
            .update({ 
                winner_id: winnerId,
                result_description: resultDescription 
            })
            .eq('id', competitionId);

        if (error) {
            return { error: error.message };
        }

        revalidatePath(`/admin/competitions/${competitionId}/results`);
        revalidatePath(`/workspace/competitions/${competitionId}`);
        return { error: null, message: 'Winner has been declared successfully!' };
    } catch(e: any) {
        return { error: e.message };
    }
}
