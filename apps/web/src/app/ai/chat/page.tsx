import type { Metadata } from 'next';
import UniNestChat from '@/components/ai/UniNestChat';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: 'AI Assistant | UniNest',
  description: 'Your intelligent campus co-pilot. Find hostels, libraries, internships, and more with UniNest AI.',
};

export default function AIChatPage() {
  return (
    <div className="w-full h-full">
      <Suspense fallback={<div className="flex h-screen w-full items-center justify-center">Loading AI Assistant...</div>}>
        <UniNestChat />
      </Suspense>
    </div>
  );
}
