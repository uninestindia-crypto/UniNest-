'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message, Profile } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Filter, Loader2, Plus, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import NewChatModal from './new-chat-modal';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import {
  generateSessionKey,
  wrapSessionKey,
  unwrapSessionKey,
  encryptContent,
  decryptContent,
  importPublicKey
} from '@/lib/crypto';

export default function ChatLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sessionKey, setSessionKey] = useState<CryptoKey | null>(null);
  const { user, supabase, loading: authLoading, e2eeKeys } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeInboxTab, setActiveInboxTab] = useState<'primary' | 'general' | 'requests'>('primary');

  useEffect(() => {
    if (!authLoading && !user && !hasRedirected) {
      setHasRedirected(true);
      router.replace('/login');
    }
  }, [authLoading, user, router, hasRedirected]);

  const fetchRoomsWithoutRpc = useCallback(async (): Promise<Room[]> => {
    if (!supabase) {
      return [];
    }

    type ChatRoomRow = {
      id: string;
      created_at: string;
      name: string | null;
      avatar?: string | null;
    };

    const { data: roomRows, error: roomError } = await supabase
      .from('chat_rooms')
      .select('id, created_at, name, avatar')
      .order('created_at', { ascending: false });

    if (roomError) {
      throw roomError;
    }

    const roomsData = (roomRows || []) as ChatRoomRow[];
    const roomIds = roomsData.map((room) => room.id);

    type LastMessageRow = {
      room_id: string;
      content: string | null;
      created_at: string | null;
    };

    const lastMessageMap = new Map<string, LastMessageRow>();

    if (roomIds.length > 0) {
      const { data: lastMessagesRows, error: lastMessagesError } = await supabase
        .from('chat_messages')
        .select('room_id, content, created_at')
        .in('room_id', roomIds)
        .order('created_at', { ascending: false });

      if (!lastMessagesError && lastMessagesRows) {
        for (const message of lastMessagesRows as LastMessageRow[]) {
          if (!lastMessageMap.has(message.room_id)) {
            lastMessageMap.set(message.room_id, message);
          }
        }
      }
    }

    return roomsData.map((room) => {
      const lastMessage = lastMessageMap.get(room.id);
      return {
        id: room.id,
        name: room.name,
        avatar: room.avatar ?? null,
        last_message: lastMessage?.content ?? null,
        last_message_timestamp: lastMessage?.created_at ?? null,
        unread_count: 0,
        room_created_at: room.created_at,
      } satisfies Room;
    });
  }, [supabase]);

  const fetchRooms = useCallback(async () => {
    if (!user || !supabase) {
      setLoadingRooms(false);
      return;
    }
    setLoadingRooms(true);
    try {
      const { data, error } = await supabase.rpc('get_user_chat_rooms');

      if (error) {
        console.warn('Failed to fetch rooms via RPC, falling back to direct queries.', error);
        try {
          const fallbackRooms = await fetchRoomsWithoutRpc();
          setRooms(fallbackRooms);
        } catch (fallbackError) {
          console.error('Fallback room fetch failed after RPC error:', fallbackError);
          toast({ variant: 'destructive', title: 'Error loading chats', description: 'Could not fetch your chat rooms. Please try refreshing.' });
        }
        return;
      }

      const normalizedRooms = (data || []).map((room: any) => ({
        ...room,
        unread_count: room?.unread_count ?? 0,
        room_created_at: room?.room_created_at ?? room?.created_at ?? new Date().toISOString(),
      })) as Room[];

      setRooms(normalizedRooms);

    } catch (error: any) {
      console.error('Error fetching user rooms:', error);
      try {
        const fallbackRooms = await fetchRoomsWithoutRpc();
        setRooms(fallbackRooms);
      } catch (fallbackError) {
        console.error('Fallback room fetch failed:', fallbackError);
        toast({ variant: 'destructive', title: 'Error loading chats', description: 'Could not fetch your chat rooms. Please try refreshing.' });
      }
    } finally {
      setLoadingRooms(false);
    }
  }, [user, supabase, toast, fetchRoomsWithoutRpc]);

  useEffect(() => {
    if (user && supabase) {
      fetchRooms();
    }
  }, [user, supabase, fetchRooms]);


  const handleSelectRoom = useCallback(async (room: Room) => {
    if (!supabase) return;
    setSelectedRoom(room);
    setLoadingMessages(true);
    setMessages([]);
    setSessionKey(null);

    // 1. Fetch encrypted session key for this room
    const { data: keyData, error: keyError } = await supabase
      .from('chat_room_keys')
      .select('encrypted_session_key, room_id, user_id')
      .eq('room_id', room.id)
      .eq('user_id', user?.id)
      .maybeSingle();

    let currentSessionKey: CryptoKey | null = null;

    if (keyData && e2eeKeys) {
      try {
        // Find the other participant's public key to unwrap the session key
        // (In a private chat, there's only one other person)
        const { data: participants } = await supabase
          .from('chat_participants')
          .select('user_id')
          .eq('room_id', room.id)
          .neq('user_id', user?.id);

        const otherUserId = participants?.[0]?.user_id;
        if (otherUserId) {
          const { data: otherProfile } = await supabase
            .from('profiles')
            .select('public_key')
            .eq('id', otherUserId)
            .single();

          if (otherProfile?.public_key) {
            const otherPublicKey = await importPublicKey(otherProfile.public_key);
            currentSessionKey = await unwrapSessionKey(
              keyData.encrypted_session_key,
              otherPublicKey,
              e2eeKeys.privateKey
            );
            setSessionKey(currentSessionKey);
          }
        }
      } catch (err) {
        console.error('Failed to unwrap session key:', err);
      }
    }

    // 2. Fetch messages
    const { data: messageRows, error } = await supabase
      .from('chat_messages')
      .select('id, content, created_at, room_id, user_id')
      .eq('room_id', room.id)
      .order('created_at', { ascending: true });

    if (error) {
      toast({ variant: 'destructive', title: 'Error fetching messages' });
      console.error(error);
      setLoadingMessages(false);
      return;
    }

    type RawMessage = Omit<Message, 'profile'>;

    const rawMessages = (messageRows || []) as RawMessage[];
    const userIds = Array.from(new Set(rawMessages.map((message) => message.user_id)));

    if (userIds.length === 0) {
      setMessages(rawMessages.map((message) => ({ ...message, profile: null })));
      setLoadingMessages(false);
      return;
    }

    const { data: profileRows, error: profileError } = await supabase
      .from('profiles')
      .select('id, full_name, avatar_url, handle')
      .in('id', userIds);

    if (profileError) {
      console.error(profileError);
    }

    const profileMap = new Map((profileRows || []).map((profile) => [profile.id, profile]));

    const messagesWithProfiles = await Promise.all(
      rawMessages.map(async (message) => {
        let content = message.content;
        // Try to decrypt if it's an encrypted message
        if (currentSessionKey && (message as any).iv) {
          try {
            content = await decryptContent(message.content, (message as any).iv, currentSessionKey);
          } catch (err) {
            content = '[Decryption Failed]';
          }
        }
        return {
          ...message,
          content,
          profile: profileMap.get(message.user_id) || null,
        };
      })
    );

    setMessages(messagesWithProfiles);
    setLoadingMessages(false);
  }, [supabase, toast]);

  useEffect(() => {
    if (!isMobile && rooms.length > 0 && !selectedRoom) {
      handleSelectRoom(rooms[0]);
    }
  }, [rooms, isMobile, selectedRoom, handleSelectRoom]);

  // Real-time message subscription
  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('public:chat_messages')
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          // Refetch rooms to get new "last message" and order
          fetchRooms();
          // If the message is for the currently selected room, add it to the view
          if (selectedRoom && payload.new.room_id === selectedRoom.id) {
            const newMessage = payload.new as Message;
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', newMessage.user_id)
              .single();

            if (!error && profileData) {
              newMessage.profile = profileData as Profile;
            }

            // Decrypt matching message
            if (sessionKey && (payload.new as any).iv) {
              try {
                newMessage.content = await decryptContent(newMessage.content, (payload.new as any).iv, sessionKey);
              } catch (err) {
                newMessage.content = '[Decryption Failed]';
              }
            }

            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedRoom, supabase, fetchRooms, user]);


  const handleSendMessage = async (content: string) => {
    if (!selectedRoom || !user || !supabase) return;

    let finalContent = content;
    let iv: string | undefined;

    if (sessionKey) {
      try {
        const encrypted = await encryptContent(content, sessionKey);
        finalContent = encrypted.ciphertext;
        iv = encrypted.iv;
      } catch (err) {
        console.error('Encryption failed:', err);
        return; // Don't send unencrypted if encryption failed
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: finalContent,
        room_id: selectedRoom.id,
        user_id: user.id,
        iv, // Include IV for decryption
      } as any);

    if (error) {
      toast({ variant: 'destructive', title: 'Error sending message' });
      console.error(error);
    }
  };

  const handleStartNewChat = async (otherUser: Profile) => {
    if (!user || !supabase) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
      return;
    }
    if (user.id === otherUser.id) {
      toast({ variant: 'destructive', title: 'Error', description: 'You cannot start a chat with yourself.' });
      return;
    }
    setIsNewChatModalOpen(false);

    try {
      const { error } = await supabase.rpc('create_private_chat', {
        p_user1_id: user.id,
        p_user2_id: otherUser.id,
      });

      if (error) throw error;

      await fetchRooms();
      router.push('/chat');
      // The selection will happen via useEffect after rooms are refetched

    } catch (error) {
      console.error('Error starting chat session:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat session.' });
    }
  }

  const inboxTabs = [
    { value: 'primary' as const, label: 'Primary' },
    { value: 'general' as const, label: 'General' },
    { value: 'requests' as const, label: 'Requests' },
  ];

  const filteredRooms = useMemo(() => {
    if (!searchTerm.trim()) {
      return rooms;
    }
    const query = searchTerm.toLowerCase();
    return rooms.filter((room) => {
      const name = room.name?.toLowerCase() ?? '';
      const lastMessage = room.last_message?.toLowerCase() ?? '';
      return name.includes(query) || lastMessage.includes(query);
    });
  }, [rooms, searchTerm]);

  const highlightRooms = useMemo(() => rooms.slice(0, 8), [rooms]);

  const ChatListScreen = () => (
    <div className="flex h-full flex-col">
      <header className="border-b bg-background/95 pb-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between px-4 pt-4">
          <div className="flex items-center gap-3">
            {isMobile ? (
              <Button
                variant="outline"
                size="icon"
                className="rounded-full"
                onClick={() => router.back()}
              >
                <ArrowLeft className="size-5" />
              </Button>
            ) : null}
            <div>
              <h1 className="text-xl font-semibold text-foreground md:text-2xl">Messages</h1>
              <p className="text-xs text-muted-foreground md:text-sm">Stay on top of your conversations and leads</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-full">
              <Filter className="size-4" />
              <span className="sr-only">Filter</span>
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full border-primary text-primary"
              onClick={() => setIsNewChatModalOpen(true)}
            >
              <Plus className="size-5" />
              <span className="sr-only">New Chat</span>
            </Button>
          </div>
        </div>
        <div className="space-y-4 px-4 pt-4">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search"
              className="h-10 rounded-full border-none bg-muted pl-10 text-sm"
            />
          </div>
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            <button
              type="button"
              className="flex shrink-0 flex-col items-center gap-2"
              onClick={() => setIsNewChatModalOpen(true)}
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-dashed border-primary/60 text-lg text-primary">
                +
              </span>
              <span className="text-xs text-muted-foreground">New note</span>
            </button>
            {highlightRooms.map((room) => (
              <div key={room.id} className="flex shrink-0 flex-col items-center gap-2">
                <div className="rounded-full border-2 border-primary/60 p-[2px]">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={room.avatar || `https://picsum.photos/seed/${room.id}/80`} alt={room.name || 'Chat'} />
                    <AvatarFallback>{room.name?.charAt(0) || 'C'}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="w-16 truncate text-center text-xs text-muted-foreground">{room.name || 'Conversation'}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2 text-sm font-medium">
            {inboxTabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setActiveInboxTab(tab.value)}
                className={cn(
                  'rounded-full px-4 py-1.5 transition',
                  activeInboxTab === tab.value
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>
      {loadingRooms ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-primary" />
        </div>
      ) : (
        <ChatList rooms={filteredRooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p>Please log in to view your chats.</p>
      </div>
    );
  }

  return (
    <>
      <NewChatModal
        isOpen={isNewChatModalOpen}
        onOpenChange={setIsNewChatModalOpen}
        onSelectUser={handleStartNewChat}
      />
      <div className="grid grid-cols-1 md:grid-cols-3 h-[calc(100vh-8rem)]">
        <div className="col-span-1 border-r">
          <ChatListScreen />
        </div>
        <div className="col-span-2 flex flex-col">
          <ChatMessages
            room={selectedRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loadingMessages}
            currentUser={user}
          />
        </div>
      </div>
    </>
  );
}
