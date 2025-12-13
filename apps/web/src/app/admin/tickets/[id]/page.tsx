
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { notFound } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import TicketStatusChanger from "@/components/admin/tickets/ticket-status-changer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export const revalidate = 0;

export default async function TicketDetailPage({ params }: { params: { id: string } }) {
    const supabase = createClient();
    const { data: ticketData, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('id', params.id)
        .single();

    if (error || !ticketData) {
        notFound();
    }

    let profile = null as {
        id: string;
        full_name: string;
        email: string | null;
        avatar_url: string | null;
        handle: string | null;
    } | null;

    if (ticketData.user_id) {
        const { data: profileData } = await supabase
            .from('profiles')
            .select('id, full_name, email, avatar_url, handle')
            .eq('id', ticketData.user_id)
            .single();

        profile = profileData || null;
    }

    const ticket = {
        ...ticketData,
        profile,
    };
    
    return (
        <div className="space-y-8">
            <PageHeader title={`Ticket #${ticket.id}`} description={`Details for ticket submitted by ${ticket.profile?.full_name}`} />

            <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>{ticket.subject}</CardTitle>
                            <CardDescription>
                                Submitted on {format(new Date(ticket.created_at), 'PPPp')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{ticket.description}</p>
                        </CardContent>
                    </Card>
                    {ticket.screenshot_url && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Attached Screenshot</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <a href={ticket.screenshot_url} target="_blank" rel="noopener noreferrer">
                                    <img src={ticket.screenshot_url} alt="Screenshot" className="rounded-lg border max-w-full h-auto" />
                                </a>
                            </CardContent>
                        </Card>
                    )}
                </div>

                <div className="lg:col-span-1 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Status</span>
                                <TicketStatusChanger ticketId={ticket.id} currentStatus={ticket.status} />
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Category</span>
                                <Badge variant="secondary">{ticket.category}</Badge>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Priority</span>
                                <Badge variant={ticket.priority === 'High' ? 'destructive' : 'outline'}>{ticket.priority}</Badge>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Submitted By</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                             <Avatar>
                                <AvatarImage src={ticket.profile?.avatar_url || undefined} />
                                <AvatarFallback>{ticket.profile?.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{ticket.profile?.full_name}</p>
                                <p className="text-sm text-muted-foreground">{ticket.profile?.email}</p>
                                <Link href={`/profile/${ticket.profile?.handle}`} className="text-sm text-primary hover:underline">View Profile</Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
