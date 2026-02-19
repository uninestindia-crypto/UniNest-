import type { SupabaseClient } from '@supabase/supabase-js';
import type { AIChatRequest, AIChatResponse } from '@uninest/shared-types';

/**
 * AI API module (Groq)
 */
export function createAiApi(supabase: SupabaseClient) {
    return {
        /**
         * Send a chat request to the Groq AI edge function
         */
        async chat(request: AIChatRequest): Promise<AIChatResponse> {
            const { data, error } = await supabase.functions.invoke('groq-chat', {
                body: request,
            });

            if (error) throw error;
            return data as AIChatResponse;
        },
    };
}
