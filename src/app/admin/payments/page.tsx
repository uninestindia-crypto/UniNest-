

import PageHeader from "@/components/admin/page-header";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAdminClient } from "@/lib/supabase/admin";
import { format } from "date-fns";

export const revalidate = 0;

type Payment = {
    id: string;
    amount: number;
    currency: string;
    type: 'Donation' | 'Competition Entry';
    created_at: string;
    user: {
        full_name: string | null;
        email: string | null;
    } | null;
}

export default async function AdminPaymentsPage() {
    let payments: Payment[] = [];
    let errorMessage: string | null = null;

    const resolveProfile = (profile: any) => {
        const normalized = Array.isArray(profile) ? profile[0] : profile;
        if (!normalized) {
            return { full_name: 'Anonymous', email: null };
        }
        return {
            full_name: normalized.full_name ?? 'Anonymous',
            email: normalized.email ?? null,
        };
    };

    try {
        const supabase = createAdminClient();
        const [donationsResult, competitionEntriesResult] = await Promise.all([
            supabase.from('donations').select('*, profiles(full_name)'),
            supabase.from('competition_entries').select('*, profiles(full_name), competitions(entry_fee)'),
        ]);

        if (donationsResult.error) {
            throw new Error(`Failed to load donations: ${donationsResult.error.message}`);
        }

        if (competitionEntriesResult.error) {
            throw new Error(`Failed to load competition entries: ${competitionEntriesResult.error.message}`);
        }

        payments = [
            ...(donationsResult.data || []).map((d) => ({
                id: d.razorpay_payment_id || `donation-${d.id}`,
                amount: d.amount,
                currency: d.currency || 'INR',
                type: 'Donation' as const,
                created_at: d.created_at,
                user: resolveProfile(d.profiles),
            })),
            ...(competitionEntriesResult.data || []).map((c) => ({
                id: c.razorpay_payment_id || `comp-${c.id}`,
                amount: c.competitions?.entry_fee || 0,
                currency: 'INR',
                type: 'Competition Entry' as const,
                created_at: c.created_at,
                user: resolveProfile(c.profiles),
            })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to load payments.';
    }

    if (errorMessage) {
        return (
            <div className="space-y-8">
                <PageHeader title="Payment History" description="View and manage all transactions." />
                <Card>
                    <CardContent className="text-destructive">
                        {errorMessage}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader title="Payment History" description="View and manage all transactions." />
             <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        No payments found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell className="font-mono text-xs">{payment.id}</TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.user?.full_name}</div>
                                            <div className="text-sm text-muted-foreground">{payment.user?.email ?? '—'}</div>
                                        </TableCell>
                                        <TableCell>₹{payment.amount.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant={payment.type === 'Donation' ? 'default' : 'secondary'}>
                                                {payment.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(payment.created_at), 'Pp')}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="default" className="bg-green-600">Success</Badge>
                                        </TableCell>
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
