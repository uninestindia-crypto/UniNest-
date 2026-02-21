'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, MessageCircle, Send, Loader2, Maximize2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import MarketplaceCard from './MarketplaceCard';
import { OpportunityCard } from './WorkspaceDraftPanel';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    ui_actions?: any[];
};

export function GroqAssistant() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // Hide on the dedicated AI chat page to avoid redundancy
    if (pathname === '/ai/chat') return null;

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;
        const message = input;
        setInput('');

        const userMsg: Message = { role: 'user', content: message };
        setMessages(prev => [...prev, userMsg]);
        setIsLoading(true);

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: history, message }),
            });

            const data = await res.json();
            const assistantMsg: Message = {
                role: 'assistant',
                content: data.response || 'Sorry, try again.',
                ui_actions: data.ui_actions || [],
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch {
            setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please try again.' }]);
        } finally {
            setIsLoading(false);
        }
    };

    const renderCards = (msg: Message) => {
        if (!msg.ui_actions?.length) return null;
        return msg.ui_actions.map((action: any, idx: number) => {
            if (action.action === 'show_marketplace_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="space-y-1.5 mt-2">
                        {action.data.results.slice(0, 3).map((item: any) => (
                            <MarketplaceCard key={item.id} item={item} onSelect={() => { }} />
                        ))}
                    </div>
                );
            }
            if (action.action === 'show_opportunity_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="space-y-1.5 mt-2">
                        {action.data.results.slice(0, 3).map((opp: any) => (
                            <OpportunityCard key={opp.id} opportunity={opp} type={action.data.type} onSelect={() => { }} />
                        ))}
                    </div>
                );
            }
            return null;
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="icon"
                    className="h-14 w-14 rounded-full shadow-2xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all hover:scale-110 active:scale-95 group"
                >
                    <MessageCircle className="h-7 w-7 text-white group-hover:rotate-12 transition-transform" />
                    <div className="absolute -top-1 -right-1 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-green-500 border-2 border-background"></span>
                    </div>
                </Button>
            ) : (
                <Card className="w-[380px] h-[550px] shadow-2xl border-indigo-100 dark:border-indigo-900 flex flex-col animate-in slide-in-from-bottom-5 duration-300">
                    <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-xl py-3 px-4 flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/20">
                                <Bot className="h-4 w-4" />
                            </div>
                            <CardTitle className="text-base font-bold">UniNest AI</CardTitle>
                        </div>
                        <div className="flex items-center gap-1">
                            <Link href="/ai/chat">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-white hover:bg-white/20 h-7 w-7"
                                    title="Open full chat"
                                >
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 h-7 w-7"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden">
                        <ScrollArea className="h-full p-3" ref={scrollRef}>
                            <div className="space-y-3">
                                {messages.length === 0 && (
                                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-950/30 dark:to-violet-950/30 border border-indigo-100 dark:border-indigo-900 p-4 rounded-xl text-sm space-y-2">
                                        <p className="text-indigo-700 dark:text-indigo-300 font-medium">👋 Hey there!</p>
                                        <p className="text-indigo-600 dark:text-indigo-400 text-xs">
                                            I can help you find hostels, libraries, internships, and more. Try asking:
                                        </p>
                                        <div className="flex flex-wrap gap-1">
                                            {['Find hostels', 'Browse internships', 'Library near me'].map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => { setInput(q); }}
                                                    className="text-[10px] bg-white dark:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-full px-2 py-0.5 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 transition-colors"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i}>
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm shadow-sm",
                                                m.role === 'user'
                                                    ? "bg-gradient-to-r from-indigo-600 to-violet-600 text-white ml-auto rounded-tr-md"
                                                    : "bg-muted text-foreground mr-auto rounded-tl-md border"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap text-xs">{m.content}</p>
                                        </div>
                                        {m.role === 'assistant' && renderCards(m)}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="bg-muted text-foreground mr-auto rounded-2xl rounded-tl-md px-4 py-3 flex items-center gap-2 border shadow-sm max-w-[85%]">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                        <span className="text-xs text-muted-foreground">Searching...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-muted/30">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex w-full items-center space-x-2"
                        >
                            <Input
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 focus-visible:ring-indigo-500 rounded-lg bg-background text-xs h-9"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 h-9 w-9 shrink-0 shadow-md"
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
