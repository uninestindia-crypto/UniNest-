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
        <div className="space-y-1 px-2 pb-16">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-4 rounded-2xl p-3.5 text-left transition-all duration-200 outline-none',
                  selectedRoom?.id === room.id
                    ? 'bg-muted/60 shadow-sm'
                    : 'hover:bg-muted/40 focus-visible:bg-muted/40'
                )}
              >
                <Avatar className="h-12 w-12 border border-border/50 shadow-sm">
                  <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/40`} alt={room.name || 'Chat'} data-ai-hint="person face" />
                  <AvatarFallback className="bg-primary/10 text-primary">{room.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-[15px] font-semibold text-foreground tracking-tight">{room.name || 'Conversation'}</p>
                    <p
                      className={cn(
                        'ml-2 flex-shrink-0 text-xs text-muted-foreground/80',
                        room.unread_count && room.unread_count > 0 ? 'text-primary font-bold' : ''
                      )}
                    >
                      {formatTimestamp(room.last_message_timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className={cn(
                      "truncate text-[13px]",
                      room.unread_count && room.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground/80"
                    )}>
                      {room.last_message || 'Select to view messages'}
                    </p>
                    {room.unread_count && room.unread_count > 0 ? (
                      <div className="flex h-5 min-w-[20px] shrink-0 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-bold text-primary-foreground shadow-sm">
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
