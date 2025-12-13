
import PageHeader from "@/components/admin/page-header";
import CompetitionForm from "@/components/admin/competitions/form";
import { createClient } from "@/lib/supabase/server";
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function EditCompetitionPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: competition } = await supabase.from('competitions').select('*').eq('id', params.id).single();

    if (!competition) {
        notFound();
    }
    
    return (
        <div className="space-y-8">
            <PageHeader title="Edit Competition" description="Update the details for this competition." />
            <CompetitionForm competition={competition} />
        </div>
    )
}
