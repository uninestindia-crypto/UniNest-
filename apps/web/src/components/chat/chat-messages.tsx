'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Loader2, ArrowLeft, X, ShieldCheck, Lock, CheckCheck } from 'lucide-react';
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
      <div className="flex items-center gap-3 border-b border-border/40 p-3 md:px-5 md:py-3.5 bg-background/95 backdrop-blur z-10 sticky top-0">
        {onBack ? (
          <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden -ml-2 h-9 w-9 rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
        ) : null}
        <Avatar className="h-10 w-10 border border-background shadow-sm">
          <AvatarImage src={roomAvatar} alt={roomName} data-ai-hint="person face" />
          <AvatarFallback className="bg-primary/5 text-primary text-sm font-medium">{roomName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col ml-1">
          <h2 className="text-base font-semibold tracking-tight">{roomName}</h2>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80 font-medium">
            <ShieldCheck className="size-3.5 text-primary/70" />
            <span>End-to-End Encrypted</span>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 md:p-6" ref={scrollAreaRef}>
        <div className="space-y-4 md:space-y-6">
          {messages.map((message) => {
            const isSentByMe = message.user_id === user?.id;
            const senderProfile = message.profile;
            const senderAvatar = senderProfile?.avatar_url || 'https://picsum.photos/seed/user/40/40';
            const senderName = senderProfile?.full_name || 'User';

            return (
              <div key={message.id} className={cn('flex flex-col gap-1 w-full max-w-[85%] md:max-w-[70%]', isSentByMe ? 'ml-auto items-end' : 'mr-auto items-start')}>
                <div className="flex items-end gap-2 w-full">
                  {!isSentByMe ? (
                    <Avatar className="h-7 w-7 shrink-0 mb-1 border border-background shadow-sm">
                      <AvatarImage src={senderAvatar} alt={senderName} data-ai-hint="person face" />
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-medium">{senderName.charAt(0)}</AvatarFallback>
                    </Avatar>
                  ) : null}
                  <div
                    className={cn(
                      'relative flex flex-col px-4 py-2.5 text-[15px] shadow-sm',
                      isSentByMe
                        ? 'bg-primary text-primary-foreground rounded-2xl rounded-br-[4px] ml-auto'
                        : 'bg-card border border-border/40 text-foreground rounded-2xl rounded-tl-[4px] mr-auto'
                    )}
                  >
                    {!isSentByMe && (
                      <span className="text-[12px] font-semibold text-primary/80 mb-0.5 leading-none">{senderName}</span>
                    )}
                    <span className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</span>

                    <div className={cn(
                      "flex items-center gap-1 mt-1 justify-end self-end",
                      isSentByMe ? "text-primary-foreground/70" : "text-muted-foreground/60"
                    )}>
                      {isSentByMe && <Lock className="size-2.5 opacity-60 hidden" />}
                      <span className="text-[10px] tabular-nums font-medium">
                        {new Date(message.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isSentByMe && <CheckCheck className="size-[14px] ml-0.5 opacity-90" />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>
      <div className="p-3 md:p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/40">
        <div className="space-y-2 max-w-4xl mx-auto w-full">
          {isUploading ? (
            <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary/50 mx-2">
              <div
                className="absolute inset-y-0 left-0 bg-primary transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          ) : null}
          {selectedFile ? (
            <div className="flex items-center justify-between mx-2 rounded-xl bg-muted/80 border border-border/50 p-2 text-sm shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2 overflow-hidden px-2">
                <Paperclip className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{selectedFile.name}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full hover:bg-destructive/10 hover:text-destructive shrink-0"
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
            <div className="relative flex-1 flex items-center bg-muted/60 border border-transparent rounded-full shadow-sm focus-within:bg-background focus-within:ring-1 focus-within:ring-border transition-all duration-200 hover:bg-muted/80 focus-within:hover:bg-background">
              <Button variant="ghost" size="icon" asChild disabled={isUploading} className="absolute left-1 h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 z-10 transition-colors">
                <label htmlFor="file-upload" className="cursor-pointer flex items-center justify-center">
                  <Paperclip className="size-4.5" />
                  <span className="sr-only">Attach file</span>
                </label>
              </Button>
              <Input
                placeholder="Message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                disabled={isUploading}
                className="flex-1 h-11 pl-12 pr-12 rounded-full border-none bg-transparent shadow-none focus-visible:ring-0 text-[15px]"
              />
              {newMessage.trim() || selectedFile ? (
                <Button
                  onClick={handleSend}
                  disabled={isUploading}
                  size="icon"
                  className="absolute right-1 h-9 w-9 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shrink-0 z-10 shadow-sm transition-transform active:scale-95"
                >
                  {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
                  <span className="sr-only">Send</span>
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
