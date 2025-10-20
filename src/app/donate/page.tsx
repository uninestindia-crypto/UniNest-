

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

    const isMissingTableError = (error: any) => error?.code === 'PGRST205';

    const donations = (() => {
        if (!donationsResult.error) {
            return (donationsResult.data || []) as DonationWithProfile[];
        }
        if (isMissingTableError(donationsResult.error)) {
            console.warn('[donate/page] donations table missing. Rendering empty donors list.');
            return [] as DonationWithProfile[];
        }
        console.error('Error fetching donors:', donationsResult.error.message);
        return [] as DonationWithProfile[];
    })();

    const goalAmount = (() => {
        if (!goalResult.error && goalResult.data) {
            return Number(goalResult.data.value) || 50000;
        }
        if (isMissingTableError(goalResult.error)) {
            console.warn('[donate/page] app_config table missing. Using default donation goal.');
            return 50000;
        }
        if (goalResult.error) {
            console.error('Error fetching goal amount:', goalResult.error.message);
        }
        return 50000;
    })();

    const aggregatedDonorsMap = donations.reduce((map, current) => {
        const profile = Array.isArray(current.profiles) ? current.profiles[0] : current.profiles;
        const userId = current.user_id;
        if (!userId) return map;

        const displayName = profile?.full_name && profile.full_name.trim().length > 0 ? profile.full_name : 'Anonymous';
        const avatarUrl = profile?.avatar_url ?? null;

        const existing = map.get(userId);
        if (existing) {
            existing.amount += current.amount;
            if (existing.name === 'Anonymous' && displayName !== 'Anonymous') {
                existing.name = displayName;
            }
            if (!existing.avatar && avatarUrl) {
                existing.avatar = avatarUrl;
            }
        } else {
            map.set(userId, {
                name: displayName,
                userId,
                avatar: avatarUrl,
                amount: current.amount,
            });
        }

        return map;
    }, new Map<string, AggregatedDonor>());

    const aggregatedDonors: AggregatedDonor[] = Array.from(aggregatedDonorsMap.values()).sort((a, b) => b.amount - a.amount);

    const initialRaisedAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    return <DonateContent 
        initialDonors={aggregatedDonors as any[] || []}
        initialGoal={goalAmount}
        initialRaised={initialRaisedAmount}
    />
}
