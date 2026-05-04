'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sparkles, X, MessageCircle, Send, Loader2, Maximize2, Bot, MapPin, ShoppingBag, Briefcase, Heart, TrendingUp, MessageSquare, Edit3, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import MarketplaceCard from './MarketplaceCard';
import { OpportunityCard } from './WorkspaceDraftPanel';
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
                setTimeout(() => {
                    scrollContainer.scrollTop = scrollContainer.scrollHeight;
                }, 100);
            }
        }
    }, [messages, isLoading]);

    // Hide on the dedicated AI chat page to avoid redundancy
    if (pathname === '/ai/chat') return null;

    const handleHandover = async (item?: any) => {
        if (isHandingOver) return;

        if (messages.length === 0 || !user) {
            router.push('/ai/chat');
            return;
        }

        setIsHandingOver(true);
        try {
            const supabase = createClient();
            const firstMsg = messages.find(m => m.role === 'user')?.content || 'Handover Chat';
            const { data: session, error: sError } = await supabase
                .from('ai_chat_sessions')
                .insert({ user_id: user.id, title: firstMsg.substring(0, 50) })
                .select()
                .single();

            if (sError) throw sError;

            const messagesToSave = messages.map(m => ({
                user_id: user.id,
                session_id: session.id,
                role: m.role,
                content: m.content,
                ui_actions: m.ui_actions || null,
            }));

            const { error: mError } = await supabase.from('ai_chat_messages').insert(messagesToSave);
            if (mError) throw mError;

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
            const history = messages.map(m => ({ role: m.role, content: m.content }));
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
                    <div key={idx} className="space-y-2 mt-3">
                        {action.data.results.slice(0, 2).map((item: any) => (
                            <MarketplaceCard key={item.id} item={item} onSelect={() => handleHandover(item)} />
                        ))}
                        <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => handleHandover()}>
                            View all results in full chat
                        </Button>
                    </div>
                );
            }
            if (action.action === 'show_opportunity_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="space-y-2 mt-3">
                        {action.data.results.slice(0, 2).map((opp: any) => (
                            <OpportunityCard key={opp.id} opportunity={opp} type={action.data.type} onSelect={() => handleHandover(opp)} />
                        ))}
                    </div>
                );
            }
            if (action.action === 'show_community_impact_stats' && action.data) {
                return (
                    <Card key={idx} className="mt-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-900/50 overflow-hidden rounded-[16px] shadow-sm">
                        <CardContent className="p-3.5 space-y-3">
                            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-[13px]">
                                <Heart className="h-3.5 w-3.5 fill-current" />
                                Community Impact
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-amber-100/50 dark:border-amber-800/50">
                                    <div className="text-[10px] font-medium text-amber-600 mb-0.5">Total Raised</div>
                                    <div className="text-[15px] font-black text-foreground">₹{action.data.total_raised?.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/30 p-2.5 rounded-xl border border-amber-100/50 dark:border-amber-800/50">
                                    <div className="text-[10px] font-medium text-amber-600 mb-0.5">Students Helped</div>
                                    <div className="text-[15px] font-black text-foreground">{action.data.students_helped}+</div>
                                </div>
                            </div>
                            <Link href="/donate" className="block pt-1">
                                <Button className="w-full rounded-xl h-9 text-[12px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md border-none">
                                    Make a Donation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            }
            if (action.action === 'show_community_feed_results') {
                return (
                    <div key={idx} className="mt-3 space-y-2">
                        <div className="flex items-center gap-1.5 px-1 text-indigo-600 dark:text-indigo-400 font-bold text-xs mb-1">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Feed Results for "{action.data.query}"
                        </div>
                        {action.data.posts.map((post: any) => (
                            <Card key={post.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-border/60 shadow-sm rounded-xl">
                                <div className="flex justify-between items-start mb-1.5 text-[11px]">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{post.profiles?.full_name}</span>
                                    <span className="text-muted-foreground">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[12px] line-clamp-3 text-foreground/90">{post.content}</p>
                            </Card>
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
                <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full blur opacity-40 group-hover:opacity-75 transition duration-500 group-hover:duration-200"></div>
                    <Button
                        onClick={() => setIsOpen(true)}
                        size="icon"
                        className="relative h-14 w-14 rounded-full shadow-xl bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 transition-all hover:scale-110 active:scale-95"
                    >
                        <Bot className="h-7 w-7 text-white" />
                        <div className="absolute -top-1 -right-1 flex h-4 w-4">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-slate-900"></span>
                        </div>
                    </Button>
                </div>
            ) : (
                <Card className="w-[360px] md:w-[400px] h-[550px] md:h-[600px] shadow-2xl border-border/50 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl flex flex-col animate-in slide-in-from-bottom-5 duration-300 rounded-[24px] overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-t-[24px] py-4 px-5 flex flex-row items-center justify-between shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-white/20 backdrop-blur-md shadow-sm">
                                <Bot className="h-6 w-6" />
                            </div>
                            <div>
                                <CardTitle className="text-[16px] font-black tracking-tight">UniNest AI</CardTitle>
                                <p className="text-[11px] text-indigo-100 font-medium">Your campus assistant</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/10 p-1 rounded-xl backdrop-blur-sm">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-white hover:bg-white/20 h-8 w-8 rounded-lg"
                                title="Open full chat"
                                onClick={() => handleHandover()}
                                disabled={isHandingOver}
                            >
                                {isHandingOver ? <Loader2 className="h-4 w-4 animate-spin" /> : <Maximize2 className="h-4 w-4" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:bg-white/20 h-8 w-8 rounded-lg"
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/50 dark:bg-transparent relative">
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-transparent dark:from-indigo-900/10 pointer-events-none"></div>
                        <ScrollArea className="h-full px-4 py-4" ref={scrollRef}>
                            <div className="space-y-4 pb-2">
                                {messages.length === 0 && (
                                    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-indigo-100/50 dark:border-indigo-900/50 p-5 rounded-[20px] text-sm space-y-3 shadow-sm animate-in fade-in duration-500">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                                <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <p className="text-foreground font-bold text-[15px]">👋 Hey there!</p>
                                        </div>
                                        <p className="text-muted-foreground text-[13px] leading-relaxed">
                                            I can help you find hostels, libraries, internships, and more. Try asking:
                                        </p>
                                        <div className="flex flex-wrap gap-1.5 pt-1">
                                            {['Find hostels', 'Browse internships', 'Library near me'].map((q) => (
                                                <button
                                                    key={q}
                                                    onClick={() => { setInput(q); }}
                                                    className="text-[11px] bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 rounded-full px-3 py-1.5 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 transition-colors font-medium"
                                                >
                                                    {q}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {messages.map((m, i) => (
                                    <div key={i} className={cn('flex flex-col', m.role === 'user' ? 'items-end' : 'items-start')}>
                                        <div
                                            className={cn(
                                                "max-w-[85%] rounded-[20px] px-4 py-2.5 text-[13px] shadow-sm leading-relaxed",
                                                m.role === 'user'
                                                    ? "bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-tr-[4px]"
                                                    : "bg-white dark:bg-slate-900 text-foreground border border-border/50 rounded-tl-[4px]"
                                            )}
                                        >
                                            <p className="whitespace-pre-wrap">{m.content}</p>
                                        </div>
                                        {m.role === 'assistant' && renderCards(m)}
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="bg-white dark:bg-slate-900 text-foreground mr-auto rounded-[20px] rounded-tl-[4px] px-4 py-3 flex items-center gap-2 border border-border/50 shadow-sm max-w-[85%]">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                        <span className="text-[12px] font-medium text-muted-foreground">Thinking...</span>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>

                    <CardFooter className="p-4 border-t border-border/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl shrink-0 rounded-b-[24px]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                handleSend();
                            }}
                            className="flex w-full items-center gap-2 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full p-1 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/30 transition-all"
                        >
                            <Input
                                placeholder="Ask me anything..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 h-10 text-[13px] px-4 font-medium"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={isLoading || !input.trim()}
                                className="h-10 w-10 rounded-full bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-md transition-transform active:scale-95 disabled:opacity-50"
                            >
                                <Send className="h-4 w-4 text-white ml-0.5" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}
