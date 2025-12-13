
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function FeedPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-5 text-center">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
        The student feed has closed
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">
        UniNest is now focused on tools students rely on every day: verified stays, a trusted marketplace,
        and a workspace built around internships, competitions, and notes.
      </p>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
        <Button asChild size="lg">
          <Link href="/workspace">Explore Workspace</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/marketplace">Browse Marketplace</Link>
        </Button>
      </div>
    </div>
  );
}
