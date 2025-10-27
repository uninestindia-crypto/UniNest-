
import type { Metadata } from 'next';
import SupportTicketForm from '@/components/support/ticket-form';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Contact Support | UniNest',
  description: 'Submit a support ticket for feedback, bug reports, or help with the platform.',
};

export default async function SupportPage() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login?redirect=/support');
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold tracking-tight text-primary">Contact Support</h1>
            <p className="mt-2 text-lg text-muted-foreground">
                Have an issue or some feedback? Let us know!
            </p>
            <p className="mt-3 text-base text-muted-foreground">
                Prefer email? Reach us anytime at{' '}
                <a href="mailto:support@uninest.co.in" className="text-primary hover:underline">
                    support@uninest.co.in
                </a>
                .
            </p>
            <div className="mt-8">
                <SupportTicketForm />
            </div>
        </div>
    );
}
