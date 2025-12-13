
import PageHeader from "@/components/admin/page-header";
import InternshipForm from "@/components/admin/internships/form";

export default function NewInternshipPage() {
    return (
        <div className="space-y-8">
            <PageHeader title="Add New Internship" description="Fill out the form to create a new internship listing." />
            <InternshipForm />
        </div>
    )
}
