/**
 * @fileoverview Defines schemas and types for the AI chat flow.
 */
import {z} from 'genkit';

export const ChatInputSchema = z.object({
  history: z.array(
    z.object({
      role: z.enum(['user', 'model']),
      content: z.array(z.object({text: z.string()})),
    })
  ),
  message: z.string(),
});

export const ChatOutputSchema = z.string();

export type ChatInput = z.infer<typeof ChatInputSchema>;
export type ChatOutput = z.infer<typeof ChatOutputSchema>;
