import type { Metadata } from 'next';
import HomeClient from '@/components/home/home-client';

export const metadata: Metadata = {
  title: 'UniNest | Student Housing, Internships & Competitions Hub',
  description:
    'Discover UniNest, the student super app for verified PGs, internships, competitions, and real-time library bookings. Join India’s trusted student community.',
  keywords: [
    'student community platform',
    'verified PG booking',
    'student internship portal',
    'college competition platform',
    'real-time library seat booking',
    'student marketplace app',
    'college student housing platform',
  ],
  openGraph: {
    title: 'UniNest | Student Housing, Internships & Competitions Hub',
    description:
      'Discover UniNest, the student super app for verified PGs, internships, competitions, and real-time library bookings. Join India’s trusted student community.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniNest | Student Housing, Internships & Competitions Hub',
    description:
      'Discover UniNest, the student super app for verified PGs, internships, competitions, and real-time library bookings. Join India’s trusted student community.',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
