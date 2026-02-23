'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import type { Room } from '@/lib/types';
import { formatDistanceToNowStrict } from 'date-fns';

type ChatListProps = {
  rooms: Room[];
  selectedRoom: Room | null;
  onSelectRoom: (room: Room) => void;
};

function formatTimestamp(timestamp: string | null) {
  if (!timestamp) return '';
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) return '';

  return formatDistanceToNowStrict(date, { addSuffix: true });
}


export default function ChatList({ rooms, selectedRoom, onSelectRoom }: ChatListProps) {
  return (
    <div className="flex h-full flex-col bg-background">
      <ScrollArea className="flex-1">
        <div className="space-y-0 px-0 pb-16">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors outline-none border-b border-border/5',
                  selectedRoom?.id === room.id
                    ? 'bg-[#f0f2f5] dark:bg-[#2a3942]'
                    : 'bg-white dark:bg-[#111b21] hover:bg-[#f5f6f6] dark:hover:bg-[#202c33]'
                )}
              >
                <Avatar className="h-12 w-12 shrink-0">
                  <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/80`} alt={room.name || 'Chat'} />
                  <AvatarFallback className="bg-[#dfe5e7] dark:bg-[#6a7175] text-[#54656f] dark:text-[#aebac1] text-lg">
                    {room.name?.charAt(0) || 'C'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col justify-center min-w-0 h-full">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-[17px] font-normal text-[#111b21] dark:text-[#e9edef] leading-tight">
                      {room.name || 'Conversation'}
                    </p>
                    <p
                      className={cn(
                        'ml-2 flex-shrink-0 text-[12px] transition-colors',
                        room.unread_count && room.unread_count > 0 ? 'text-[#00a884] font-medium' : 'text-[#667781] dark:text-[#8696a0]'
                      )}
                    >
                      {formatTimestamp(room.last_message_timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={cn(
                      "truncate text-[14px] leading-tight flex-1",
                      room.unread_count && room.unread_count > 0 ? "text-[#111b21] dark:text-[#e9edef] font-medium" : "text-[#667781] dark:text-[#8696a0]"
                    )}>
                      {room.last_message || ' '}
                    </p>
                    {room.unread_count && room.unread_count > 0 ? (
                      <div className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-[#00a884] px-1.5 text-[12px] font-bold text-white">
                        {room.unread_count}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <h3 className="text-lg font-semibold text-foreground">No Chats Yet</h3>
              <p className="text-sm">Start a conversation with a seller from the marketplace.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
