'use client';

import { useState, useCallback } from 'react';
import { chat as groqChat } from '@/ai/flows/chat-flow';
import type { AIMessage } from '@uninest/shared-types';

export function useAi() {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<Error | null>(null);

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
            const history = messages.map(m => ({
                role: m.role === 'assistant' ? 'model' as const : m.role as 'user' | 'model' | 'system',
                content: [{ text: m.content }]
            }));

            if (systemPrompt) {
                history.unshift({
                    role: 'system',
                    content: [{ text: systemPrompt }]
                });
            }

            const chatInput = {
                history,
                message: content
            };

            const response = await groqChat(chatInput as any);
            const assistantMessage: AIMessage = { role: 'assistant', content: response };
            setMessages(prev => [...prev, assistantMessage]);
            return response;
        } catch (err) {
            const error = err as Error;
            setError(error);
            console.error('AI Chat Error:', error);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [messages]);

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
