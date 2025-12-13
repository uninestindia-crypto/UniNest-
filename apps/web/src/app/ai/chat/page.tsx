
import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = {
  title: 'AI Assistant | UniNest',
  description: 'The AI Assistant is coming soon! Get ready for an intelligent campus companion.',
};

export default function AIChatPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center">
      <div className="p-6 bg-primary/10 rounded-full mb-6">
        <Sparkles className="size-12 text-primary" />
      </div>
      <h1 className="text-4xl font-bold font-headline text-primary">Coming Soon!</h1>
      <p className="mt-2 text-lg text-muted-foreground max-w-md">
        Our AI Assistant is being upgraded. Get ready for a smarter way to navigate campus life!
      </p>
    </div>
  );
}
