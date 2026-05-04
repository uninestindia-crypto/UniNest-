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
    <div className="flex h-full flex-col bg-transparent">
      <ScrollArea className="flex-1 px-2 py-2">
        <div className="space-y-1 pb-16">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-3.5 px-3 py-3 text-left transition-all outline-none rounded-xl border border-transparent',
                  selectedRoom?.id === room.id
                    ? 'bg-white dark:bg-slate-900 shadow-sm border-border/50'
                    : 'hover:bg-white/60 dark:hover:bg-slate-900/50'
                )}
              >
                <div className="relative">
                  <Avatar className="h-[46px] w-[46px] shrink-0 border border-border/10 shadow-sm">
                    <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/80`} alt={room.name || 'Chat'} />
                    <AvatarFallback className="bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-indigo-400 font-semibold">
                      {room.name?.charAt(0) || 'C'}
                    </AvatarFallback>
                  </Avatar>
                  {room.unread_count && room.unread_count > 0 ? (
                    <div className="absolute -top-0.5 -right-0.5 h-3.5 w-3.5 rounded-full bg-indigo-600 border-2 border-background"></div>
                  ) : null}
                </div>
                
                <div className="flex flex-1 flex-col justify-center min-w-0 h-full">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="truncate text-[15px] font-semibold text-foreground tracking-tight">
                      {room.name || 'Conversation'}
                    </p>
                    <p
                      className={cn(
                        'ml-2 flex-shrink-0 text-[11px] font-medium transition-colors',
                        room.unread_count && room.unread_count > 0 ? 'text-indigo-600 dark:text-indigo-400' : 'text-muted-foreground'
                      )}
                    >
                      {formatTimestamp(room.last_message_timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className={cn(
                      "truncate text-[13px] leading-tight flex-1",
                      room.unread_count && room.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                    )}>
                      {room.last_message || 'No messages yet'}
                    </p>
                    {room.unread_count && room.unread_count > 0 ? (
                      <div className="flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full bg-indigo-600 px-1 text-[10px] font-bold text-white shadow-sm">
                        {room.unread_count}
                      </div>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="p-8 text-center text-muted-foreground mt-10">
              <div className="bg-slate-100 dark:bg-slate-900 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">👋</span>
              </div>
              <h3 className="text-[16px] font-semibold text-foreground mb-1">No Chats Yet</h3>
              <p className="text-[13px] max-w-[200px] mx-auto">Start a conversation with someone from the marketplace.</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
