'use server';

import { generateText } from '@/ai/groq';
import { type ChatInput, type ChatOutput } from './chat-schema';
import { createClient } from '@/lib/supabase/server';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { history, message } = input;
  const supabase = createClient();

  // 1. Fetch platform data for context (RAG)
  const [{ data: products }, { data: internships }] = await Promise.all([
    supabase.from('products').select('name, price, category, location, description').limit(10),
    supabase.from('internships').select('role, company, stipend, location').limit(10)
  ]);

  // 2. Format context
  let context = "CURRENT PLATFORM DATA (ONLY refer to this data for listings):\n\n";

  if (products && products.length > 0) {
    context += "HOSTELS/PRODUCTS:\n" + products.map(p =>
      `- ${p.name} in ${p.location} (₹${p.price}). ${p.description || ''}`
    ).join('\n') + "\n\n";
  } else {
    context += "No hostels or products currently listed.\n\n";
  }

  if (internships && internships.length > 0) {
    context += "INTERNSHIPS:\n" + internships.map(i =>
      `- ${i.role} at ${i.company} in ${i.location} (Stipend: ₹${i.stipend})`
    ).join('\n') + "\n";
  } else {
    context += "No internships currently listed.\n";
  }

  // 3. Inject context into history as a system message
  const augmentedHistory = [
    {
      role: 'system' as const,
      content: [{ text: context }]
    },
    ...history
  ];

  const text = await generateText(message, augmentedHistory);
  return text;
}
