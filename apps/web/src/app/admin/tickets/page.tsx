
import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import TicketStatusChanger from "@/components/admin/tickets/ticket-status-changer";
import Link from "next/link";
import type { SupportTicket, Profile } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";

type TicketWithProfile = SupportTicket & {
    profile: Pick<Profile, 'id' | 'full_name' | 'avatar_url'> | null;
}

export const revalidate = 0;

export default async function AdminTicketsPage() {
    let tickets: TicketWithProfile[] = [];
    let errorMessage: string | null = null;

    try {
        const supabase = createAdminClient();

        const { data: ticketsData, error: ticketsError } = await supabase
            .from('support_tickets')
            .select('*')
            .order('created_at', { ascending: false });

        if (ticketsError) {
            throw new Error(`Error loading tickets: ${ticketsError.message}`);
        }

        const baseTickets = (ticketsData || []) as SupportTicket[];

        if (baseTickets.length > 0) {
            const userIds = Array.from(new Set(baseTickets.map(ticket => ticket.user_id).filter(Boolean)));

            let profileMap = new Map<string, Pick<Profile, 'id' | 'full_name' | 'avatar_url'>>();

            if (userIds.length > 0) {
                const { data: profilesData, error: profilesError } = await supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url')
                    .in('id', userIds);

                if (profilesError) {
                    throw new Error(`Error loading ticket profiles: ${profilesError.message}`);
                }

                if (profilesData) {
                    profileMap = new Map(profilesData.map(profile => [profile.id, profile]));
                }
            }

            tickets = baseTickets.map(ticket => ({
                ...ticket,
                profile: profileMap.get(ticket.user_id) || null,
            })) as TicketWithProfile[];
        }
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to load support tickets.';
    }

    if (errorMessage) {
        return (
            <div className="space-y-8">
                <PageHeader title="Support Tickets" description="Review and manage user feedback and issues." />
                <div className="rounded-md border border-destructive bg-destructive/10 p-4 text-destructive">
                    {errorMessage}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Support Tickets" description="Review and manage user feedback and issues." />
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Subject</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead>Submitted</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {!tickets || tickets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No support tickets found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                tickets.map(ticket => (
                                    <TableRow key={ticket.id} className="hover:bg-muted/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={ticket.profile?.avatar_url || undefined} alt={ticket.profile?.full_name || 'User'} />
                                                    <AvatarFallback>{ticket.profile?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{ticket.profile?.full_name}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium max-w-xs truncate">
                                            <Link href={`/admin/tickets/${ticket.id}`} className="hover:underline">
                                                {ticket.subject}
                                            </Link>
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{ticket.category}</Badge></TableCell>
                                        <TableCell>{format(new Date(ticket.created_at), 'PPP')}</TableCell>
                                        <TableCell className="text-right">
                                            <TicketStatusChanger ticketId={ticket.id} currentStatus={ticket.status} />
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
