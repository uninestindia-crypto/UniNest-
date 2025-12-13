
import { redirect } from 'next/navigation';

// This page is deprecated. Redirecting to the marketplace.
// Booking is now handled directly on the library detail pages.
export default function BookingPage() {
  redirect('/marketplace');
}
