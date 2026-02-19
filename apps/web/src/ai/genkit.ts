/**
 * UniNest AI Service Configuration
 * 
 * This module initializes the Genkit AI integration using Google AI (Gemini).
 * Used for chat assistance and automated content matching within the platform.
 */

import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

/**
 * AI Core Instance
 * Configured with the Gemini 2.5 Flash model for optimal performance/latency.
 */
export const ai = genkit({
  plugins: [googleAI()],
  model: 'googleai/gemini-2.5-flash',
});
