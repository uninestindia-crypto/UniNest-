
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from 'next/link';
import { createClient } from "@/lib/supabase/server";
import CompetitionsTable from "@/components/admin/competitions/table";

export const revalidate = 0; // force dynamic rendering

export default async function AdminCompetitionsPage() {
    const supabase = createClient();
    
    const { data: competitions, error } = await supabase
        .from('competitions')
        .select('*, competition_entries(count)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="Competitions" description="Manage all competition listings.">
                 <Button asChild>
                    <Link href="/admin/competitions/new">
                        <PlusCircle className="mr-2 size-4" />
                        Add New
                    </Link>
                 </Button>
            </PageHeader>
            <CompetitionsTable competitions={competitions || []} error={error?.message} />
        </div>
    )
}
