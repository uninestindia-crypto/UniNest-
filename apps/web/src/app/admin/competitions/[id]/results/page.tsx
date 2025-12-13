
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { declareWinner } from "./actions";
import ResultsForm from "./form";

export const revalidate = 0;

export default async function CompetitionResultsPage({ params }: { params: { id: string } }) {
    const supabase = createClient();

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

    const applicants = entries.map(e => ({
        id: e.profiles?.id || e.user_id,
        name: e.profiles?.full_name || 'Unknown',
    }));

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
