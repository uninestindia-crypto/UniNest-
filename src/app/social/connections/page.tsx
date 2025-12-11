
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Connections Retired | UniNest',
  description: 'Follower and following lists are no longer available as part of UniNest.',
};

export default function ConnectionsPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-4 text-center">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
        Connections are no longer tracked
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">
        We&apos;ve removed public follower and following lists so we can stay focused on tools that directly
        help you find better housing, opportunities, and study support.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/workspace">Go to Workspace</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
