

import type { Metadata } from 'next';
import DonateContent from '@/components/donate/donate-content';
import { createClient } from '@/lib/supabase/server';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Support UniNest – Fuel the Future of Students',
  description: 'Your donation helps UniNest stay alive for your campus. Join the Hall of Heroes and contribute to keep the platform running for students.',
};

type AggregatedDonor = {
    name: string | null;
    avatar: string | null;
    amount: number;
    userId: string;
}

type DonationProfile = {
    full_name: string | null;
    avatar_url: string | null;
};

type DonationWithProfile = {
    user_id: string;
    amount: number;
    profiles: DonationProfile | DonationProfile[] | null;
};

export default async function DonatePage() {
    const supabase = createClient();
    
    const [donationsResult, goalResult] = await Promise.all([
        supabase
            .from('donations')
            .select(`
                user_id,
                amount,
                profiles (
                    full_name,
                    avatar_url
                )
            `)
            .order('amount', { ascending: false }),
        supabase
            .from('app_config')
            .select('value')
            .eq('key', 'donation_goal')
            .single()
    ]);

    const { data: donations, error: donorsError } = donationsResult;
    const { data: goalData, error: goalError } = goalResult;

    if (donorsError) console.error('Error fetching donors:', donorsError.message);
    if (goalError) console.error('Error fetching goal amount:', goalError.message);

    const aggregatedDonors: AggregatedDonor[] = ((donations || []) as DonationWithProfile[]).reduce((acc: AggregatedDonor[], current) => {
        const profile = Array.isArray(current.profiles) ? current.profiles[0] : current.profiles;
        if (!profile) return acc;
        const existing = acc.find(d => d.userId === current.user_id);
        if (existing) {
            existing.amount += current.amount;
        } else {
            acc.push({
                name: profile.full_name,
                userId: current.user_id,
                avatar: profile.avatar_url,
                amount: current.amount
            });
        }
        return acc;
    }, []).sort((a,b) => b.amount - a.amount);

    const goalAmount = goalData ? Number(goalData.value) : 50000;
    const initialRaisedAmount = (donations || []).reduce((sum, d) => sum + d.amount, 0);

    return <DonateContent 
        initialDonors={aggregatedDonors as any[] || []}
        initialGoal={goalAmount}
        initialRaised={initialRaisedAmount}
    />
}
