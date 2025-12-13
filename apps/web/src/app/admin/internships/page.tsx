
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import InternshipsTable from "@/components/admin/internships/table";

export const revalidate = 0; // force dynamic rendering

export default async function AdminInternshipsPage() {
    const supabase = createClient();

    const { data: internshipsData, error: internshipsError } = await supabase
        .from('internships')
        .select('*')
        .order('created_at', { ascending: false });

    if (internshipsError) {
        return (
             <div className="space-y-8">
                <PageHeader title="Internships" description="Manage all internship listings." />
                <InternshipsTable internships={[]} error={internshipsError.message} />
            </div>
        )
    }

    // Manually fetch application counts for each internship to avoid relationship errors
    const internships = await Promise.all(
        internshipsData.map(async (internship) => {
            const { count, error: countError } = await supabase
                .from('internship_applications')
                .select('*', { count: 'exact', head: true })
                .eq('internship_id', internship.id);

            return {
                ...internship,
                internship_applications: [{ count: countError ? 0 : count }],
            };
        })
    );

    return (
        <div className="space-y-8">
            <PageHeader title="Internships" description="Manage all internship listings.">
                 <Button asChild>
                    <Link href="/admin/internships/new">
                        <PlusCircle className="mr-2 size-4" />
                        Add New
                    </Link>
                 </Button>
            </PageHeader>
            <InternshipsTable internships={internships || []} error={internshipsError?.message} />
        </div>
    )
}
