import type { Metadata } from 'next';
import HomePosterForm from '@/components/admin/marketing/home-poster-form';
import { createClient } from '@/lib/supabase/server';
import type { HomePosterConfig } from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';

export const metadata: Metadata = {
  title: 'Marketing | UniNest Admin',
};

export default async function MarketingPage() {
  // Check if Supabase environment variables are set
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables');
    return (
      <div className="p-6 text-destructive">
        <h1 className="text-2xl font-bold mb-4">Configuration Error</h1>
        <p>Missing required environment variables for Supabase connection.</p>
        <p className="mt-2">Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are properly configured.</p>
      </div>
    );
  }

  let posterConfig = defaultHomePosterConfig;
  
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('platform_settings')
      .select('value')
      .eq('key', 'home_poster')
      .single();

    if (error) {
      console.error('Error fetching home poster config:', error);
    } else if (data?.value) {
      const rawValue = data.value as HomePosterConfig;
      if (rawValue && Array.isArray(rawValue.heroSlides)) {
        posterConfig = rawValue;
      }
    }
  } catch (error) {
    console.error('Error in MarketingPage:', error);
    return (
      <div className="p-6 text-destructive">
        <h1 className="text-2xl font-bold mb-4">Something went wrong!</h1>
        <p>We're having trouble loading the marketing settings.</p>
        <p className="mt-2">Please check your internet connection and try again. If the problem persists, contact support.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">
          Manage the home page hero poster experience.
        </p>
      </div>
      <HomePosterForm initialConfig={posterConfig} />
    </div>
  );
}
