
'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chat-flow';
import type { ChatInput } from '@/ai/flows/chat-schema';
import { useAuth } from '@/hooks/use-auth';
import { Logo } from '../icons';

type Message = {
  role: 'user' | 'model';
  content: string;
};

export default function AIChatView() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('div');
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === '' || isLoading) return;

    const userMessage: Message = { role: 'user', content: newMessage };
    setMessages(prev => [...prev, userMessage]);
    setNewMessage('');
    setIsLoading(true);

    try {
      const chatHistory = messages.map(m => ({
        role: m.role,
        content: [{ text: m.content }]
      }));

      const chatInput: ChatInput = {
        history: chatHistory,
        message: newMessage,
      };

      const aiResponse = await chat(chatInput);

      const modelMessage: Message = { role: 'model', content: aiResponse };
      setMessages(prev => [...prev, modelMessage]);

    } catch (error) {
      console.error("Error calling AI chat flow:", error);
      const errorMessage: Message = { role: 'model', content: "Sorry, I encountered an error. Please try again." };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const userAvatar = user?.user_metadata?.avatar_url || '';
  const userFallback = user?.email?.[0].toUpperCase() || 'U';

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-8rem)] max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-4 border-b p-4">
        <Avatar className="h-10 w-10 border-2 border-primary">
          <div className="p-1 bg-background h-full w-full flex items-center justify-center">
            <Logo className="size-6 text-primary" />
          </div>
        </Avatar>
        <div>
          <h2 className="text-lg font-semibold">UniNest AI Assistant</h2>
          <p className="text-sm text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Online
          </p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
        <div className="space-y-6">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground p-8">
              <Sparkles className="mx-auto size-12 mb-4 text-primary" />
              <h3 className="text-xl font-semibold text-foreground">Welcome to UniNest AI</h3>
              <p>Ask me anything about your campus, studies, or just say hello!</p>
            </div>
          )}
          {messages.map((message, index) => {
            const isModel = message.role === 'model';
            return (
              <div
                key={index}
                className={cn('flex flex-col gap-1 w-full max-w-[85%] md:max-w-[75%]', !isModel ? 'ml-auto items-end' : 'mr-auto items-start')}
              >
                <div className="flex items-end gap-2 w-full">
                  {isModel && (
                    <Avatar className="h-6 w-6 shrink-0 mb-1 border border-border/30">
                      <div className="p-0.5 bg-background h-full w-full flex items-center justify-center rounded-full">
                        <Logo className="size-3.5 text-primary" />
                      </div>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'relative flex flex-col px-4 py-2.5 text-[15px] shadow-sm',
                      isModel
                        ? 'bg-muted/80 border border-border/30 text-foreground rounded-2xl rounded-bl-sm mr-auto'
                        : 'bg-primary text-primary-foreground rounded-2xl rounded-br-sm ml-auto'
                    )}
                  >
                    {isModel && (
                      <span className="text-[11px] font-semibold text-primary/80 mb-0.5">Assistant</span>
                    )}
                    <span className="leading-relaxed whitespace-pre-wrap break-words">{message.content}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {isLoading && (
            <div className='flex flex-col gap-1 w-full max-w-[85%] mr-auto items-start'>
              <div className="flex items-end gap-2 w-full">
                <Avatar className="h-6 w-6 shrink-0 mb-1 border border-border/30">
                  <div className="p-0.5 bg-background h-full w-full flex items-center justify-center rounded-full">
                    <Logo className="size-3.5 text-primary" />
                  </div>
                </Avatar>
                <div className="bg-muted/80 border border-border/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-1.5 min-w-[60px]">
                  <span className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.3s]"></span>
                  <span className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:-0.15s]"></span>
                  <span className="size-1.5 bg-primary/40 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="p-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t border-border/50">
        <div className="max-w-3xl mx-auto w-full relative group">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            disabled={isLoading}
            className="h-12 w-full rounded-2xl pl-4 pr-12 bg-muted/50 border-border/50 focus-visible:bg-background focus-visible:ring-1 focus-visible:ring-primary/50 shadow-none transition-all"
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !newMessage.trim()}
            size="icon"
            className="absolute right-1.5 top-1.5 size-9 rounded-xl bg-primary shadow-sm hover:scale-105 transition-all active:scale-95"
          >
            {isLoading ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4 ml-0.5" />}
            <span className="sr-only">Send</span>
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 font-medium tracking-wide">
          AI can make mistakes. Verify important information.
        </p>
      </div>
    </div>
  );
}
