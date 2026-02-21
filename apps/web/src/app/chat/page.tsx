'use client';

import ChatLayout from '@/components/chat/chat-layout';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-full max-w-[1400px] mx-auto md:mt-2 md:rounded-3xl overflow-hidden border-x md:border border-border/40 bg-background flex flex-col shadow-none md:shadow-xl">
      <ChatLayout />
    </div>
  );
}
