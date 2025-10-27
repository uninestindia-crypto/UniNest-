
import PageHeader from "@/components/admin/page-header";
import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import { getApplicants } from "./actions";
import InternshipApplicantsTable from "@/components/admin/internships/applicants-table";

export const revalidate = 0;

export default async function InternshipApplicantsPage({ params }: { params: { id: string } }) {
    const supabase = createAdminClient();
    const internshipId = Number(params.id);

    if (Number.isNaN(internshipId)) {
        notFound();
    }

    const { data: internship, error: internshipError } = await supabase
        .from('internships')
        .select('id, role, company')
        .eq('id', internshipId)
        .single();
    
    if (internshipError || !internship) {
        notFound();
    }

    const { applications, error } = await getApplicants(internshipId);

    if (error) {
        return <p>Error loading applications: {error}</p>
    }

    return (
        <div className="space-y-8">
            <PageHeader title={`Applicants for ${internship.role}`} description={`Review all applications for the position at ${internship.company}.`} />
            <InternshipApplicantsTable 
                initialApplications={applications}
                internshipId={internship.id.toString()}
            />
        </div>
    )
}
