
import PageHeader from "@/components/admin/page-header";
import ApplicationForm from "@/components/workspace/application-form";
import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from 'next/navigation';

type ApplyPageProps = {
    params: { id: string }
}

export default async function ApplyPage({ params }: ApplyPageProps) {
    const supabase = createClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        redirect(`/login?redirect=/workspace/internships/${params.id}/apply`);
    }

    const { data: internship, error } = await supabase
        .from('internships')
        .select('id, role, company')
        .eq('id', params.id)
        .single();
    
    if (error || !internship) {
        notFound();
    }
    
    return (
        <div className="max-w-2xl mx-auto">
            <PageHeader
                title={`Apply for ${internship.role}`}
                description={`You are applying to ${internship.company}.`}
            />
            <div className="mt-8">
                <ApplicationForm internshipId={internship.id} />
            </div>
        </div>
    )
}
