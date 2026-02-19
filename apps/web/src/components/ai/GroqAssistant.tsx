'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, MessageCircle, Send, Loader2 } from 'lucide-react';
import { useAi } from '@/hooks/use-ai';
import { cn } from '@/lib/utils';

export function GroqAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const { messages, chat, isLoading } = useAi();
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const message = input;
        setInput('');
        await chat(message, 'You are the Uninest Smart Assistant. You help students find hostels, products, and navigate the platform. Be friendly, concise, and helpful.');
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl bg-indigo-600 hover:bg-indigo-700 transition-all hover:scale-110 active:scale-95 group"
                >
                    <MessageCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500"></span>
                    </div>
                </Button>
            ) : (
                <Card className="w-[380px] h-[550px] shadow-2xl border-indigo-100 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-xl py-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5" />
                            <CardTitle className="text-lg font-bold">Uninest AI</CardTitle>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsOpen(false)}
                            className="text-white hover:bg-white/20 h-8 w-8"
                        >
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-4" ref={scrollRef}>
                            <div className="space-y-4">
                                {messages.length === 0 && (
                                    <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-indigo-700 text-sm italic">
                                        👋 Hey! How can I help you today? I can help you find hostels, compare prices, or explain how Uninest works!
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm",
                                            m.role === 'user'
                                                ? "bg-indigo-600 text-white ml-auto rounded-tr-none"
                                                : "bg-muted text-foreground mr-auto rounded-tl-none border"
                                        )}
                                    >
                                        {m.content}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="bg-muted text-foreground mr-auto rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 border shadow-sm max-w-[85%]">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                        <span className="text-xs text-muted-foreground">Thinking...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 border-t bg-muted/30">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                placeholder="Type a message..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                className="flex-1 focus-visible:ring-indigo-500 rounded-lg bg-background"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 h-9 w-9 shrink-0 shadow-md"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
