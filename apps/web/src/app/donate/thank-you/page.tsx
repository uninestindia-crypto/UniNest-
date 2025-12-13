
import { Suspense } from 'react';
import type { Metadata } from 'next';
import ThankYouClient from '@/components/donate/thank-you-client';

export const metadata: Metadata = {
  title: 'Thank You for Your Donation! | UniNest',
  description: 'Your contribution is making a huge difference for students on campus.',
};

// This component acts as a wrapper to enable suspense for search params
function ThankYouPageContent() {
  return <ThankYouClient />;
}

export default function ThankYouPage() {
  return (
    <Suspense fallback={<div>Loading your stats...</div>}>
      <ThankYouPageContent />
    </Suspense>
  );
}
