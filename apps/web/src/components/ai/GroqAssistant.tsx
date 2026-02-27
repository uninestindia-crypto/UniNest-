'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, MessageCircle, Send, Loader2, Maximize2, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import MarketplaceCard from './MarketplaceCard';
import { OpportunityCard } from './WorkspaceDraftPanel';
import { Heart, Users, TrendingUp, MessageSquare, Edit3 } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { createClient } from '@/lib/supabase/client';
import { Badge } from '@/components/ui/badge';

type Message = {
    role: 'user' | 'assistant';
    content: string;
    ui_actions?: any[];
};

export function GroqAssistant() {
    const pathname = usePathname();
    const router = useRouter();
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isHandingOver, setIsHandingOver] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages]);

    // Hide on the dedicated AI chat page to avoid redundancy
    if (pathname === '/ai/chat') return null;

    const handleHandover = async (item?: any) => {
        if (isHandingOver) return;

        // If no messages or guest, just redirect
        if (messages.length === 0 || !user) {
            router.push('/ai/chat');
            return;
        }

        setIsHandingOver(true);
        try {
            const supabase = createClient();

            // 1. Create a session
            const firstMsg = messages.find(m => m.role === 'user')?.content || 'Handover Chat';
            const { data: session, error: sError } = await supabase
                .from('ai_chat_sessions')
                .insert({
                    user_id: user.id,
                    title: firstMsg.substring(0, 50),
                })
                .select()
                .single();

            if (sError) throw sError;

            // 2. Batch save messages
            const messagesToSave = messages.map(m => ({
                user_id: user.id,
                session_id: session.id,
                role: m.role,
                content: m.content,
                ui_actions: m.ui_actions || null,
            }));

            const { error: mError } = await supabase
                .from('ai_chat_messages')
                .insert(messagesToSave);

            if (mError) throw mError;

            // 3. Redirect
            router.push(`/ai/chat?session_id=${session.id}`);
            setIsOpen(false);
            setMessages([]);
        } catch (err) {
            console.error('Handover failed:', err);
            router.push('/ai/chat');
        } finally {
            setIsHandingOver(false);
        }
    };

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
                            <MarketplaceCard key={item.id} item={item} onSelect={() => handleHandover(item)} />
                        ))}
                    </div>
                );
            }
            if (action.action === 'show_opportunity_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="space-y-1.5 mt-2">
                        {action.data.results.slice(0, 3).map((opp: any) => (
                            <OpportunityCard key={opp.id} opportunity={opp} type={action.data.type} onSelect={() => handleHandover(opp)} />
                        ))}
                    </div>
                );
            }
            if (action.action === 'show_community_impact_stats') {
                return (
                    <Card key={idx} className="mt-2 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900 overflow-hidden">
                        <CardContent className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-bold text-xs">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                                Community Impact
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400">Raised</div>
                                    <div className="text-sm font-bold">₹{action.data.total_raised.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/50 dark:bg-black/20 p-2 rounded-lg border border-amber-100 dark:border-amber-800">
                                    <div className="text-[10px] text-amber-600 dark:text-amber-400">Students Helped</div>
                                    <div className="text-sm font-bold">{action.data.students_helped}+</div>
                                </div>
                            </div>
                            {action.data.top_donors?.length > 0 && (
                                <div className="pt-1 border-t border-amber-100 dark:border-amber-800">
                                    <div className="text-[9px] uppercase tracking-wider text-amber-600 dark:text-amber-400 font-semibold mb-1 flex items-center gap-1">
                                        <TrendingUp className="h-2.5 w-2.5" /> Top Donors
                                    </div>
                                    <div className="space-y-1">
                                        {action.data.top_donors.slice(0, 2).map((d: any, i: number) => (
                                            <div key={i} className="flex justify-between text-[10px]">
                                                <span>{d.name}</span>
                                                <span className="font-semibold text-amber-700 dark:text-amber-300">₹{d.amount}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Link href="/donate">
                                <Button size="sm" className="w-full h-7 text-[10px] mt-1 bg-amber-600 hover:bg-amber-700 text-white border-none">
                                    Donate Now
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            }
            if (action.action === 'show_community_feed_results') {
                return (
                    <div key={idx} className="mt-2 space-y-2">
                        <div className="flex items-center gap-1.5 px-1 text-indigo-600 dark:text-indigo-400 font-semibold text-xs mb-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Feed Results for "{action.data.query}"
                        </div>
                        {action.data.posts.map((post: any) => (
                            <Card key={post.id} className="p-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors border shadow-sm">
                                <div className="flex justify-between items-start mb-1 text-[10px]">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{post.profiles?.full_name}</span>
                                    <span className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[11px] line-clamp-3 text-foreground/90">{post.content}</p>
                            </Card>
                        ))}
                    </div>
                );
            }
            if (action.action === 'show_post_draft') {
                return (
                    <Card key={idx} className="mt-2 border-dashed border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20 overflow-hidden">
                        <CardContent className="p-3 space-y-2">
                            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 font-bold text-xs">
                                <Edit3 className="h-3.5 w-3.5" />
                                Community Post Draft
                            </div>
                            <div className="relative">
                                <div className="absolute top-2 right-2 flex gap-1">
                                    <Badge variant="outline" className="text-[8px] h-4 bg-white dark:bg-indigo-950">{action.data.tone}</Badge>
                                </div>
                                <div className="bg-white/80 dark:bg-black/40 p-3 rounded-lg border border-indigo-100 dark:border-indigo-800 italic text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                                    "{action.data.post_draft}"
                                </div>
                            </div>
                            <div className="flex gap-2 mt-1">
                                <Button
                                    size="sm"
                                    className="flex-1 h-7 text-[10px] bg-indigo-600 hover:bg-indigo-700 text-white"
                                    onClick={() => {
                                        window.open('/feed', '_blank');
                                    }}
                                >
                                    Go to Feed to Post
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
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
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-7 w-7"
                                title="Open full chat"
                                onClick={() => handleHandover()}
                                disabled={isHandingOver}
                            >
                                {isHandingOver ? <Loader2 className="h-3 w-3 animate-spin" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
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
