
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import CompetitionDetailClient from '@/components/workspace/competition-detail-client';
import type { PlatformSettings } from '@/lib/types';

type CompetitionDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: CompetitionDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: competition } = await supabase
    .from('competitions')
    .select('title, description')
    .eq('id', params.id)
    .single();

  if (!competition) {
    return {
      title: 'Competition Not Found | UniNest',
    };
  }

  return {
    title: `${competition.title} | UniNest Competitions`,
    description: competition.description,
  };
}


export default async function CompetitionDetailPage({ params }: CompetitionDetailPageProps) {
    const supabase = createClient();
    if (!supabase) {
        notFound();
    }

    const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .maybeSingle();

    const visibilitySettings = (settingsData?.value as PlatformSettings | null)?.applicationVisibility;

    let competitionQuery = supabase
        .from('competitions')
        .select('*, winner:winner_id(full_name, avatar_url)')
        .eq('id', params.id)
        .single();
        
    const { data: competition, error } = await competitionQuery;

    if (error || !competition) {
        notFound();
    }

    const { data: entries, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
            user_id,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('competition_id', competition.id);

    const mappedApplicants = (entries ?? []).map((entry) => {
        const rawProfile = Array.isArray(entry.profiles) ? entry.profiles[0] : entry.profiles;

        return {
            user_id: entry.user_id,
            profiles: rawProfile
                ? {
                    full_name: rawProfile.full_name ?? 'Anonymous',
                    avatar_url: rawProfile.avatar_url ?? null,
                }
                : null,
        };
    });

    return (
        <CompetitionDetailClient
            competition={competition as any}
            initialApplicants={mappedApplicants}
            showApplicants={visibilitySettings?.showCompetitionApplicants ?? true}
        />
    );
}
