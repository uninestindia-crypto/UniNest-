
import PageHeader from "@/components/admin/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ApplicantsTable from "@/components/admin/competitions/applicants-table";

type Applicant = {
    id: number;
    created_at: string;
    razorpay_payment_id: string | null;
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null;
};

export const revalidate = 0;

export default async function CompetitionApplicantsPage({ params }: { params: { id: string } }) {
    let competition: { id: number | string; title: string } | null = null;
    let entries: any[] = [];
    let errorMessage: string | null = null;

    try {
        const supabase = createAdminClient();
        const competitionId = Number(params.id);

        if (Number.isNaN(competitionId)) {
            throw new Error('Invalid competition identifier.');
        }

        const { data: competitionData, error: competitionError } = await supabase
            .from('competitions')
            .select('id, title')
            .eq('id', competitionId)
            .single();

        if (competitionError) {
            throw new Error(`Failed to load competition: ${competitionError.message}`);
        }

        if (!competitionData) {
            notFound();
        }

        competition = competitionData;

        const { data: entriesData, error: entriesError } = await supabase
            .from('competition_entries')
            .select(`
                id,
                created_at,
                razorpay_payment_id,
                user_id,
                profile:profiles (
                    full_name,
                    avatar_url
                )
            `)
            .eq('competition_id', competitionId)
            .order('created_at', { ascending: false });

        if (entriesError) {
            throw new Error(`Failed to load entrants: ${entriesError.message}`);
        }

        entries = entriesData ?? [];
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to load competition entrants.';
    }

    if (errorMessage) {
        return (
            <div className="space-y-8">
                <PageHeader title="Competition Entrants" description="All users who have entered this competition." />
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                    {errorMessage}
                </div>
            </div>
        );
    }

    if (!competition) {
        notFound();
    }

    const mappedEntries: Applicant[] = entries.map((entry) => {
        const rawProfile = Array.isArray(entry.profile) ? entry.profile[0] : entry.profile;

        return {
            id: Number(entry.id),
            created_at: entry.created_at as string,
            razorpay_payment_id: entry.razorpay_payment_id ?? null,
            user_id: entry.user_id as string,
            profiles: rawProfile
                ? {
                    full_name: (rawProfile.full_name ?? 'Anonymous') as string,
                    avatar_url: rawProfile.avatar_url ?? null,
                }
                : null,
        } satisfies Applicant;
    });

    return (
        <div className="space-y-8">
            <PageHeader title={`Entrants for ${competition.title}`} description="All users who have entered this competition." />
            <ApplicantsTable 
                initialApplicants={mappedEntries}
                competitionId={competition.id.toString()}
            />
        </div>
    )
}
