'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Loader2, ArrowLeft, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import type { Room, Message } from '@/lib/types';
import type { User } from '@supabase/supabase-js';

type ChatMessagesProps = {
  room: Room | null;
  messages: Message[];
  onSendMessage: (text: string) => void;
  loading: boolean;
  currentUser: User | null;
  onBack?: () => void;
};

export default function ChatMessages({ room, messages, onSendMessage, loading, currentUser: user, onBack }: ChatMessagesProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { supabase } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
        const scrollContainer = scrollAreaRef.current.querySelector('div');
        if (scrollContainer) {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!supabase || !room) return;
    
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
    const filePath = `chat-files/${room.id}/${fileName}`;
    
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;
      setUploadProgress(100);
      
      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

      // Send the file URL as a message
      onSendMessage(`[File] ${file.name}: ${publicUrl}`);
      
      toast({
        title: 'File uploaded',
        description: `${file.name} has been shared in the chat`,
      });
    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: 'Could not upload the file. Please try again.',
      });
    } finally {
      setIsUploading(false);
      setSelectedFile(null);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (loading) {
     return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <Loader2 className="size-8 animate-spin" />
      </div>
    );
  }

  if (!room) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        <p>Select a chat to start messaging</p>
      </div>
    );
  }
  
  const roomAvatar = room.avatar || `https://picsum.photos/seed/${room.id}/40`;
  const roomName = room.name || 'Chat';

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center gap-2 border-b p-2 md:p-4">
        {onBack ? (
          <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden">
            <ArrowLeft />
          </Button>
        ) : null}
        <Avatar className="h-10 w-10">
          <AvatarImage src={roomAvatar} alt={roomName} data-ai-hint="person face" />
          <AvatarFallback>{roomName.charAt(0)}</AvatarFallback>
        </Avatar>
        <h2 className="text-lg font-semibold">{roomName}</h2>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.map((message) => {
            const isSentByMe = message.user_id === user?.id;
            const senderProfile = message.profile;
            const senderAvatar = senderProfile?.avatar_url || 'https://picsum.photos/seed/user/40/40';
            const senderName = senderProfile?.full_name || 'User';

            return (
              <div key={message.id} className={cn('flex items-end gap-3', isSentByMe && 'justify-end')}>
                {!isSentByMe ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={senderAvatar} alt={senderName} data-ai-hint="person face" />
                    <AvatarFallback>{senderName.charAt(0)}</AvatarFallback>
                  </Avatar>
                ) : null}
                <div
                  className={cn(
                    'max-w-xs rounded-lg p-3 md:max-w-md',
                    isSentByMe ? 'primary-gradient text-primary-foreground' : 'bg-muted'
                  )}
                >
                  <p className="text-sm">{message.content}</p>
                  <p
                    className={cn(
                      'mt-1 text-xs',
                      isSentByMe ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    )}
                  >
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {isSentByMe ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage
                      src={user?.user_metadata?.avatar_url || 'https://picsum.photos/id/237/40/40'}
                      alt="Your avatar"
                    />
                    <AvatarFallback>{user?.email?.[0].toUpperCase() || 'U'}</AvatarFallback>
                  </Avatar>
                ) : null}
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="space-y-2 border-t p-4">
        {isUploading ? (
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        ) : null}
        {selectedFile ? (
          <div className="flex items-center justify-between rounded-md bg-muted p-2 text-sm">
            <span className="truncate">{selectedFile.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleRemoveFile}
              disabled={isUploading}
            >
              <X className="size-4" />
            </Button>
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
          <Button variant="ghost" size="icon" asChild disabled={isUploading}>
            <label htmlFor="file-upload" className="cursor-pointer">
              <Paperclip className="size-5" />
              <span className="sr-only">Attach file</span>
            </label>
          </Button>
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isUploading}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={isUploading || (!newMessage.trim() && !selectedFile)}>
            {isUploading ? <Loader2 className="size-5 animate-spin" /> : <Send className="size-5" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
