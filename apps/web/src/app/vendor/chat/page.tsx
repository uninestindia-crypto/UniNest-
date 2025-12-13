'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function VendorChatPage() {
  return (
    <div className="max-w-xl mx-auto py-16 px-4 space-y-4 text-center">
      <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary">
        Messaging has been turned off
      </h1>
      <p className="text-sm md:text-base text-muted-foreground">
        Vendor messaging has been retired so we can double down on high-signal tools like bookings and orders.
      </p>
      <div className="pt-4 flex justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/vendor/dashboard">Back to Vendor Dashboard</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/vendor/orders">View Orders</Link>
        </Button>
      </div>
    </div>
  );
}
