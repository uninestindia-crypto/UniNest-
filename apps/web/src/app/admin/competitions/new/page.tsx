
import PageHeader from "@/components/admin/page-header";
import CompetitionForm from "@/components/admin/competitions/form";

export default function NewCompetitionPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="Add New Competition" description="Fill out the form to create a new competition listing." />
            <CompetitionForm />
        </div>
    )
}
