

import PageHeader from "@/components/admin/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { createAdminClient } from "@/lib/supabase/admin";
import PaymentsTable from "@/components/admin/payments/payments-table";

export const revalidate = 0;

type Payment = {
    id: string;
    amount: number;
    currency: string;
    type: 'Donation' | 'Competition Entry';
    created_at: string;
    status: 'success' | 'pending' | 'failed';
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
                status: 'success' as const,
                user: resolveProfile(d.profiles),
            })),
            ...(competitionEntriesResult.data || []).map((c) => ({
                id: c.razorpay_payment_id || `comp-${c.id}`,
                amount: c.competitions?.entry_fee || 0,
                currency: 'INR',
                type: 'Competition Entry' as const,
                created_at: c.created_at,
                status: 'success' as const,
                user: resolveProfile(c.profiles),
            })),
        ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } catch (error) {
        errorMessage = error instanceof Error ? error.message : 'Failed to load payments.';
    }

    if (errorMessage) {
        return (
            <div className="space-y-8">
                <PageHeader title="Payment History" description="View and manage all transactions including donations and competition fees." />
                <Card>
                    <CardContent className="text-destructive py-8">
                        {errorMessage}
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Payment History"
                description="View and manage all transactions including donations and competition fees."
            />
            <PaymentsTable initialPayments={payments} />
        </div>
    )
}

