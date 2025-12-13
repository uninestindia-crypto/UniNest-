
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
                className={cn('flex items-end gap-3', !isModel && 'justify-end')}
              >
                {isModel && (
                    <Avatar className="h-8 w-8">
                        <div className="p-1 bg-background h-full w-full flex items-center justify-center rounded-full border">
                            <Logo className="size-5 text-primary" />
                        </div>
                    </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-xl p-3 md:max-w-2xl text-sm whitespace-pre-wrap',
                    isModel ? 'bg-muted' : 'primary-gradient text-primary-foreground'
                  )}
                >
                  <p>{message.content}</p>
                </div>
                 {!isModel && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={userAvatar} alt="Your avatar" />
                    <AvatarFallback>{userFallback}</AvatarFallback>
                  </Avatar>
                )}
              </div>
            );
          })}
          {isLoading && (
             <div className='flex items-end gap-3'>
                <Avatar className="h-8 w-8">
                     <div className="p-1 bg-background h-full w-full flex items-center justify-center rounded-full border">
                        <Logo className="size-5 text-primary" />
                    </div>
                </Avatar>
                <div className="max-w-md rounded-xl p-3 md:max-w-2xl bg-muted flex items-center gap-2">
                    <span className="size-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.3s]"></span>
                    <span className="size-2 bg-muted-foreground rounded-full animate-pulse [animation-delay:-0.15s]"></span>
                    <span className="size-2 bg-muted-foreground rounded-full animate-pulse"></span>
                </div>
             </div>
          )}
        </div>
      </ScrollArea>
      <div className="flex items-center gap-2 border-t p-4">
        <Input
          placeholder="Ask me anything..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={isLoading}
        />
        <Button onClick={handleSendMessage} disabled={isLoading || !newMessage.trim()}>
          <Send className="size-5" />
          <span className="sr-only">Send</span>
        </Button>
      </div>
    </div>
  );
}
