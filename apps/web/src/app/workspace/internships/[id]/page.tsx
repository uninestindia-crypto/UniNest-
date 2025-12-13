
import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import InternshipDetailClient from '@/components/workspace/internship-detail-client';
import type { PlatformSettings } from '@/lib/types';

type InternshipDetailPageProps = {
    params: { id: string };
};

export async function generateMetadata({ params }: InternshipDetailPageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: internship } = await supabase
    .from('internships')
    .select('role, company')
    .eq('id', params.id)
    .single();

  if (!internship) {
    return {
      title: 'Internship Not Found | UniNest',
    };
  }

  return {
    title: `${internship.role} at ${internship.company} | UniNest`,
    description: `Apply for the ${internship.role} internship at ${internship.company}.`,
  };
}


export default async function InternshipDetailPage({ params }: InternshipDetailPageProps) {
    const supabase = createClient();
    const { data: settingsData } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .maybeSingle();

    const visibilitySettings = (settingsData?.value as PlatformSettings | null)?.applicationVisibility;

    const { data: internship, error } = await supabase
        .from('internships')
        .select('*')
        .eq('id', params.id)
        .single();
    
    if (error || !internship) {
        notFound();
    }
    
    const { data: applicants } = await supabase
        .from('internship_applications')
        .select(`
            user_id,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .eq('internship_id', internship.id);

    const mappedApplicants = (applicants ?? []).map((application) => {
        const rawProfile = Array.isArray(application.profiles) ? application.profiles[0] : application.profiles;

        return {
            user_id: application.user_id,
            profiles: rawProfile
                ? {
                    full_name: rawProfile.full_name ?? 'Anonymous',
                    avatar_url: rawProfile.avatar_url ?? null,
                }
                : null,
        };
    });

    return (
        <InternshipDetailClient
            internship={internship}
            initialApplicants={mappedApplicants}
            showApplicants={visibilitySettings?.showInternshipApplicants ?? true}
        />
    );
}
