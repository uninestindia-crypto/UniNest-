
'use server';

import { generateText } from '@/ai/groq';
import { type ChatInput, type ChatOutput } from './chat-schema';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { history, message } = input;

  const text = await generateText(message, history);
  return text;
}
