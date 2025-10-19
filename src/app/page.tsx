import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';
import { createClient } from '@/lib/supabase/server';
import type { HomePosterConfig } from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';

export const metadata: Metadata = {
  title: 'UniNest: 10,000+ Students Strong & Growing',
  description: 'Join the fastest-growing student platform. Connect, study, and thrive with over 10,000 of your peers on UniNest.',
};

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'home_poster')
    .single();

  const posterConfig = ((data?.value as HomePosterConfig | undefined) && Array.isArray((data?.value as HomePosterConfig).heroSlides) ? (data?.value as HomePosterConfig) : null) ?? defaultHomePosterConfig;

  return <HomeClient posterConfig={posterConfig} />;
}
