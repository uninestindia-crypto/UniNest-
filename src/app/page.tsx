import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';
import { createClient } from '@/lib/supabase/server';
import type { HomePosterConfig } from '@/lib/types';

export const metadata: Metadata = {
  title: 'UniNest: 10,000+ Students Strong & Growing',
  description: 'Join the fastest-growing student platform. Connect, study, and thrive with over 10,000 of your peers on UniNest.',
};

const defaultPosterConfig: HomePosterConfig = {
  heroSlides: [
    {
      id: 'default-1',
      title: 'Experience UniNest',
      subtitle: 'Connect, learn, and shop smarter with India\'s favorite student hub',
      imageUrl: 'https://placehold.co/1600x500/orange/white?text=Welcome+to+UniNest',
      ctaLabel: 'Join Now',
      ctaHref: '/signup',
      secondaryCtaLabel: 'Explore',
      secondaryCtaHref: '/feed',
      tag: 'Featured',
    },
  ],
};

export default async function HomePage() {
  const supabase = createClient();
  const { data } = await supabase
    .from('platform_settings')
    .select('value')
    .eq('key', 'home_poster')
    .single();

  const posterConfig = (data?.value as HomePosterConfig | null) ?? defaultPosterConfig;

  return <HomeClient posterConfig={posterConfig} />;
}
