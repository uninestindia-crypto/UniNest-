import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';
import { createClient } from '@/lib/supabase/server';
import { defaultHomePosterConfig } from '@/lib/home-poster';
import type { HomePosterConfig } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Uninest — AI Student Platform | Hostels, Libraries & Internships India',
  description:
    'Find student hostels, book library seats live, discover meal plans & apply for internships — all with AI help. Free for students. Vendors: list your services free.',
  keywords: ['student platform', 'student housing india', 'list your hostel', 'student marketing', 'campus opportunities', 'live seat booking', 'AI internship helper'],
  alternates: {
    canonical: 'https://uninest.co.in/',
  },
};

export const dynamic = 'force-dynamic'; // Required because we use cookies() for Supabase auth
export const revalidate = 60; // Cache for 60 seconds, revalidate in background

async function getPosterConfig(): Promise<HomePosterConfig> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'home_poster')
      .single();

    if (error) {
      console.error('[home] failed to fetch poster config:', error);
      return defaultHomePosterConfig;
    }

    const value = data?.value as HomePosterConfig | null;
    if (!value) {
      return defaultHomePosterConfig;
    }

    return {
      heroSlides:
        Array.isArray(value.heroSlides) && value.heroSlides.length > 0
          ? value.heroSlides
          : defaultHomePosterConfig.heroSlides,
      quickAccessCards:
        Array.isArray(value.quickAccessCards) && value.quickAccessCards.length > 0
          ? value.quickAccessCards
          : defaultHomePosterConfig.quickAccessCards,
      curatedCollections:
        Array.isArray(value.curatedCollections) && value.curatedCollections.length > 0
          ? value.curatedCollections
          : defaultHomePosterConfig.curatedCollections,
      mobileDeals: value.mobileDeals ?? defaultHomePosterConfig.mobileDeals,
      stats:
        Array.isArray(value.stats) && value.stats.length > 0
          ? value.stats
          : defaultHomePosterConfig.stats,
      testimonials:
        Array.isArray(value.testimonials) && value.testimonials.length > 0
          ? value.testimonials
          : defaultHomePosterConfig.testimonials,
      timeline:
        Array.isArray(value.timeline) && value.timeline.length > 0
          ? value.timeline
          : defaultHomePosterConfig.timeline,
    };
  } catch (error) {
    console.error('[home] unexpected error while loading poster config:', error);
    return defaultHomePosterConfig;
  }
}

export default async function HomePage() {
  const posterConfig = await getPosterConfig();

  return <HomeClient posterConfig={posterConfig} />;
}
