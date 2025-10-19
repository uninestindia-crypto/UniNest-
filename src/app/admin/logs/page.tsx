
import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const revalidate = 0;

export default async function AdminLogsPage() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

    let logs: any[] = [];
    let error: string | null = null;

    if (!supabaseUrl || !supabaseServiceKey) {
        error = "Supabase service credentials are not configured.";
    } else {
        const supabase = createAdminClient(supabaseUrl, supabaseServiceKey);
        const { data, error: fetchError } = await supabase
            .from('audit_log')
            .select(`
                *,
                admin:admin_id (
                    full_name,
                    avatar_url
                )
            `)
            .order('created_at', { ascending: false })
            .limit(100);

        if (fetchError) {
            error = "Failed to load audit logs.";
            console.error("Failed to load audit logs:", fetchError);
        } else {
            logs = data ?? [];
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Audit Logs" description="Track all administrative actions." />
            {error && (
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                    {error}
                </div>
            )}
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Timestamp</TableHead>
                                <TableHead>Admin</TableHead>
                                <TableHead>Action</TableHead>
                                <TableHead>Details</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!logs || logs.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No audit logs found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                logs.map(log => (
                                    <TableRow key={log.id}>
                                        <TableCell>{format(new Date(log.created_at), 'Pp')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Avatar className="size-7">
                                                    <AvatarImage src={(log.admin as any)?.avatar_url} />
                                                    <AvatarFallback>{(log.admin as any)?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                {(log.admin as any)?.full_name}
                                            </div>
                                        </TableCell>
                                        <TableCell><span className="font-mono text-xs">{log.action}</span></TableCell>
                                        <TableCell className="font-mono text-xs max-w-sm truncate">{log.details}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
}
