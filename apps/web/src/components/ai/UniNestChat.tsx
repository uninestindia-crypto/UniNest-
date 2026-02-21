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
    ArrowRight,
    RotateCcw,
    Trash2,
    PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MarketplaceCard, { MarketplaceCardSkeleton } from './MarketplaceCard';
import WorkspaceDraftPanel, { OpportunityCard, OpportunityCardSkeleton } from './WorkspaceDraftPanel';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/hooks/use-auth';
import ChatSessionSidebar, { type ChatSession } from './ChatSessionSidebar';

type Message = {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    tool_calls?: any[];
    ui_actions?: any[];
    created_at?: string;
};

const quickActions = [
    { label: 'Find hostels', icon: Bed, prompt: 'Find me a hostel', color: 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800 hover:bg-orange-100' },
    { label: 'Browse libraries', icon: BookOpen, prompt: 'Show me available libraries', color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:bg-blue-100' },
    { label: 'Food mess options', icon: UtensilsCrossed, prompt: 'Search for food mess options', color: 'text-green-500 bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 hover:bg-green-100' },
    { label: 'Internships', icon: Briefcase, prompt: 'Show me internship opportunities', color: 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100' },
    { label: 'Competitions', icon: Trophy, prompt: 'Find competitions I can enter', color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 hover:bg-amber-100' },
    { label: 'Shop products', icon: ShoppingBag, prompt: 'Browse products in the marketplace', color: 'text-purple-500 bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800 hover:bg-purple-100' },
];

export default function UniNestChat() {
    const { user } = useAuth();
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

                if (data && data.length > 0) {
                    setSessions(data);
                    setActiveSessionId(data[0].id);
                } else {
                    // No sessions — we'll create one when user sends first message
                    setIsLoadingHistory(false);
                }
            } catch (err) {
                console.error('Error loading sessions:', err);
                setIsLoadingHistory(false);
            }
        };

        loadSessions();
    }, [user]);

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
        if (!user) return;
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

    // Update session title (auto-title from first user message)
    const updateSessionTitle = useCallback(async (sessionId: string, title: string) => {
        if (!user) return;
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
        if (!user) return;
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

        // If no active session, create one
        if (!sessionId) {
            const newId = await createSession('New Chat');
            if (!newId) return;
            sessionId = newId;
            setActiveSessionId(newId);
            setIsFirstMessage(true);
        }

        const userMsg: Message = {
            id: `user-${Date.now()}`,
            role: 'user',
            content: content.trim(),
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsLoading(true);

        // Save user message to DB
        saveMessage(userMsg, sessionId);

        // Auto-title: if this is the first message in the session, use it as title
        if (isFirstMessage) {
            updateSessionTitle(sessionId, content.trim());
            setIsFirstMessage(false);
        }

        // Touch session to update timestamp
        touchSession(sessionId);

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
                id: `assistant-${Date.now()}`,
                role: 'assistant',
                content: data.response || 'Sorry, I could not process that.',
                tool_calls: data.tool_calls || [],
                ui_actions: data.ui_actions || [],
            };

            // Check for draft panel action
            const draftAction = data.ui_actions?.find(
                (a: any) => a.action === 'show_draft_panel'
            );
            if (draftAction) {
                setActiveDraft(draftAction.data);
            }

            setMessages(prev => [...prev, assistantMsg]);
            // Save assistant message to DB
            saveMessage(assistantMsg, sessionId);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMsg: Message = {
                id: `error-${Date.now()}`,
                role: 'assistant',
                content: 'Sorry, something went wrong. Please try again.',
            };
            setMessages(prev => [...prev, errorMsg]);
            saveMessage(errorMsg, sessionId);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    }, [messages, isLoading, activeSessionId, saveMessage, createSession, isFirstMessage, updateSessionTitle, touchSession]);

    const handleQuickAction = (prompt: string) => {
        sendMessage(prompt);
    };

    const handleItemSelect = (item: any) => {
        sendMessage(`Tell me more about "${item.name}" (ID: ${item.id})`);
    };

    const handleOpportunitySelect = (opp: any) => {
        const title = opp.role || opp.title;
        sendMessage(`I'm interested in "${title}" (ID: ${opp.id}). Can you help me draft an application?`);
    };

    const handleDraftApprove = (draftText: string) => {
        if (!activeDraft) return;
        const oppId = activeDraft.opportunity?.id;
        const oppType = activeDraft.opportunity?.role ? 'internship' : 'competition';
        sendMessage(`I approve the draft. Please submit my application for opportunity ID ${oppId} (${oppType}). Here is my approved cover letter: ${draftText}`);
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
                    <div key={idx} className="grid gap-2 mt-3">
                        {action.data.results.map((item: any) => (
                            <MarketplaceCard key={item.id} item={item} onSelect={handleItemSelect} />
                        ))}
                    </div>
                );
            }

            if (action.action === 'show_opportunity_cards' && action.data?.results?.length > 0) {
                return (
                    <div key={idx} className="grid gap-2 mt-3">
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
                    <div key={idx} className="rounded-2xl border border-green-200 dark:border-green-800 bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-4 mt-3">
                        <div className="flex items-center gap-2 mb-2">
                            <ShoppingBag className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-semibold text-green-700 dark:text-green-300">Order Draft Ready</span>
                        </div>
                        <div className="text-xs space-y-1 text-foreground">
                            <p><strong>{order.item?.name}</strong></p>
                            <p>Quantity: {order.quantity} × ₹{order.unit_price?.toLocaleString('en-IN')}</p>
                            <p className="text-base font-bold">Total: ₹{order.total_amount?.toLocaleString('en-IN')}</p>
                        </div>
                        <Button className="w-full mt-3 bg-green-600 hover:bg-green-700 text-white text-sm shadow-md" size="sm">
                            <ShoppingBag className="h-4 w-4 mr-1.5" />
                            Confirm & Pay
                        </Button>
                        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
                            Payment is handled securely through Razorpay
                        </p>
                    </div>
                );
            }

            if (action.action === 'show_submission_confirmation') {
                return (
                    <div key={idx} className="rounded-2xl border border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 p-4 mt-3 text-center">
                        <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 mb-2">
                            <Sparkles className="h-5 w-5 text-indigo-600" />
                        </div>
                        <p className="text-sm font-semibold text-foreground">Application Submitted!</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Track your application in the Workspace section.
                        </p>
                    </div>
                );
            }

            return null;
        });
    };

    // Loading state while fetching history
    if (isLoadingHistory) {
        return (
            <div className="flex h-[calc(100vh-8rem)] w-full items-center justify-center">
                <div className="flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                    <p className="text-sm text-muted-foreground mt-2">Loading your conversations...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-[calc(100vh-8rem)] pb-20 lg:pb-0 w-full overflow-hidden">
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
            <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between border-b px-3 py-2.5 md:px-6 md:py-3 gap-2 shrink-0">
                    <div className="flex items-center gap-2 md:gap-3 min-w-0">
                        {/* Sidebar toggle (mobile + collapsed desktop) */}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsSidebarOpen(true)}
                            className={cn(
                                "h-8 w-8 text-muted-foreground hover:text-foreground shrink-0",
                                isSidebarOpen && "lg:hidden"
                            )}
                            title="Chat history"
                        >
                            <PanelLeftOpen className="h-4 w-4" />
                        </Button>
                        <div className="relative shrink-0">
                            <div className="flex h-9 w-9 md:h-10 md:w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25">
                                <Bot className="h-4 w-4 md:h-5 md:w-5 text-white" />
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500 border-2 border-background"></span>
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-sm md:text-base font-bold text-foreground truncate">UniNest AI</h1>
                            <p className="text-[10px] md:text-xs text-muted-foreground truncate">
                                Your campus co-pilot
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                        {messages.length > 0 && (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={handleNewChat}
                                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                                    title="New chat"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                </Button>
                                {user && (
                                    <div className="relative">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                                            className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                            title="Clear history"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </Button>
                                        {showDeleteConfirm && (
                                            <div className="absolute right-0 top-full mt-1 z-50 rounded-xl border bg-background shadow-xl p-3 w-56 animate-in fade-in slide-in-from-top-2 duration-200">
                                                <p className="text-xs text-foreground font-medium mb-2">
                                                    Delete this conversation?
                                                </p>
                                                <p className="text-[10px] text-muted-foreground mb-3">
                                                    This will permanently remove all messages in this chat.
                                                </p>
                                                <div className="flex gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        className="flex-1 text-xs h-7"
                                                        onClick={deleteHistory}
                                                    >
                                                        Delete all
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        className="flex-1 text-xs h-7"
                                                        onClick={() => setShowDeleteConfirm(false)}
                                                    >
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
                <ScrollArea className="flex-1 px-3 py-3 md:px-6 md:py-4 overflow-x-hidden" ref={scrollRef}>
                    <div className="space-y-4 max-w-4xl mx-auto">
                        {/* Welcome State */}
                        {messages.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-8 space-y-6 animate-in fade-in duration-500">
                                <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-2xl shadow-indigo-500/30">
                                    <Sparkles className="h-8 w-8 text-white" />
                                </div>
                                <div className="text-center space-y-1">
                                    <h2 className="text-xl font-bold text-foreground">Welcome to UniNest AI</h2>
                                    <p className="text-sm text-muted-foreground max-w-sm">
                                        I can help you find hostels, libraries, internships, and more. What would you like to do?
                                    </p>
                                </div>

                                {/* Quick Action Chips */}
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 md:gap-2 w-full max-w-lg">
                                    {quickActions.map((action) => {
                                        const Icon = action.icon;
                                        return (
                                            <button
                                                key={action.label}
                                                onClick={() => handleQuickAction(action.prompt)}
                                                className={cn(
                                                    'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-medium transition-all',
                                                    'hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
                                                    action.color
                                                )}
                                            >
                                                <Icon className="h-4 w-4 shrink-0" />
                                                {action.label}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Message Bubbles */}
                        {messages.map((msg) => ( /* eslint-disable-next-line */
                            <div key={msg.id} className={cn('flex gap-2 md:gap-3 min-w-0', msg.role === 'user' ? 'justify-end' : '')}>
                                {/* AI Avatar */}
                                {msg.role === 'assistant' && (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
                                        <Bot className="h-4 w-4 text-white" />
                                    </div>
                                )}

                                <div className={cn('max-w-[80%] md:max-w-[85%] space-y-0 min-w-0')}>
                                    {/* Text Bubble */}
                                    <div
                                        className={cn(
                                            'rounded-2xl px-3 py-2 md:px-4 md:py-2.5 text-[13px] md:text-sm leading-relaxed',
                                            msg.role === 'user'
                                                ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-tr-md shadow-md shadow-indigo-500/20'
                                                : 'bg-muted text-foreground rounded-tl-md border'
                                        )}
                                    >
                                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                                    </div>

                                    {/* Tool Result Cards */}
                                    {msg.role === 'assistant' && renderToolResults(msg)}
                                </div>

                                {/* User Avatar */}
                                {msg.role === 'user' && (
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-700 shadow-sm">
                                        <User className="h-4 w-4 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {/* Loading State (Skeleton) */}
                        {isLoading && (
                            <div className="flex gap-3">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm">
                                    <Bot className="h-4 w-4 text-white" />
                                </div>
                                <div className="space-y-3 w-full max-w-[85%]">
                                    <div className="rounded-2xl rounded-tl-md bg-muted border px-4 py-3 flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                                        <span className="text-xs text-muted-foreground">Searching UniNest...</span>
                                    </div>
                                    <div className="grid gap-2">
                                        <MarketplaceCardSkeleton />
                                        <MarketplaceCardSkeleton />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Active Draft Panel */}
                        {activeDraft && (
                            <div className="ml-11">
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
                <div className="border-t bg-background/80 backdrop-blur-sm px-3 py-2.5 md:px-6 md:py-3 shrink-0">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            sendMessage(input);
                        }}
                        className="flex items-center gap-2 max-w-4xl mx-auto"
                    >
                        <Input
                            ref={inputRef}
                            placeholder="Ask UniNest AI anything..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            disabled={isLoading}
                            className="flex-1 rounded-xl border-muted-foreground/20 bg-muted/50 focus-visible:ring-indigo-500 h-10 md:h-11 text-sm"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 shadow-lg shadow-indigo-500/25 shrink-0"
                            size="icon"
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </form>
                    <p className="text-[10px] text-muted-foreground text-center mt-1.5 max-w-4xl mx-auto">
                        UniNest AI may produce inaccurate information. Always verify critical details.
                    </p>
                </div>
            </div>
        </div>
    );
}
