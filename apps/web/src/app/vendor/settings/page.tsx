
import type { Metadata } from 'next';
import SettingsContent from '@/components/settings/settings-content';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Vendor Settings',
  description: 'Manage your UniNest vendor account settings, update your profile, and manage services.',
};


export default async function SettingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  const role = user.user_metadata?.role;

  if (role !== 'vendor' && role !== 'admin') {
    redirect('/');
  }

  return <SettingsContent />
}
