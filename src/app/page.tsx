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
  let posterConfig: HomePosterConfig = defaultHomePosterConfig;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (supabaseUrl && supabaseAnonKey) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'home_poster')
        .single();

      if (!error) {
        const rawValue = data?.value as HomePosterConfig | null;
        if (
          rawValue &&
          Array.isArray(rawValue.heroSlides) &&
          Array.isArray(rawValue.quickAccessCards) &&
          Array.isArray(rawValue.curatedCollections)
        ) {
          posterConfig = rawValue;
        }
      }
    } catch (error) {
      console.error('Failed to load home poster config', error);
    }
  }

  return <HomeClient posterConfig={posterConfig} />;
}
