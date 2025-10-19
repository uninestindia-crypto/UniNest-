import type { Metadata } from 'next';
import HomePosterForm from '@/components/admin/marketing/home-poster-form';

export const metadata: Metadata = {
  title: 'Marketing | UniNest Admin',
};

export default function MarketingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Marketing</h1>
        <p className="text-muted-foreground">
          Manage the home page hero poster experience.
        </p>
      </div>
      <HomePosterForm />
    </div>
  );
}
