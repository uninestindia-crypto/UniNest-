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
        <div className="space-y-0.5 px-2 pb-16 pt-2">
          {rooms.length > 0 ? (
            rooms.map((room) => (
              <button
                key={room.id}
                onClick={() => onSelectRoom(room)}
                className={cn(
                  'flex w-full items-center gap-3.5 rounded-xl p-3 text-left transition-all duration-200 outline-none group',
                  selectedRoom?.id === room.id
                    ? 'bg-primary/5 shadow-sm'
                    : 'hover:bg-muted/50 focus-visible:bg-muted/50'
                )}
              >
                <Avatar className="h-12 w-12 shadow-sm border border-border/20">
                  <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/40`} alt={room.name || 'Chat'} data-ai-hint="person face" />
                  <AvatarFallback className="bg-primary/5 text-primary text-sm font-medium">{room.name?.charAt(0) || 'C'}</AvatarFallback>
                </Avatar>
                <div className="flex flex-1 flex-col gap-1">
                  <div className="flex items-center justify-between pb-0.5">
                    <p className="truncate text-[15px] font-semibold text-foreground/90 tracking-tight">{room.name || 'Conversation'}</p>
                    <p
                      className={cn(
                        'ml-2 flex-shrink-0 text-[11px] font-medium transition-colors',
                        room.unread_count && room.unread_count > 0 ? 'text-primary' : 'text-muted-foreground'
                      )}
                    >
                      {formatTimestamp(room.last_message_timestamp)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <p className={cn(
                      "truncate text-[13px] leading-tight",
                      room.unread_count && room.unread_count > 0 ? "text-foreground font-semibold" : "text-muted-foreground/80 group-hover:text-muted-foreground"
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
