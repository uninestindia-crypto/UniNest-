
'use server';

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

const getSupabaseAdmin = () => {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error('Supabase service role key is not configured.');
    }
    return createClient(supabaseUrl, supabaseServiceKey);
}

const ensureBucketExists = async (supabaseAdmin: SupabaseClient, bucket: string) => {
    const { data, error } = await supabaseAdmin.storage.getBucket(bucket);
    if (data) {
        return { error: null };
    }

    if (error && error.message && !error.message.toLowerCase().includes('not found')) {
        return { error: error.message };
    }

    const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, { public: true });
    if (createError) {
        return { error: createError.message };
    }

    return { error: null };
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


export async function createCompetition(formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            prize: Number(formData.get('prize')),
            entry_fee: Number(formData.get('entry_fee')),
            deadline: formData.get('deadline') as string,
        };

        const imageFile = formData.get('image') as File | null;
        const pdfFile = formData.get('details_pdf') as File | null;

        let imageUrl: string | null = null;
        let pdfUrl: string | null = null;

        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, imageFile, 'competitions');
            if (error) {
                return { error: `Failed to upload banner image: ${error}` };
            }
            imageUrl = url;
        }
        if (pdfFile && pdfFile instanceof File && pdfFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, pdfFile, 'competitions');
            if (error) {
                return { error: `Failed to upload details PDF: ${error}` };
            }
            pdfUrl = url;
        }

        const { error } = await supabaseAdmin.from('competitions').insert({
          title: rawFormData.title,
          description: rawFormData.description,
          prize: rawFormData.prize,
          entry_fee: rawFormData.entry_fee,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        });

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/competitions');
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function updateCompetition(id: number, formData: FormData) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            title: formData.get('title') as string,
            description: formData.get('description') as string,
            prize: Number(formData.get('prize')),
            entry_fee: Number(formData.get('entry_fee')),
            deadline: formData.get('deadline') as string,
        };

        const imageFile = formData.get('image') as File | null;
        const pdfFile = formData.get('details_pdf') as File | null;

        const { data: existing } = await supabaseAdmin.from('competitions').select('image_url, details_pdf_url').eq('id', id).single();
        
        let imageUrl = existing?.image_url || null;
        let pdfUrl = existing?.details_pdf_url || null;

        if (imageFile && imageFile instanceof File && imageFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, imageFile, 'competitions');
            if (error) return { error: `Failed to upload banner image: ${error}` };
            imageUrl = url;
        }
        if (pdfFile && pdfFile instanceof File && pdfFile.size > 0) {
            const { url, error } = await uploadFile(supabaseAdmin, pdfFile, 'competitions');
            if (error) return { error: `Failed to upload details PDF: ${error}` };
            pdfUrl = url;
        }

        const { error } = await supabaseAdmin.from('competitions').update({
          title: rawFormData.title,
          description: rawFormData.description,
          prize: rawFormData.prize,
          entry_fee: rawFormData.entry_fee,
          deadline: new Date(rawFormData.deadline).toISOString(),
          image_url: imageUrl,
          details_pdf_url: pdfUrl,
        }).eq('id', id);

        if (error) {
            return { error: error.message };
        }

        revalidatePath('/admin/competitions');
        revalidatePath(`/admin/competitions/${id}/edit`);
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}

export async function deleteCompetition(id: number) {
    try {
        const supabaseAdmin = getSupabaseAdmin();
        const { error } = await supabaseAdmin.from('competitions').delete().eq('id', id);

        if (error) {
            return { error: error.message };
        }
        
        revalidatePath('/admin/competitions');
        revalidatePath('/workspace/competitions');
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}
