'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Loader2, ArrowLeft, X, ShieldCheck, Lock, CheckCheck, Phone, Video, Mic, Smile } from 'lucide-react';
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
    <div className="flex flex-1 flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-3 px-4 py-2 bg-[#f0f2f5] dark:bg-[#202c33] z-10 shrink-0">
        <div className="flex items-center gap-3 cursor-pointer">
          {onBack ? (
            <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden -ml-2 h-8 w-8 rounded-full">
              <ArrowLeft className="size-5" />
            </Button>
          ) : null}
          <Avatar className="h-10 w-10">
            <AvatarImage src={roomAvatar} alt={roomName} />
            <AvatarFallback className="bg-[#dfe5e7] dark:bg-[#6a7175] text-[#54656f] dark:text-[#aebac1]">{roomName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[16px] font-medium text-[#111b21] dark:text-[#e9edef] truncate leading-tight">{roomName}</h2>
            <span className="text-[12px] text-[#667781] dark:text-[#8696a0] truncate">last seen today at 10:58 am</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-[#54656f] dark:text-[#aebac1]">
          <Search className="size-5 cursor-pointer hover:opacity-70 transition-opacity" />
          <X className="size-5 cursor-pointer hover:opacity-70 transition-opacity" />
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-12 py-4" ref={scrollAreaRef}>
        <div className="space-y-2 max-w-5xl mx-auto flex flex-col">
          {/* Today Separator */}
          <div className="flex justify-center my-4">
            <div className="bg-white dark:bg-[#182229] px-3 py-1.5 rounded-lg text-[12.5px] font-medium text-[#54656f] dark:text-[#8696a0] shadow-sm uppercase tracking-wide">
              Today
            </div>
          </div>

          {messages.map((message, index) => {
            const isSentByMe = message.user_id === user?.id;
            const senderProfile = message.profile;
            const senderAvatar = senderProfile?.avatar_url || 'https://picsum.photos/seed/user/40/40';
            const senderName = senderProfile?.full_name || 'User';

            return (
              <div
                key={message.id}
                className={cn(
                  'flex flex-col w-full mb-1',
                  isSentByMe ? 'items-end' : 'items-start'
                )}
              >
                <div
                  className={cn(
                    'relative max-w-[85%] md:max-w-[65%] px-2.5 py-1.5 shadow-sm text-[14.2px] leading-[19px]',
                    isSentByMe
                      ? 'bg-[#dcf8c6] dark:bg-[#005c4b] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tr-none'
                      : 'bg-[#ffffff] dark:bg-[#202c33] text-[#111b21] dark:text-[#e9edef] rounded-lg rounded-tl-none'
                  )}
                >
                  <div className="flex flex-col whitespace-pre-wrap break-words pr-12">
                    {message.content.startsWith('[File]') ? (
                      <div className="flex flex-col gap-2 p-1 bg-black/5 dark:bg-white/5 rounded-lg overflow-hidden max-w-[280px]">
                        {message.content.match(/\.(jpg|jpeg|png|gif|webp)$|publicUrl\=.*(jpg|jpeg|png|gif|webp)/i) ? (
                          <div className="relative aspect-square w-full bg-muted rounded-md overflow-hidden">
                            <img
                              src={message.content.split(': ')[1]}
                              alt="Shared image"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-3 p-2">
                            <div className="p-2 bg-red-500 rounded text-white italic font-bold text-[10px]">
                              {message.content.split(':')[0].split('.').pop()?.toUpperCase() || 'FILE'}
                            </div>
                            <span className="text-[13px] font-medium truncate">{message.content.split(':')[0].replace('[File] ', '')}</span>
                          </div>
                        )}
                        {!message.content.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                          <div className="px-2 pb-2 text-[11px] text-muted-foreground">Document • {message.content.split('.').pop()?.toUpperCase() || 'File'}</div>
                        )}
                      </div>
                    ) : message.content.startsWith('[Voice Note]') ? (
                      <div className="flex items-center gap-3 p-2 min-w-[200px] bg-black/5 dark:bg-white/5 rounded-lg">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <Mic className="size-5 text-primary" />
                        </div>
                        <div className="flex flex-col flex-1 gap-1">
                          <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                            <div className="h-full w-1/3 bg-primary" />
                          </div>
                          <span className="text-[11px] text-muted-foreground">0:12</span>
                        </div>
                      </div>
                    ) : message.content}
                  </div>

                  <div className={cn(
                    "absolute bottom-1 right-2 flex items-center gap-1.5",
                    isSentByMe ? "text-[#667781] dark:text-[#8696a0]" : "text-[#667781] dark:text-[#8696a0]"
                  )}>
                    <span className="text-[11px] tabular-nums font-normal">
                      {new Date(message.created_at).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {isSentByMe && <CheckCheck className="size-[16px] text-[#53bdeb]" />}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-[#f0f2f5] dark:bg-[#202c33] px-4 py-2 flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 text-[#54656f] dark:text-[#aebac1]">
          <Smile className="size-6 cursor-pointer hover:opacity-70 transition-opacity" />
          <Plus className="size-6 cursor-pointer hover:opacity-70 transition-opacity" onClick={() => fileInputRef.current?.click()} />
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            id="file-upload"
            disabled={isUploading}
          />
        </div>
        <div className="flex-1 flex items-center bg-white dark:bg-[#2a3942] rounded-lg px-3 py-1 shadow-sm">
          <Input
            placeholder="Type a message"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            disabled={isUploading}
            className="flex-1 h-9 border-none bg-transparent shadow-none focus-visible:ring-0 text-[15px] placeholder:text-[#667781] dark:placeholder:text-[#8696a0] px-0"
          />
        </div>
        <div className="text-[#54656f] dark:text-[#aebac1]">
          {newMessage.trim() || selectedFile ? (
            <Button
              onClick={handleSend}
              variant="ghost"
              size="icon"
              className="text-[#54656f] dark:text-[#aebac1] hover:bg-transparent"
              disabled={isUploading}
            >
              <Send className="size-6" />
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              className="text-[#54656f] dark:text-[#aebac1] hover:bg-transparent"
            >
              <Mic className="size-6" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
