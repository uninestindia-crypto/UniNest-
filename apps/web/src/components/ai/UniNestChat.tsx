'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Send,
    Sparkles,
    Bed,
    BookOpen,
    Briefcase,
    Trophy,
    ShoppingBag,
    UtensilsCrossed,
    Bot,
    User,
    Loader2,
    RotateCcw,
    Trash2,
    PanelLeftOpen,
    Heart,
    TrendingUp,
    MapPin,
    Star,
    MessageSquare,
    Edit3,
    ExternalLink,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MarketplaceCard, { MarketplaceCardSkeleton } from './MarketplaceCard';
import WorkspaceDraftPanel, { OpportunityCard, OpportunityCardSkeleton } from './WorkspaceDraftPanel';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import ChatSessionSidebar, { type ChatSession } from './ChatSessionSidebar';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: any[];
    ui_actions?: any[];
    created_at?: string;
};

const quickActions = [
    { label: 'Find hostels', icon: Bed, prompt: 'Find me a hostel', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800' },
    { label: 'Browse libraries', icon: BookOpen, prompt: 'Show me available libraries', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800' },
    { label: 'Food mess options', icon: UtensilsCrossed, prompt: 'Search for food mess options', color: 'text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800' },
    { label: 'Internships', icon: Briefcase, prompt: 'Show me internship opportunities', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800' },
    { label: 'Competitions', icon: Trophy, prompt: 'Find competitions I can enter', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800' },
    { label: 'Shop products', icon: ShoppingBag, prompt: 'Browse products in the marketplace', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800' },
];

export default function UniNestChat() {
    const { user } = useAuth();
    const router = useRouter();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(true);
    const [activeDraft, setActiveDraft] = useState<any>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Session state
    const [sessions, setSessions] = useState<ChatSession[]>([]);
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isFirstMessage, setIsFirstMessage] = useState(false);
    const searchParams = useSearchParams();
    const urlSessionId = searchParams.get('session_id');

    // Load sessions on mount
    useEffect(() => {
        if (!user) {
            setIsLoadingHistory(false);
            return;
        }

        const loadSessions = async () => {
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('ai_chat_sessions')
                    .select('id, title, created_at, updated_at')
                    .eq('user_id', user.id)
                    .order('updated_at', { ascending: false });

                if (error) {
                    console.error('Failed to load sessions:', error);
                    setIsLoadingHistory(false);
                    return;
                }

                if (urlSessionId) {
                    setActiveSessionId(urlSessionId);
                    setSessions(data || []);
                } else if (data && data.length > 0) {
                    setSessions(data);
                    setActiveSessionId(data[0].id);
                } else {
                    setIsLoadingHistory(false);
                    setIsFirstMessage(true);
                }
            } catch (err) {
                console.error('Error loading sessions:', err);
                setIsLoadingHistory(false);
            }
        };

        loadSessions();
    }, [user, urlSessionId]);

    // Load messages when active session changes
    useEffect(() => {
        if (!user || !activeSessionId) {
            setIsLoadingHistory(false);
            return;
        }

        const loadMessages = async () => {
            setIsLoadingHistory(true);
            try {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('ai_chat_messages')
                    .select('id, role, content, tool_calls, ui_actions, created_at')
                    .eq('session_id', activeSessionId)
                    .order('created_at', { ascending: true })
                    .limit(100);

                if (error) {
                    console.error('Failed to load messages:', error);
                    return;
                }

                if (data && data.length > 0) {
                    const loadedMessages: Message[] = data.map((row) => ({
                        id: `db-${row.id}`,
                        role: row.role as 'user' | 'assistant',
                        content: row.content,
                        tool_calls: row.tool_calls || undefined,
                        ui_actions: row.ui_actions || undefined,
                        created_at: row.created_at,
                    }));
                    setMessages(loadedMessages);
                    setIsFirstMessage(false);
                } else {
                    setMessages([]);
                    setIsFirstMessage(true);
                }
            } catch (err) {
                console.error('Error loading messages:', err);
            } finally {
                setIsLoadingHistory(false);
            }
        };

        loadMessages();
    }, [user, activeSessionId]);

    // Save message to Supabase
    const saveMessage = useCallback(async (msg: Message, sessionId: string) => {
        if (!user || !sessionId || sessionId === 'guest-session') return;
        try {
            const supabase = createClient();
            await supabase.from('ai_chat_messages').insert({
                user_id: user.id,
                session_id: sessionId,
                role: msg.role,
                content: msg.content,
                tool_calls: msg.tool_calls || null,
                ui_actions: msg.ui_actions || null,
            });
        } catch (err) {
            console.error('Failed to save message:', err);
        }
    }, [user]);

    // Update session title
    const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
        if (!user || sessionId === 'guest-session') return;
        try {
            const supabase = createClient();
            const truncatedTitle = title.length > 50 ? title.substring(0, 47) + '...' : title;
            await supabase
                .from('ai_chat_sessions')
                .update({ title: truncatedTitle, updated_at: new Date().toISOString() })
                .eq('id', sessionId);

            setSessions(prev =>
                prev.map(s => s.id === sessionId ? { ...s, title: truncatedTitle, updated_at: new Date().toISOString() } : s)
            );
        } catch (err) {
            console.error('Failed to update session title:', err);
        }
    }, [user]);

    // Update session updated_at timestamp
    const touchSession = useCallback(async (sessionId: string) => {
        if (!user || sessionId === 'guest-session') return;
        try {
            const supabase = createClient();
            const now = new Date().toISOString();
            await supabase
                .from('ai_chat_sessions')
                .update({ updated_at: now })
                .eq('id', sessionId);

            setSessions(prev => {
                const updated = prev.map(s => s.id === sessionId ? { ...s, updated_at: now } : s);
                return updated.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
            });
        } catch (err) {
            console.error('Failed to touch session:', err);
        }
    }, [user]);

    // Create a new session
    const createSession = useCallback(async (title: string = 'New Chat'): Promise<string | null> => {
        if (!user) return null;
        try {
            const supabase = createClient();
            const { data, error } = await supabase
                .from('ai_chat_sessions')
                .insert({ user_id: user.id, title })
                .select('id, title, created_at, updated_at')
                .single();

            if (error) {
                console.error('Failed to create session:', error);
                return null;
            }

            setSessions(prev => [data, ...prev]);
            return data.id;
        } catch (err) {
            console.error('Error creating session:', err);
            return null;
        }
    }, [user]);

    // Delete a session
    const deleteSession = useCallback(async (sessionId: string) => {
        if (!user) return;
        try {
            const supabase = createClient();
            await supabase.from('ai_chat_sessions').delete().eq('id', sessionId);

            setSessions(prev => prev.filter(s => s.id !== sessionId));

            if (activeSessionId === sessionId) {
                const remaining = sessions.filter(s => s.id !== sessionId);
                if (remaining.length > 0) {
                    setActiveSessionId(remaining[0].id);
                } else {
                    setActiveSessionId(null);
                    setMessages([]);
                }
            }
        } catch (err) {
            console.error('Failed to delete session:', err);
        }
    }, [user, activeSessionId, sessions]);

    // Delete all chat history for current session
    const deleteHistory = useCallback(async () => {
        if (!user || !activeSessionId) return;
        try {
            const supabase = createClient();
            await supabase
                .from('ai_chat_messages')
                .delete()
                .eq('session_id', activeSessionId);
            setMessages([]);
            setActiveDraft(null);
            setShowDeleteConfirm(false);
            setIsFirstMessage(true);
        } catch (err) {
            console.error('Failed to delete history:', err);
        }
    }, [user, activeSessionId]);

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

    // Handle creating new chat
    const handleNewChat = useCallback(async () => {
        const newId = await createSession('New Chat');
        if (newId) {
            setActiveSessionId(newId);
            setMessages([]);
            setActiveDraft(null);
            setInput('');
            setIsFirstMessage(true);
            setIsSidebarOpen(false);
        }
    }, [createSession]);

    // Handle selecting a session
    const handleSelectSession = useCallback((id: string) => {
        setActiveSessionId(id);
        setActiveDraft(null);
        setInput('');
        setIsSidebarOpen(false);
    }, []);

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return;

        let sessionId = activeSessionId;
        const isGuest = !user;

        // If no active session, create one
        if (!sessionId) {
            if (isGuest) {
                sessionId = 'guest-session';
                setActiveSessionId('guest-session');
            } else {
                try {
                    const newId = await createSession('New Chat');
                    if (!newId) {
                        sessionId = 'guest-session';
                        setActiveSessionId('guest-session');
                    } else {
                        sessionId = newId;
                        setActiveSessionId(newId);
                        setIsFirstMessage(true);
                    }
                } catch (err) {
                    sessionId = 'guest-session';
                    setActiveSessionId('guest-session');
                }
            }
        }

        const userMsg: Message = {
            id: \`user-\${Date.now()}\`,
            role: 'user',
            content: content.trim(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        try { saveMessage(userMsg, sessionId); } catch {}

        if (isFirstMessage && sessionId !== 'guest-session') {
            try { updateSessionTitle(sessionId, content.trim()); } catch {}
            setIsFirstMessage(false);
        }

        if (sessionId !== 'guest-session') {
            try { touchSession(sessionId); } catch {}
        }

        try {
            const history = messages.map(m => ({
                role: m.role,
                content: m.content,
            }));

            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: history,
                    message: content.trim(),
                }),
            });

            const data = await res.json();

            const assistantMsg: Message = {
                id: \`assistant-\${Date.now()}\`,
                role: 'assistant',
                content: data.response || 'Sorry, I could not process that.',
                tool_calls: data.tool_calls || [],
                ui_actions: data.ui_actions || [],
            };

            const draftAction = data.ui_actions?.find(
                (a: any) => a.action === 'show_draft_panel'
            );
            if (draftAction) {
                setActiveDraft(draftAction.data);
            }

            setMessages(prev => [...prev, assistantMsg]);
            try { saveMessage(assistantMsg, sessionId); } catch {}
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: \`error-\${Date.now()}\`,
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
            };
            setMessages(prev => [...prev, errorMsg]);
            try { saveMessage(errorMsg, sessionId); } catch {}
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [messages, isLoading, activeSessionId, user, saveMessage, createSession, isFirstMessage, updateSessionTitle, touchSession]);

    const handleQuickAction = (prompt: string) => {
        sendMessage(prompt);
    };

    const handleItemSelect = (item: any) => {
        sendMessage(\`Tell me more about "\${item.name}" (ID: \${item.id})\`);
    };

    const handleOpportunitySelect = (opp: any) => {
        const title = opp.role || opp.title;
        sendMessage(\`I'm interested in "\${title}" (ID: \${opp.id}). Can you help me draft an application?\`);
    };

    const handleDraftApprove = (draftText: string) => {
        if (!activeDraft) return;
        const oppId = activeDraft.opportunity?.id;
        const oppType = activeDraft.opportunity?.role ? 'internship' : 'competition';
        sendMessage(\`I approve the draft. Please submit my application for opportunity ID \${oppId} (\${oppType}). Here is my approved cover letter: \${draftText}\`);
        setActiveDraft(null);
    };

    const handleDraftReject = () => {
        setActiveDraft(null);
        sendMessage('I want to discard this draft and start over.');
    };

    const renderToolResults = (msg: Message) => {
        if (!msg.ui_actions || msg.ui_actions.length === 0) return null;

        return msg.ui_actions.map((action: any, idx: number) => {
            if (action.action === 'show_marketplace_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="grid gap-3 mt-4">
                        {action.data.results.map((item: any) => (
                            <MarketplaceCard key={item.id} item={item} onSelect={handleItemSelect} />
                        ))}
                    </div>
                );
            }

            if (action.action === 'show_opportunity_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="grid gap-3 mt-4">
                        {action.data.results.map((opp: any) => (
                            <OpportunityCard
                                key={opp.id}
                                opportunity={opp}
                                type={action.data.type}
                                onSelect={handleOpportunitySelect}
                            />
                        ))}
                    </div>
                );
            }

            if (action.action === 'show_order_draft' && action.data?.order_summary) {
                const order = action.data.order_summary;
                return (
                    <div key={idx} className="rounded-[20px] border border-green-200 dark:border-green-900/50 bg-gradient-to-br from-green-500/10 to-emerald-500/5 p-5 mt-4 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                                <ShoppingBag className="h-4 w-4 text-green-600 dark:text-green-400" />
                            </div>
                            <span className="text-[15px] font-semibold text-green-700 dark:text-green-400">Order Draft Ready</span>
                        </div>
                        <div className="space-y-1.5 text-foreground px-1">
                            <p className="font-medium text-[15px]">{order.item?.name}</p>
                            <p className="text-[13px] text-muted-foreground">Quantity: {order.quantity} × ₹{order.unit_price?.toLocaleString('en-IN')}</p>
                            <p className="text-[18px] font-bold mt-2 text-foreground">Total: ₹{order.total_amount?.toLocaleString('en-IN')}</p>
                        </div>
                        <Button
                            className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-medium shadow-md transition-all hover:shadow-lg"
                            onClick={() => router.push(\`/marketplace/\${order.item?.id}\`)}
                        >
                            <ShoppingBag className="h-4 w-4 mr-2" />
                            Confirm & Pay
                        </Button>
                        <p className="text-[11px] text-muted-foreground text-center mt-3 font-medium">
                            Payment is handled securely through Razorpay
                        </p>
                    </div>
                );
            }

            if (action.action === 'show_item_detail' && action.data) {
                const item = action.data;
                return (
                    <Card key={idx} className="mt-4 overflow-hidden border-indigo-100 dark:border-indigo-900/50 rounded-[20px] shadow-sm bg-white/50 dark:bg-slate-900/50 backdrop-blur-md">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <h3 className="text-[16px] font-bold text-foreground leading-tight">{item.name}</h3>
                                    {item.category && (
                                        <Badge variant="secondary" className="mt-2 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-300 border-none rounded-full px-2.5 py-0.5">{item.category}</Badge>
                                    )}
                                </div>
                                <span className="text-[18px] font-bold text-indigo-600 dark:text-indigo-400 whitespace-nowrap bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-xl">
                                    ₹{item.price?.toLocaleString('en-IN')}
                                </span>
                            </div>
                            {item.location && (
                                <div className="flex items-center gap-1.5 text-[13px] text-muted-foreground font-medium">
                                    <MapPin className="h-4 w-4 text-indigo-400" />
                                    {item.location}
                                </div>
                            )}
                            {item.description && (
                                <p className="text-[14px] text-foreground/80 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-border/50">{item.description}</p>
                            )}
                            {item.amenities && item.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                    {(Array.isArray(item.amenities) ? item.amenities : []).slice(0, 6).map((a: string, i: number) => (
                                        <Badge key={i} variant="outline" className="rounded-full bg-white dark:bg-slate-800 border-border/50">{a}</Badge>
                                    ))}
                                </div>
                            )}
                            <Link href={\`/marketplace/\${item.id}\`} className="block pt-2">
                                <Button className="w-full rounded-xl h-10 font-medium" variant="outline">
                                    <ExternalLink className="h-4 w-4 mr-2" />
                                    View Full Details
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            }

            if (action.action === 'show_submission_preview' && action.data) {
                return (
                    <div key={idx} className="rounded-[20px] border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-500/10 to-violet-500/5 p-5 mt-4 shadow-sm backdrop-blur-md">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50">
                                <Briefcase className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <div>
                                <span className="block text-[15px] font-bold text-indigo-700 dark:text-indigo-300">Application Ready</span>
                                <Badge variant="secondary" className="mt-1 bg-white/60 dark:bg-slate-800/60 border-none text-[10px] uppercase tracking-wider">{action.data.status}</Badge>
                            </div>
                        </div>
                        <p className="text-[14px] text-foreground/80 leading-relaxed bg-white/50 dark:bg-slate-800/50 p-3 rounded-xl">{action.data.message}</p>
                    </div>
                );
            }

            if (action.action === 'show_submission_confirmation') {
                return (
                    <div key={idx} className="rounded-[20px] border border-indigo-200 dark:border-indigo-900/50 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-6 mt-4 text-center shadow-sm backdrop-blur-md relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl"></div>
                        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl"></div>
                        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 mb-4 relative z-10">
                            <Sparkles className="h-7 w-7" />
                        </div>
                        <p className="text-[18px] font-bold text-foreground relative z-10">Application Submitted!</p>
                        <p className="text-[14px] text-muted-foreground mt-2 relative z-10">
                            Track your application status in the Workspace section. Good luck!
                        </p>
                    </div>
                );
            }

            if (action.action === 'show_community_impact_stats' && action.data) {
                return (
                    <Card key={idx} className="mt-4 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-200/50 dark:border-amber-900/50 overflow-hidden rounded-[20px] shadow-sm">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold text-[14px]">
                                    <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                                        <Heart className="h-4 w-4 fill-current" />
                                    </div>
                                    Community Impact
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white/60 dark:bg-black/30 p-3.5 rounded-2xl border border-amber-100/50 dark:border-amber-800/50 shadow-sm">
                                    <div className="text-[12px] font-medium text-amber-600 dark:text-amber-500 mb-1">Total Raised</div>
                                    <div className="text-[20px] font-black text-foreground">₹{action.data.total_raised?.toLocaleString()}</div>
                                </div>
                                <div className="bg-white/60 dark:bg-black/30 p-3.5 rounded-2xl border border-amber-100/50 dark:border-amber-800/50 shadow-sm">
                                    <div className="text-[12px] font-medium text-amber-600 dark:text-amber-500 mb-1">Students Helped</div>
                                    <div className="text-[20px] font-black text-foreground">{action.data.students_helped}+</div>
                                </div>
                            </div>
                            {action.data.top_donors?.length > 0 && (
                                <div className="pt-3 border-t border-amber-200/50 dark:border-amber-800/50">
                                    <div className="text-[11px] uppercase tracking-wider text-amber-700 dark:text-amber-500 font-bold mb-2 flex items-center gap-1.5">
                                        <TrendingUp className="h-3.5 w-3.5" /> Top Donors This Month
                                    </div>
                                    <div className="space-y-2">
                                        {action.data.top_donors.slice(0, 3).map((d: any, i: number) => (
                                            <div key={i} className="flex justify-between items-center text-[13px] bg-white/40 dark:bg-black/20 p-2 rounded-lg">
                                                <span className="font-medium">{d.name}</span>
                                                <span className="font-bold text-amber-700 dark:text-amber-400">₹{d.amount?.toLocaleString()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <Link href="/donate" className="block pt-1">
                                <Button className="w-full rounded-xl h-11 text-[14px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md border-none">
                                    Make a Donation
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                );
            }

            if (action.action === 'show_community_feed_results' && action.data?.posts?.length > 0) {
                return (
                    <div key={idx} className="mt-4 space-y-3">
                        <div className="flex items-center gap-2 px-1 text-indigo-600 dark:text-indigo-400 font-bold text-[14px]">
                            <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                <MessageSquare className="h-4 w-4" />
                            </div>
                            Feed Results for &quot;{action.data.query}&quot;
                        </div>
                        {action.data.posts.map((post: any) => (
                            <Card key={post.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors border-border/60 shadow-sm rounded-[16px]">
                                <div className="flex justify-between items-start mb-2 text-[12px]">
                                    <span className="font-bold text-indigo-600 dark:text-indigo-400 text-[14px]">{post.profiles?.full_name}</span>
                                    <span className="text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">{new Date(post.created_at).toLocaleDateString()}</span>
                                </div>
                                <p className="text-[14px] line-clamp-3 text-foreground/90 leading-relaxed">{post.content}</p>
                            </Card>
                        ))}
                    </div>
                );
            }

            if (action.action === 'show_post_draft' && action.data) {
                return (
                    <Card key={idx} className="mt-4 border border-indigo-200 dark:border-indigo-800/50 bg-gradient-to-br from-indigo-50/50 to-white dark:from-slate-900 dark:to-slate-900/50 overflow-hidden rounded-[20px] shadow-sm">
                        <CardContent className="p-5 space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 font-bold text-[14px]">
                                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                                        <Edit3 className="h-4 w-4" />
                                    </div>
                                    Post Draft Ready
                                </div>
                                <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300 border-none">{action.data.tone} tone</Badge>
                            </div>
                            <div className="bg-white dark:bg-black/40 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800/50 shadow-inner">
                                <p className="italic text-[14px] leading-relaxed text-slate-700 dark:text-slate-300">
                                    &quot;{action.data.post_draft}&quot;
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                );
            }

            return null;
        });
    };

    if (isLoadingHistory) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-slate-50/50 dark:bg-background">
                <div className="flex flex-col items-center">
                    <div className="relative">
                        <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full"></div>
                        <div className="h-16 w-16 bg-white dark:bg-slate-900 rounded-2xl shadow-xl flex items-center justify-center relative border border-border/50">
                            <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                        </div>
                    </div>
                    <p className="text-[15px] font-medium text-foreground mt-6">Loading conversations...</p>
                    <p className="text-[13px] text-muted-foreground mt-1">Connecting to your AI campus assistant</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] pb-20 lg:pb-0 w-full overflow-hidden bg-slate-50 dark:bg-background">
            {/* Session Sidebar */}
            <ChatSessionSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={handleSelectSession}
                onNewChat={handleNewChat}
                onDeleteSession={deleteSession}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* Chat Panel */}
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden relative">
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-400/5 dark:bg-indigo-600/5 blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-400/5 dark:bg-violet-600/5 blur-3xl pointer-events-none"></div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 gap-2 shrink-0 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-border/50 z-10 sticky top-0">
                    <div className="flex items-center gap-3 md:gap-4 min-w-0">
                        {/* Sidebar toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className={cn(
                                "h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0",
                                isSidebarOpen && "lg:hidden"
                            )}
                            title="Chat history"
                        >
                            <PanelLeftOpen className="h-5 w-5" />
                        </Button>
                        <div className="relative shrink-0 group">
                            <div className="flex h-10 w-10 md:h-11 md:w-11 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
                                <Bot className="h-5 w-5 md:h-6 md:w-6 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white dark:border-slate-950"></span>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-[16px] md:text-[18px] font-black text-foreground truncate tracking-tight">UniNest AI Assistant</h1>
                            <p className="text-[12px] md:text-[13px] text-muted-foreground font-medium truncate flex items-center gap-1.5">
                                <Sparkles className="h-3 w-3 text-indigo-500" />
                                Your intelligent campus co-pilot
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        {messages.length > 0 && (
                            <>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={handleNewChat}
                                    className="h-9 w-9 border-border/50 bg-white/50 dark:bg-slate-900/50 text-foreground hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-900/30 rounded-xl"
                                    title="New chat"
                                >
                                    <RotateCcw className="h-4 w-4" />
                                </Button>
                                {user && (
                                    <div className="relative">
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                            className="h-9 w-9 border-border/50 bg-white/50 dark:bg-slate-900/50 text-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 rounded-xl"
                                            title="Clear history"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        {showDeleteConfirm && (
                                            <div className="absolute right-0 top-full mt-2 z-50 rounded-[16px] border border-border/50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl p-4 w-64 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <div className="flex items-center gap-2 text-red-500 font-bold text-[14px] mb-2">
                                                    <Trash2 className="h-4 w-4" /> Delete Conversation
                                                </div>
                                                <p className="text-[12px] text-muted-foreground mb-4 leading-relaxed">
                                                    This will permanently remove all messages in this chat. This action cannot be undone.
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="destructive" className="flex-1 rounded-lg font-bold shadow-sm" onClick={deleteHistory}>
                                                        Delete
                                                    </Button>
                                                    <Button size="sm" variant="outline" className="flex-1 rounded-lg font-bold" onClick={() => setShowDeleteConfirm(false)}>
                                                        Cancel
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 px-4 py-6 md:px-8 md:py-8 overflow-x-hidden relative z-0" ref={scrollRef}>
                    <div className="space-y-6 max-w-3xl mx-auto pb-4">
                        {messages.length === 0 && (
                            <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700 pt-10 md:pt-20">
                                <div className="text-center mb-10 mx-auto max-w-lg">
                                    <div className="relative mx-auto w-24 h-24 mb-6">
                                        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                                        <div className="relative h-24 w-24 rounded-[32px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/30 flex items-center justify-center transform rotate-3">
                                            <Sparkles className="h-10 w-10 text-white absolute -top-3 -right-3" />
                                            <Bot className="h-12 w-12 text-white" />
                                        </div>
                                    </div>
                                    <h2 className="text-[28px] md:text-[36px] font-black text-foreground mb-3 tracking-tight leading-tight">
                                        How can I help you <br className="hidden md:block"/> succeed today?
                                    </h2>
                                    <p className="text-[15px] md:text-[16px] text-muted-foreground max-w-sm mx-auto leading-relaxed">
                                        I am your smart campus assistant. Let's find you the best housing, career opportunities, and resources.
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                                    {quickActions.map(action => (
                                        <button
                                            key={action.label}
                                            onClick={() => handleQuickAction(action.prompt)}
                                            className="group flex items-center gap-4 p-4 bg-white/60 dark:bg-slate-900/60 hover:bg-white dark:hover:bg-slate-800 border border-border/50 hover:border-indigo-200 dark:hover:border-indigo-800 rounded-[20px] transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 text-left backdrop-blur-sm"
                                        >
                                            <div className={cn("p-3 rounded-2xl transition-transform group-hover:scale-110", action.color)}>
                                                <action.icon className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-[15px] font-bold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{action.label}</p>
                                                <p className="text-[12px] text-muted-foreground font-medium mt-0.5">{action.prompt}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Message Bubbles */}
                        {messages.map((msg) => (
                            <div key={msg.id} className={cn('flex gap-3 md:gap-4 min-w-0 group', msg.role === 'user' ? 'justify-end' : '')}>
                                {/* AI Avatar */}
                                {msg.role === 'assistant' && (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 mt-1">
                                        <Bot className="h-5 w-5 text-white" />
                                    </div>
                                )}

                                <div className={cn('max-w-[85%] md:max-w-[80%] space-y-2 min-w-0')}>
                                    {/* Text Bubble */}
                                    <div
                                        className={cn(
                                            'relative px-5 py-3.5 text-[14px] md:text-[15px] leading-relaxed shadow-sm max-w-full inline-block',
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white rounded-[24px] rounded-tr-[6px] shadow-indigo-500/20'
                                                : 'bg-white dark:bg-slate-900/80 text-foreground rounded-[24px] rounded-tl-[6px] border border-indigo-100/50 dark:border-indigo-900/50 shadow-sm backdrop-blur-md'
                                        )}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>

                                    {/* Tool Result Cards */}
                                    {msg.role === 'assistant' && renderToolResults(msg)}
                                </div>

                                {/* User Avatar */}
                                {msg.role === 'user' && (
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-800 dark:bg-slate-700 shadow-md mt-1">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading State */}
                        {isLoading && (
                            <div className="flex gap-3 md:gap-4 animate-in fade-in duration-300">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] bg-gradient-to-br from-indigo-600 to-violet-600 shadow-md shadow-indigo-500/20 mt-1">
                                    <Bot className="h-5 w-5 text-white" />
                                </div>
                                <div className="space-y-3 w-full max-w-[80%]">
                                    <div className="bg-white dark:bg-slate-900/80 text-foreground rounded-[24px] rounded-tl-[6px] border border-indigo-100/50 dark:border-indigo-900/50 px-5 py-3.5 flex items-center gap-3 shadow-sm inline-flex">
                                        <div className="flex gap-1.5 items-center">
                                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                                            <span className="w-2 h-2 rounded-full bg-indigo-600 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                                        </div>
                                        <span className="text-[13px] font-medium text-muted-foreground ml-1">Thinking...</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Draft Panel */}
                        {activeDraft && (
                            <div className="ml-[3.25rem] md:ml-[3.5rem] mt-2 animate-in slide-in-from-bottom-2 duration-300">
                                <WorkspaceDraftPanel
                                    draft={activeDraft}
                                    type={activeDraft.opportunity?.role ? 'internship' : 'competition'}
                                    onApprove={handleDraftApprove}
                                    onReject={handleDraftReject}
                                />
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Bar */}
                <div className="bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl px-4 py-4 md:px-8 md:py-6 shrink-0 border-t border-border/50 z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] dark:shadow-none">
                    <div className="max-w-3xl mx-auto flex flex-col gap-3">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage(input);
                            }}
                            className="relative flex items-center bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-full p-1.5 shadow-inner focus-within:ring-2 focus-within:ring-indigo-500/30 focus-within:border-indigo-500/50 transition-all duration-300"
                        >
                            <div className="pl-3 pr-2 hidden sm:flex text-indigo-500 pointer-events-none">
                                <Sparkles className="h-5 w-5" />
                            </div>
                            <Input
                                ref={inputRef}
                                placeholder="Ask anything... (e.g. Find me a PG under ₹10,000)"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                disabled={isLoading}
                                className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 h-12 text-[15px] md:text-[16px] px-3 font-medium placeholder:font-normal placeholder:text-slate-400"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim()}
                                className="h-12 w-12 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-md shrink-0 transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100 ml-1"
                                size="icon"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                                ) : (
                                    <Send className="h-5 w-5 text-white ml-1" />
                                )}
                            </Button>
                        </form>
                        <div className="text-center">
                            <p className="text-[11px] font-medium text-muted-foreground/70">
                                UniNest AI can make mistakes. Consider verifying important information.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
