import type { Metadata } from 'next';
import TermsContent from '@/components/terms/terms-content';

export const metadata: Metadata = {
  title: 'Terms & Conditions | UniNest',
  description: 'Review the terms and conditions for using the UniNest platform.',
};

export default function TermsPage() {
  return <TermsContent />;
}
