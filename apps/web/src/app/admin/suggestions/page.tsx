
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import SuggestionsTable from "@/components/admin/suggestions/table";

export const revalidate = 0; // force dynamic rendering

export default async function AdminSuggestionsPage() {
    const supabase = createClient();
    
    const { data: suggestions, error } = await supabase
        .from('suggestions')
        .select(`
            *,
            profiles (
                full_name,
                avatar_url
            )
        `)
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-8">
            <PageHeader title="User Suggestions" description="Review competition and internship suggestions from users." />
             <SuggestionsTable initialSuggestions={suggestions || []} error={error?.message} />
        </div>
    )
}
