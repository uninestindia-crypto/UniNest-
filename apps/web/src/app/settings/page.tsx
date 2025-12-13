
import type { Metadata } from 'next';
import SettingsContent from '@/components/settings/settings-content';

export const metadata: Metadata = {
  title: 'Account Settings',
  description: 'Manage your UniNest account settings, update your profile, and change your password.',
};


export default function SettingsPage() {
    return <SettingsContent />
}
