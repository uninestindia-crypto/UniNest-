'use server';

import { generateText } from '@/ai/groq';
import { type ChatInput, type ChatOutput } from './chat-schema';
import { createClient } from '@/lib/supabase/server';

export async function chat(input: ChatInput): Promise<ChatOutput> {
  const { history, message } = input;
  const supabase = createClient();

  // 1. Fetch platform data for context (RAG)
  const [{ data: products }, { data: internships }] = await Promise.all([
    supabase.from('products')
      .select('name, price, category, location, description')
      .eq('status', 'active')
      .limit(10),
    supabase.from('internships')
      .select('role, company, stipend, location')
      .limit(10)
  ]);

  // 2. Format context
  let context = "INSTRUCTIONS:\n";
  context += "- You are the Uninest Smart Assistant.\n";
  context += "- ONLY use the 'CURRENT PLATFORM DATA' below to answer questions about available hostels, products, or internships.\n";
  context += "- If a user asks for something NOT in the list, politely say it's not currently available and offer to help with other things.\n";
  context += "- DO NOT make up names, locations, or prices.\n\n";

  context += "CURRENT PLATFORM DATA:\n\n";

  if (products && products.length > 0) {
    context += "HOSTELS/PRODUCTS:\n" + products.map(p =>
      `- ${p.name} in ${p.location} (₹${p.price}). ${p.description || ''}`
    ).join('\n') + "\n\n";
  } else {
    context += "No hostels or products currently available.\n\n";
  }

  if (internships && internships.length > 0) {
    context += "INTERNSHIPS:\n" + internships.map(i =>
      `- ${i.role} at ${i.company} in ${i.location} (Stipend: ₹${i.stipend})`
    ).join('\n') + "\n";
  } else {
    context += "No internships currently available.\n";
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
