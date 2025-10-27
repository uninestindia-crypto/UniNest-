
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

const uploadFile = async (supabaseAdmin: any, file: File, bucket: string, userId: string): Promise<string | null> => {
    if (!file || file.size === 0) return null;
    const filePath = `applications/${userId}/${Date.now()}-${file.name}`;

    // Ensure bucket exists before uploading
    const { error: bucketError } = await supabaseAdmin.storage
      .from(bucket)
      .ensureBucketExists();
    if (bucketError) {
      console.error('Bucket Error:', bucketError);
      return null;
    }

    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, file, {
        // Handle Supabase types correctly
        upsert: true,
        cacheControl: '3600',
        contentType: file.type,
      });

    if (uploadError) {
      console.error('Upload Error:', uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucket)
      .getPublicUrl(filePath);
      
    return publicUrl;
}

export async function submitApplication(formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { error: 'You must be logged in to apply.' };
    }

    try {
        const supabaseAdmin = getSupabaseAdmin();
        const rawFormData = {
            internshipId: Number(formData.get('internshipId')),
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            phone_number: formData.get('phone_number') as string,
            whatsapp_number: formData.get('whatsapp_number') as string,
            coverLetter: formData.get('coverLetter') as string,
        };

        const resumeFile = formData.get('resume') as File | null;
        let resumeUrl: string | null = null;
        
        if (resumeFile && resumeFile instanceof File && resumeFile.size > 0) {
            resumeUrl = await uploadFile(supabaseAdmin, resumeFile, 'internship-applications', user.id);
            if (!resumeUrl) {
                return { error: 'Failed to upload resume.' };
            }
        } else {
            return { error: 'Resume PDF is required.' };
        }

        const { error } = await supabaseAdmin.from('internship_applications').insert({
          internship_id: rawFormData.internshipId,
          user_id: user.id,
          name: rawFormData.name,
          email: rawFormData.email,
          phone_number: rawFormData.phone_number,
          whatsapp_number: rawFormData.whatsapp_number,
          cover_letter: rawFormData.coverLetter,
          resume_url: resumeUrl,
        });

        if (error) {
            return { error: error.message };
        }

        revalidatePath(`/workspace/internships/${rawFormData.internshipId}`);
        return { error: null };
    } catch(e: any) {
        return { error: e.message };
    }
}
