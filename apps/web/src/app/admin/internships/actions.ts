
'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { ensureBucketExists } from '@/lib/supabase/storage';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

const uploadFile = async (supabaseAdmin: SupabaseClient, file: File, bucket: string) => {
    if (!file || file.size === 0) {
        return { url: null, error: 'No file provided for upload.' };
    }

    const { error: ensureError } = await ensureBucketExists(supabaseAdmin, bucket);
    if (ensureError) {
        return { url: null, error: ensureError };
    }

    const filePath = `admin/${Date.now()}-${file.name}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        contentType: file.type || 'application/octet-stream',
      });
    
    if (uploadError) {
      console.error('Upload Error:', {
        bucket,
        filePath,
        message: uploadError.message,
      });
      return { url: null, error: uploadError.message };
    }
    
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);

    if (!publicUrl) {
        return { url: null, error: 'Unable to generate public URL for uploaded file.' };
    }
      
    return { url: publicUrl, error: null };
}

export async function createInternship(formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();

        const rawFormData = {
            role: formData.get('role') as string,
            company: formData.get('company') as string,
            stipend: Number(formData.get('stipend')),
            stipend_period: formData.get('stipend_period') as string,
            location: formData.get('location') as string,
            deadline: formData.get('deadline') as string,
        };

        const imageFile = formData.get('image') as File | null;
        const pdfFile = formData.get('details_pdf') as File | null;

        let imageUrl: string | null = null;
        let pdfUrl: string | null = null;

        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, imageFile, 'internships');
            if (error) {
                return { error: `Failed to upload image: ${error}` };
            }
            imageUrl = url;
        }
        if (pdfFile && pdfFile instanceof File && pdfFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, pdfFile, 'internships');
            if (error) {
                return { error: `Failed to upload PDF: ${error}` };
            }
            pdfUrl = url;
        }

        const { error } = await supabaseAdmin.from('internships').insert({
          role: rawFormData.role,
          company: rawFormData.company,
          stipend: rawFormData.stipend,
          stipend_period: rawFormData.stipend_period,
          location: rawFormData.location,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        });

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/internships');
        revalidatePath('/workspace/internships');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function updateInternship(id: number, formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            role: formData.get('role') as string,
            company: formData.get('company') as string,
            stipend: Number(formData.get('stipend')),
            stipend_period: formData.get('stipend_period') as string,
            location: formData.get('location') as string,
            deadline: formData.get('deadline') as string,
        };

        const imageFile = formData.get('image') as File | null;
        const pdfFile = formData.get('details_pdf') as File | null;
        
        const { data: existing } = await supabaseAdmin.from('internships').select('image_url, details_pdf_url').eq('id', id).single();
        
        let imageUrl = existing?.image_url || null;
        let pdfUrl = existing?.details_pdf_url || null;

        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, imageFile, 'internships');
            if (error) return { error: `Failed to upload image: ${error}` };
            imageUrl = url;
        }
        if (pdfFile && pdfFile instanceof File && pdfFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, pdfFile, 'internships');
            if (error) return { error: `Failed to upload PDF: ${error}` };
            pdfUrl = url;
        }

        const { error } = await supabaseAdmin.from('internships').update({
          role: rawFormData.role,
          company: rawFormData.company,
          stipend: rawFormData.stipend,
          stipend_period: rawFormData.stipend_period,
          location: rawFormData.location,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        }).eq('id', id);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/internships');
        revalidatePath(`/admin/internships/${id}/edit`);
        revalidatePath('/workspace/internships');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteInternship(id: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.from('internships').delete().eq('id', id);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/internships');
        revalidatePath('/workspace/internships');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}
