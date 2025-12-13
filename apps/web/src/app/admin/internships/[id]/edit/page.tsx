
import PageHeader from "@/components/admin/page-header";
import InternshipForm from "@/components/admin/internships/form";
import { createClient } from "@/lib/supabase/server";
import { notFound } from 'next/navigation';

export const revalidate = 0;

export default async function EditInternshipPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: internship } = await supabase.from('internships').select('*').eq('id', params.id).single();

    if (!internship) {
        notFound();
    }
    
    return (
        <div className="space-y-8">
            <PageHeader title="Edit Internship" description="Update the details for this internship listing." />
            <InternshipForm internship={internship} />
        </div>
    )
}
