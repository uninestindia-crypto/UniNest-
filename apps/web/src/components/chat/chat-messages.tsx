'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Paperclip, Send, Loader2, ArrowLeft, MoreVertical, Phone, Video, Mic, Smile, Info, File, Image as ImageIcon } from 'lucide-react';
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { supabase } = useAuth();

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('div');
      if (scrollContainer) {
        setTimeout(() => {
            scrollContainer.scrollTop = scrollContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages, loading]);

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

    try {
      const { data, error } = await supabase.storage
        .from('chat-files')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from('chat-files')
        .getPublicUrl(filePath);

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
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center bg-slate-50/30 dark:bg-transparent">
        <Loader2 className="size-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!room) return null;

  const roomAvatar = room.avatar || `https://picsum.photos/seed/${room.id}/40`;
  const roomName = room.name || 'Chat';

  return (
    <div className="flex flex-1 flex-col h-full relative">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-indigo-50/50 dark:bg-indigo-900/10 rounded-full blur-3xl pointer-events-none"></div>
      
      {/* Chat Header */}
      <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl z-10 shrink-0 border-b border-border/50">
        <div className="flex items-center gap-3">
          {onBack ? (
            <Button onClick={onBack} variant="ghost" size="icon" className="md:hidden -ml-2 h-9 w-9 rounded-full bg-slate-100 dark:bg-slate-900">
              <ArrowLeft className="size-5" />
            </Button>
          ) : null}
          <div className="relative">
              <Avatar className="h-[42px] w-[42px] shadow-sm">
                <AvatarImage src={roomAvatar} alt={roomName} />
                <AvatarFallback className="bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 font-semibold">{roomName.charAt(0)}</AvatarFallback>
              </Avatar>
              <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950"></div>
          </div>
          <div className="flex flex-col min-w-0">
            <h2 className="text-[16px] font-bold text-foreground truncate tracking-tight">{roomName}</h2>
            <span className="text-[12px] text-emerald-600 dark:text-emerald-400 font-medium">Online</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900 hidden sm:flex">
                <Phone className="size-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900 hidden sm:flex">
                <Video className="size-[18px]" />
            </Button>
            <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:bg-slate-100 dark:hover:bg-slate-900">
                <Info className="size-[18px]" />
            </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 px-4 md:px-6 py-6 z-0" ref={scrollAreaRef}>
        <div className="space-y-4 max-w-4xl mx-auto flex flex-col pb-4">
          <div className="flex justify-center my-2">
            <div className="bg-slate-100/80 dark:bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
              Today
            </div>
          </div>

          {messages.map((message) => {
            const isSentByMe = message.user_id === user?.id;
            const senderProfile = message.profile;
            const senderAvatar = senderProfile?.avatar_url || `https://picsum.photos/seed/${message.user_id}/40/40`;

            return (
              <div
                key={message.id}
                className={cn(
                  'flex w-full mb-2 group',
                  isSentByMe ? 'justify-end' : 'justify-start'
                )}
              >
                <div className={cn('flex gap-2 max-w-[85%] md:max-w-[75%]', isSentByMe ? 'flex-row-reverse' : 'flex-row')}>
                    {!isSentByMe && (
                        <Avatar className="h-8 w-8 shrink-0 mt-auto hidden sm:block shadow-sm">
                            <AvatarImage src={senderAvatar} />
                            <AvatarFallback className="bg-indigo-50 text-indigo-600 text-[10px]">{senderProfile?.full_name?.charAt(0) || 'U'}</AvatarFallback>
                        </Avatar>
                    )}
                    
                    <div className="flex flex-col relative group">
                        <div
                            className={cn(
                                'relative px-4 py-2.5 shadow-sm text-[14px] leading-relaxed max-w-full inline-block',
                                isSentByMe
                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[20px] rounded-br-[4px] shadow-indigo-500/20'
                                : 'bg-white dark:bg-slate-900 text-foreground border border-border/50 rounded-[20px] rounded-bl-[4px]'
                            )}
                        >
                            <div className="flex flex-col break-words">
                                {message.content.startsWith('[File]') ? (
                                <div className="flex flex-col gap-2 rounded-xl overflow-hidden min-w-[200px] max-w-[280px]">
                                    {message.content.match(/\.(jpg|jpeg|png|gif|webp)$|publicUrl\=.*(jpg|jpeg|png|gif|webp)/i) ? (
                                    <div className="relative rounded-lg overflow-hidden border border-white/20 dark:border-white/10 group-hover:opacity-95 transition-opacity">
                                        <img
                                        src={message.content.split(': ')[1]}
                                        alt="Shared file"
                                        className="h-auto w-full object-cover max-h-[300px]"
                                        />
                                    </div>
                                    ) : (
                                    <div className={cn("flex items-center gap-3 p-3 rounded-xl", isSentByMe ? "bg-white/10" : "bg-slate-100 dark:bg-slate-800")}>
                                        <div className={cn("p-2 rounded-lg", isSentByMe ? "bg-white/20" : "bg-indigo-100 dark:bg-indigo-900/50")}>
                                            <File className={cn("size-5", isSentByMe ? "text-white" : "text-indigo-600 dark:text-indigo-400")} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[13px] font-bold truncate">{message.content.split(':')[0].replace('[File] ', '')}</span>
                                            <span className="text-[11px] opacity-70 uppercase font-medium">{message.content.split(':')[0].split('.').pop()} Document</span>
                                        </div>
                                    </div>
                                    )}
                                </div>
                                ) : message.content.startsWith('[Voice Note]') ? (
                                <div className={cn("flex items-center gap-3 p-1 min-w-[180px] rounded-full", isSentByMe ? "bg-white/10 pr-4" : "bg-slate-100 dark:bg-slate-800 pr-4")}>
                                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center shrink-0", isSentByMe ? "bg-white text-indigo-600" : "bg-indigo-600 text-white")}>
                                    <Mic className="size-4" />
                                    </div>
                                    <div className="flex flex-col flex-1 gap-1">
                                    <div className={cn("h-1.5 w-full rounded-full overflow-hidden", isSentByMe ? "bg-white/30" : "bg-slate-300 dark:bg-slate-700")}>
                                        <div className={cn("h-full w-1/3", isSentByMe ? "bg-white" : "bg-indigo-600")} />
                                    </div>
                                    <span className={cn("text-[10px] font-bold", isSentByMe ? "text-white/80" : "text-muted-foreground")}>0:12</span>
                                    </div>
                                </div>
                                ) : message.content}
                            </div>
                        </div>
                        <span className={cn(
                            "text-[10px] font-medium mt-1 px-1",
                            isSentByMe ? "text-right text-muted-foreground" : "text-left text-muted-foreground"
                        )}>
                            {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-4 shrink-0 border-t border-border/50 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] dark:shadow-none">
        <div className="max-w-4xl mx-auto">
            <div className="flex items-end gap-2 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[24px] p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all">
                <div className="flex items-center gap-1 pl-1 pb-1">
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800 shrink-0">
                        <Smile className="size-[20px]" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-muted-foreground hover:text-foreground hover:bg-slate-200/50 dark:hover:bg-slate-800 shrink-0" onClick={() => fileInputRef.current?.click()}>
                        <Paperclip className="size-[18px]" />
                    </Button>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        className="hidden"
                        id="file-upload"
                        disabled={isUploading}
                    />
                </div>
                
                <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={isUploading}
                    className="flex-1 min-h-[44px] h-auto max-h-[120px] py-3 border-none bg-transparent shadow-none focus-visible:ring-0 text-[15px] font-medium resize-none placeholder:font-normal placeholder:text-muted-foreground/70"
                />
                
                <div className="pr-1 pb-1">
                    {newMessage.trim() || selectedFile ? (
                        <Button
                            onClick={handleSend}
                            size="icon"
                            className="h-[38px] w-[38px] rounded-full bg-indigo-600 hover:bg-indigo-700 text-white shadow-md transition-transform active:scale-95 shrink-0"
                            disabled={isUploading}
                        >
                            {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
                        </Button>
                    ) : (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-[38px] w-[38px] rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:hover:bg-indigo-900/50 transition-colors shrink-0"
                        >
                            <Mic className="size-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
