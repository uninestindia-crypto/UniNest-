'use client';

import { useState, useEffect, useCallback } from 'react';
import ChatList from './chat-list';
import ChatMessages from './chat-messages';
import type { Room, Message, Profile } from '@/lib/types';
import { useIsMobile } from '@/hooks/use-mobile';
import { ArrowLeft, Loader2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { redirect, useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import NewChatModal from './new-chat-modal';

export default function ChatLayout() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const { user, supabase, loading: authLoading } = useAuth();
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const router = useRouter();
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      redirect('/login');
    }
  }, [authLoading, user]);

  const fetchRooms = useCallback(async () => {
    if (!user || !supabase) {
      setLoadingRooms(false);
      return;
    }
    setLoadingRooms(true);
    try {
      const { data, error } = await supabase.rpc('get_user_chat_rooms');

      if (error) {
        throw error;
      }
      
      setRooms(data || []);

    } catch (error: any) {
        console.error('Error fetching user rooms:', error);
        toast({ variant: 'destructive', title: 'Error loading chats', description: 'Could not fetch your chat rooms. Please try refreshing.' });
    } finally {
        setLoadingRooms(false);
    }
  }, [user, supabase, toast]);
  
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

    const messagesWithProfiles = rawMessages.map((message) => ({
      ...message,
      profile: profileMap.get(message.user_id) || null,
    }));

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

    const { error } = await supabase
      .from('chat_messages')
      .insert({
        content,
        room_id: selectedRoom.id,
        user_id: user.id,
      });

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
        const { data, error } = await supabase.rpc('create_private_chat', {
            p_user1_id: user.id,
            p_user2_id: otherUser.id,
        });

        if (error) throw error;
        const newRoomId = data;

        // Insert a starting message to "activate" the chat for both users
        const { error: messageError } = await supabase.from('chat_messages').insert({
            room_id: newRoomId,
            user_id: user.id,
            content: `Started a new chat with ${otherUser.full_name}.`,
        });

        if (messageError) throw messageError;

        await fetchRooms();
        router.push('/chat');
        // The selection will happen via useEffect after rooms are refetched
        
    } catch (error) {
        console.error('Error starting chat session:', error);
        toast({ variant: 'destructive', title: 'Error', description: 'Could not start a new chat session.' });
    }
  }

  const ChatListScreen = () => (
    <div className="flex flex-col h-full">
       <header className="p-4 space-y-4 bg-card border-b">
          <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold text-primary">Messages</h1>
              <Button variant="ghost" size="icon" onClick={() => setIsNewChatModalOpen(true)}>
                <Plus className="size-6" />
                <span className="sr-only">New Chat</span>
              </Button>
          </div>
      </header>
       {loadingRooms ? (
            <div className="flex items-center justify-center flex-1">
                <Loader2 className="size-8 animate-spin text-primary" />
            </div>
        ) : (
          <ChatList rooms={rooms} selectedRoom={selectedRoom} onSelectRoom={handleSelectRoom} />
        )}
    </div>
  )

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
