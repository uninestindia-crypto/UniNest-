/**
 * UniNest AI Service Configuration - Groq
 * 
 * This module initializes the Groq SDK integration.
 * Used for chat assistance and automated content matching within the platform.
 */

import Groq from 'groq-sdk';

/**
 * Retrieves a list of available Groq API keys from environment variables.
 * We support GROQ_API_KEY_1 through GROQ_API_KEY_8 for rotation.
 */
function getApiKeys(): string[] {
    const keys: string[] = [];
    for (let i = 1; i <= 8; i++) {
        const key = process.env[`GROQ_API_KEY_${i}`];
        if (key) {
            keys.push(key);
        }
    }

    // Fallback to the standard GROQ_API_KEY if specific numbered ones don't exist
    if (keys.length === 0 && process.env.GROQ_API_KEY) {
        keys.push(process.env.GROQ_API_KEY);
    }

    return keys;
}

let apiKeys: string[] | null = null;
let currentKeyIndex = 0;

/**
 * Returns a Groq client instance, automatically rotating to the next available API key.
 * This helps mitigate rate limits when using the free tier or high volume requests.
 */
export function getGroqClient(): Groq {
    if (apiKeys === null) {
        apiKeys = getApiKeys();
        if (apiKeys.length === 0) {
            console.warn('No Groq API keys found in the environment. AI features may fail.');
        }
    }

    if (apiKeys.length === 0) {
        // Return a client with a dummy key so it builds, but will fail gracefully at runtime
        // if not configured properly rather than crashing during startup.
        return new Groq({ apiKey: 'unconfigured' });
    }

    // Select the current key and advance the index for the next call
    const apiKey = apiKeys[currentKeyIndex];
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;

    return new Groq({ apiKey });
}

/**
 * Generates text using the Groq API.
 * Uses `llama-3.3-70b-versatile` as the default model.
 */
export async function generateText(prompt: string, history: any[] = []): Promise<string> {
    const groq = getGroqClient();

    try {
        const messages = [
            ...history.map(msg => ({
                role: msg.role === 'model' ? 'assistant' : msg.role,
                content: msg.content.map((c: any) => c.text).join('\n')
            })),
            { role: 'user', content: prompt }
        ];

        const chatCompletion = await groq.chat.completions.create({
            messages: messages as any,
            model: 'llama-3.3-70b-versatile',
            temperature: 0.7,
            max_tokens: 4000,
            top_p: 1,
            stream: false,
        });

        return chatCompletion.choices[0]?.message?.content || '';
    } catch (error) {
        console.error('Error generating text with Groq:', error);
        throw new Error('Failed to generate response');
    }
}
