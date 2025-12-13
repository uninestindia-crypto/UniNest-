
import type { Metadata } from 'next';
import CompetitionsClient from '@/components/workspace/competitions-client';

export const metadata: Metadata = {
    title: 'Compete & Win – Student Competitions',
    description: 'Browse and apply for exclusive student competitions with entry fees on UniNest. Showcase your skills and win exciting prizes.',
};

export default function CompetitionsPage() {
    return <CompetitionsClient />;
}
