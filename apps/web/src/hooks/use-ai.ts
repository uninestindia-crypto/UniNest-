'use client';

import { useState, useCallback } from 'react';
import { useAuth } from './use-auth';
import { createAiApi } from '@uninest/api-client';
import type { AIMessage, AIChatRequest } from '@uninest/shared-types';

export function useAi() {
    const { supabase } = useAuth();
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

    const api = createAiApi(supabase);

    const chat = useCallback(async (content: string, systemPrompt?: string) => {
        setIsLoading(true);
        setError(null);

        const newUserMessage: AIMessage = { role: 'user', content };
        const currentMessages = [...messages, newUserMessage];

        // Prepare request with optional system prompt
        const requestMessages: AIMessage[] = systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...currentMessages]
            : currentMessages;

        setMessages(currentMessages);

        try {
            const response = await api.chat({ messages: requestMessages });
            const assistantMessage: AIMessage = { role: 'assistant', content: response.message };
            setMessages(prev => [...prev, assistantMessage]);
            return response.message;
        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('AI Chat Error:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [messages, api]);

    const clearHistory = useCallback(() => {
        setMessages([]);
    }, []);

    return {
        messages,
        chat,
        isLoading,
        error,
        clearHistory
    };
}
