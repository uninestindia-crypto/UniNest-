'use client';

import ChatLayout from '@/components/chat/chat-layout';

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] pb-20 lg:pb-0 min-h-[400px] w-full max-w-7xl mx-auto rounded-xl overflow-hidden border bg-background flex flex-col">
      <ChatLayout />
    </div>
  );
}
