
'use server';

import {ai} from '@/ai/genkit';
import {type ChatInput, type ChatOutput} from './chat-schema';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const {history, message} = input;

  const {text} = await ai.generate({
    prompt: message,
    history: history,
  });
  return text;
}
