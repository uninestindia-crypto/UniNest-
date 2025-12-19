
import PageHeader from "@/components/admin/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import ResultsForm from "./form";

export const revalidate = 0;

export default async function CompetitionResultsPage({ params }: { params: { id: string } }) {
    const supabase = createAdminClient();

    const { data: competition, error: competitionError } = await supabase
        .from('competitions')
        .select('id, title, winner_id, result_description')
        .eq('id', params.id)
        .single();

    if (competitionError || !competition) {
        notFound();
    }

    const { data: entries, error: entriesError } = await supabase
        .from('competition_entries')
        .select(`
            user_id,
            profiles (
                id,
                full_name
            )
        `)
        .eq('competition_id', params.id);

    if (entriesError) {
        return <p>Error loading entrants: {entriesError.message}</p>
    }

    // Handle the case where profiles might be an array or null
    const applicants = (entries || []).map(e => {
        const profile = Array.isArray(e.profiles) ? e.profiles[0] : e.profiles;
        return {
            id: profile?.id || e.user_id,
            name: profile?.full_name || 'Unknown',
        };
    });


    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <PageHeader title={`Declare Winner for ${competition.title}`} description="Select a winner and write an announcement." />
            <ResultsForm
                competitionId={competition.id}
                applicants={applicants}
                currentWinnerId={competition.winner_id}
                currentDescription={competition.result_description}
            />
        </div>
    )
}
