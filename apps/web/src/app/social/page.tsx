
import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Social Area Retired | UniNest',
  description: 'The UniNest social hub and feed have been retired as we focus on housing, marketplace, and workspace tools.',
};

export default function SocialPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-4 text-center">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
        The social hub has signed off
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">
        We&apos;ve retired the UniNest social section so we can double down on what students use the most:
        verified stays, smarter marketplace tools, and a focused workspace for internships and competitions.
      </p>
      <div className="pt-4 flex justify-center">
        <Button asChild size="lg">
          <Link href="/">Back to UniNest home</Link>
        </Button>
      </div>
    </div>
  );
}
