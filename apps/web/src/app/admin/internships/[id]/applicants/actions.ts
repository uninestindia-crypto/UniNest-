
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

export async function getApplicants(internshipId: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
            .from('internship_applications')
            .select('*')
            .eq('internship_id', internshipId)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error("Error fetching applicants from server action:", error);
            throw new Error(error.message);
        }
        
        return { applications: data || [], error: null };
    } catch (e: any) {
        return { applications: [], error: e.message };
    }
}


export async function deleteInternshipApplication(applicationId: number, internshipId: string) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin
            .from('internship_applications')
            .delete()
            .eq('id', applicationId);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath(`/admin/internships/${internshipId}/applicants`);
        revalidatePath('/admin/internships'); // Also revalidate main page for applicant counts
        return { error: null };

    } catch(e: any) {
        return { error: e.message };
    }
}
