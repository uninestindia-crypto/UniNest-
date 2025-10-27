
import PageHeader from "@/components/admin/page-header";
import CompetitionApplicationForm from "@/components/workspace/competition-application-form";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from 'next/navigation';

type ApplyPageProps = {
    params: { id: string }
}

export default async function CompetitionApplyPage({ params }: ApplyPageProps) {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/login?redirect=/workspace/competitions/${params.id}/apply`);
    }

    const { data: competition, error } = await supabase
        .from('competitions')
        .select('id, title, entry_fee')
        .eq('id', params.id)
        .single();
    
    if (error || !competition) {
        notFound();
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader
                title={`Enter Competition: ${competition.title}`}
                description={`Confirm your details to enter. An entry fee of ₹${competition.entry_fee} is required.`}
            />
            <div className="mt-8">
                <CompetitionApplicationForm competition={competition} />
            </div>
        </div>
    )
}
