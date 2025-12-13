
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

export async function updateTicketStatus(ticketId: number, status: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('support_tickets')
            .update({ status })
            .eq('id', ticketId);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/tickets');
        revalidatePath(`/admin/tickets/${ticketId}`);
        return { error: null };

    } catch(e: any) {
        return { error: e.message };
    }
}
