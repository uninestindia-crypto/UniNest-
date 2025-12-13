
import type { Metadata } from 'next';
import InternshipsClient from '@/components/workspace/internships-client';
import { createClient } from '@/lib/supabase/server';

export const metadata: Metadata = {
  title: 'Find Internships & Apply Easily',
  description: 'Browse and apply for internships from top companies. Gain real-world experience and kickstart your career with UniNest.',
};

async function getInternships() {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('internships')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching internships:', error);
    return [];
  }
  return data ?? [];
}

export default async function InternshipsPage() {
  const initialInternships = await getInternships();
  return <InternshipsClient initialInternships={initialInternships} />;
}
