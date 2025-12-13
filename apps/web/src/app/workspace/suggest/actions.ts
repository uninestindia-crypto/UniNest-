
'use server';

import { createClient as createServerClient } from '@/lib/supabase/server';

export async function submitSuggestion(formData: FormData) {
    const supabase = createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const rawFormData = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        deadline: formData.get('deadline') as string | null,
        contact: formData.get('contact') as string | null,
    };

    const { error } = await supabase.from('suggestions').insert({
        title: rawFormData.title,
        description: rawFormData.description,
        deadline: rawFormData.deadline || null,
        contact: rawFormData.contact,
        user_id: user?.id,
    });
    
    if (error) {
        console.error("Suggestion submission error: ", error);
        return { error: 'Failed to submit your suggestion. Please try again.' };
    }

    return { error: null };
}
