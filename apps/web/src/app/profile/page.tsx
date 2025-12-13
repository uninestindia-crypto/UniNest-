
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

// This page now simply redirects to the user's public profile page
// based on their handle. This centralizes profile logic.
export default async function MyProfilePage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const handle = user.user_metadata?.handle;
  if (handle) {
    redirect(`/profile/${handle}`);
  }

  redirect('/profile/setup');
}
