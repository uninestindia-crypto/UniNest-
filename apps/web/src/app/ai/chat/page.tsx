import type { Metadata } from 'next';
import UniNestChat from '@/components/ai/UniNestChat';

export const metadata: Metadata = {
  title: 'AI Assistant | UniNest',
  description: 'Your intelligent campus co-pilot. Find hostels, libraries, internships, and more with UniNest AI.',
};

export default function AIChatPage() {
  return (
    <div className="w-full h-full">
      <UniNestChat />
    </div>
  );
}
