
import PageHeader from "@/components/admin/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ApplicantsTable from "@/components/admin/competitions/applicants-table";

export const revalidate = 0;

export default async function CompetitionApplicantsPage({ params }: { params: { id: string } }) {
    const supabase = createAdminClient();

    const { data: competition, error: competitionError } = await supabase
        .from('competitions')
        .select('id, title')
        .eq('id', params.id)
        .single();
    
    if (competitionError || !competition) {
        notFound();
    }

    const { data: entries, error: entriesError } = await supabase
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
        .eq('competition_id', params.id)
        .order('created_at', { ascending: false });

    if (entriesError) {
        return <p>Error loading entrants: {entriesError.message}</p>
    }

    const mappedEntries = (entries || []).map(e => ({
        ...e,
        profiles: e.profile
    }));

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
