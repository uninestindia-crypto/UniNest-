'use client';

import ChatLayout from '@/components/chat/chat-layout';

export default function VendorChatPage() {
  return (
    <div className="h-[calc(100vh-8rem)] min-h-[500px] w-full max-w-7xl mx-auto rounded-xl overflow-hidden border bg-background flex flex-col">
      <ChatLayout />
    </div>
  );
}
