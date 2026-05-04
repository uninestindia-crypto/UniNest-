'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message, Profile } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Filter, Loader2, Plus, Search, MessageSquare, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import NewChatModal from './new-chat-modal';
import { Input } from '../ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import {
  generateSessionKey,
  wrapSessionKey,
  unwrapSessionKey,
  encryptContent,
  decryptContent,
  importPublicKey
} from '@/lib/crypto';
import { BrandingLogo } from '@/components/branding/branding-logo';

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
  const [activeInboxTab, setActiveInboxTab] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    if (!authLoading && !user && !hasRedirected) {
      setHasRedirected(true);
      router.replace('/login');
    }
  }, [authLoading, user, router, hasRedirected]);

  const fetchRoomsWithoutRpc = useCallback(async (): Promise<Room[]> => {
    if (!supabase || !user) {
      return [];
    }

    const { data: participantRows, error: participantError } = await supabase
      .from('chat_participants')
      .select('room_id')
      .eq('user_id', user.id);

    if (participantError) {
      throw participantError;
    }

    const userRoomIds = (participantRows || []).map((r: any) => r.room_id);
    if (userRoomIds.length === 0) {
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
      .in('id', userRoomIds)
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
  }, [supabase, user]);

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

    const { data: keyData, error: keyError } = await supabase
      .from('chat_room_keys')
      .select('encrypted_session_key, room_id, user_id')
      .eq('room_id', room.id)
      .eq('user_id', user?.id)
      .maybeSingle();

    let currentSessionKey: CryptoKey | null = null;

    if (keyData && e2eeKeys) {
      try {
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
  }, [supabase, toast, user, e2eeKeys]);

  useEffect(() => {
    if (!isMobile && rooms.length > 0 && !selectedRoom) {
      handleSelectRoom(rooms[0]);
    }
  }, [rooms, isMobile, selectedRoom, handleSelectRoom]);

  useEffect(() => {
    if (!supabase || !user) return;

    const channel = supabase
      .channel('public:chat_messages')
      .on<Message>(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat_messages' },
        async (payload) => {
          fetchRooms();
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
  }, [selectedRoom, supabase, fetchRooms, user, sessionKey]);


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
        return;
      }
    }

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content: finalContent,
        room_id: selectedRoom.id,
        user_id: user.id,
        iv,
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
      router.refresh();

    } catch (error) {
      console.error('Error starting chat session:', error);
      toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat session.' });
    }
  }

  const inboxTabs = [
    { value: 'all' as const, label: 'All Messages' },
    { value: 'unread' as const, label: 'Unread' },
  ];

  const filteredRooms = useMemo(() => {
    let result = rooms;
    if (activeInboxTab === 'unread') {
      result = result.filter(r => (r.unread_count || 0) > 0);
    }
    if (!searchTerm.trim()) {
      return result;
    }
    const query = searchTerm.toLowerCase();
    return result.filter((room) => {
      const name = room.name?.toLowerCase() ?? '';
      const lastMessage = room.last_message?.toLowerCase() ?? '';
      return name.includes(query) || lastMessage.includes(query);
    });
  }, [rooms, searchTerm, activeInboxTab]);


  const ChatListScreen = () => (
    <div className="flex h-full flex-col bg-background/95 backdrop-blur-md">
      <header className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          {isMobile && (
            <Button variant="ghost" size="icon" className="-ml-2 h-8 w-8 rounded-full" onClick={() => router.back()}>
              <ArrowLeft className="size-4" />
            </Button>
          )}
          <div className="flex items-center gap-2.5">
            <div className="bg-indigo-600 rounded-lg p-1.5 shadow-sm">
                <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-700 dark:bg-indigo-950 dark:text-indigo-400 dark:hover:bg-indigo-900"
          onClick={() => setIsNewChatModalOpen(true)}
        >
          <PlusCircle className="size-5" />
        </Button>
      </header>

      <div className="px-4 py-3 space-y-3">
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search messages..."
            className="h-10 w-full rounded-xl bg-muted/50 border-transparent pl-9 pr-4 text-sm focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 border-b border-border/50 pb-2">
          {inboxTabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveInboxTab(tab.value)}
              className={cn(
                'px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                activeInboxTab === tab.value
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground hover:bg-muted/80 hover:text-foreground'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      {loadingRooms ? (
        <div className="flex flex-1 items-center justify-center">
          <Loader2 className="size-8 animate-spin text-indigo-600" />
        </div>
      ) : (
        <ChatList rooms={filteredRooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
      )}
    </div>
  );

  if (authLoading) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your chats.</p>
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
      {/* Desktop Layout */}
      <div className="hidden md:grid md:grid-cols-[320px_1fr] lg:grid-cols-[380px_1fr] h-[calc(100vh-4.5rem)] rounded-2xl border border-border/50 overflow-hidden bg-background shadow-sm m-4 lg:m-6">
        <div className="border-r border-border/50 bg-slate-50/50 dark:bg-slate-950/50 overflow-hidden">
          <ChatListScreen />
        </div>
        <div className="flex flex-col overflow-hidden relative bg-white dark:bg-slate-950">
          <div className="relative z-10 flex flex-col overflow-hidden h-full">
            {selectedRoom ? (
              <ChatMessages
                room={selectedRoom}
                messages={messages}
                onSendMessage={handleSendMessage}
                loading={loadingMessages}
                currentUser={user}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-slate-50/50 dark:bg-transparent">
                <div className="h-20 w-20 bg-indigo-50 dark:bg-indigo-950/50 rounded-full flex items-center justify-center mb-6 shadow-sm">
                    <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2 tracking-tight">Your Messages</h2>
                <p className="text-muted-foreground max-w-md mx-auto text-sm leading-relaxed">
                  Select a conversation from the sidebar or start a new chat with someone from the marketplace.
                </p>
                <Button 
                    onClick={() => setIsNewChatModalOpen(true)}
                    className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-6 shadow-sm"
                >
                    <PlusCircle className="mr-2 h-4 w-4" /> Start New Chat
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Mobile Layout */}
      <div className="flex flex-col h-[calc(100vh-4rem)] md:hidden overflow-hidden bg-background">
        {selectedRoom ? (
          <ChatMessages
            room={selectedRoom}
            messages={messages}
            onSendMessage={handleSendMessage}
            loading={loadingMessages}
            currentUser={user}
            onBack={() => setSelectedRoom(null)}
          />
        ) : (
          <ChatListScreen />
        )}
      </div>
    </>
  );
}
