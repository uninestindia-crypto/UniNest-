'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
    Plus,
    MessageSquare,
    Trash2,
    X,
    PanelLeftClose,
    PanelLeftOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export type ChatSession = {
    id: string;
    title: string;
    created_at: string;
    updated_at: string;
};

interface ChatSessionSidebarProps {
    sessions: ChatSession[];
    activeSessionId: string | null;
    onSelectSession: (id: string) => void;
    onNewChat: () => void;
    onDeleteSession: (id: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
}

export default function ChatSessionSidebar({
    sessions,
    activeSessionId,
    onSelectSession,
    onNewChat,
    onDeleteSession,
    isOpen,
    onToggle,
}: ChatSessionSidebarProps) {
    const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

    const handleDelete = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        if (confirmDeleteId === id) {
            onDeleteSession(id);
            setConfirmDeleteId(null);
        } else {
            setConfirmDeleteId(id);
        }
    };

    // Desktop collapsed state — just show toggle button
    if (!isOpen) {
        return (
            <div className="hidden lg:flex flex-col items-center py-4 px-1 border-r bg-background/50">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onToggle}
                    className="h-9 w-9 text-muted-foreground hover:text-foreground mb-2"
                    title="Open chat history"
                >
                    <PanelLeftOpen className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onNewChat}
                    className="h-9 w-9 text-muted-foreground hover:text-indigo-600"
                    title="New chat"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>
        );
    }

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between px-3 py-3 border-b shrink-0">
                <h2 className="text-sm font-semibold text-foreground">Chats</h2>
                <div className="flex items-center gap-0.5">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onNewChat}
                        className="h-8 w-8 text-muted-foreground hover:text-indigo-600"
                        title="New chat"
                    >
                        <Plus className="h-4 w-4" />
                    </Button>
                    {/* Desktop: collapse. Mobile: close overlay */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onToggle}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        title="Close"
                    >
                        <span className="lg:hidden"><X className="h-4 w-4" /></span>
                        <span className="hidden lg:inline-flex"><PanelLeftClose className="h-4 w-4" /></span>
                    </Button>
                </div>
            </div>

            {/* Session List */}
            <ScrollArea className="flex-1">
                <div className="p-2 space-y-0.5">
                    {sessions.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-10 text-center">
                            <MessageSquare className="h-8 w-8 text-muted-foreground/40 mb-2" />
                            <p className="text-xs text-muted-foreground">No conversations yet</p>
                            <p className="text-[10px] text-muted-foreground/60 mt-0.5">Start a new chat!</p>
                        </div>
                    )}
                    {sessions.map((session) => {
                        const isActive = session.id === activeSessionId;
                        return (
                            <button
                                key={session.id}
                                onClick={() => onSelectSession(session.id)}
                                className={cn(
                                    'group w-full flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-all duration-200',
                                    'hover:bg-muted/60',
                                    isActive
                                        ? 'bg-gradient-to-r from-indigo-600/10 to-violet-600/10 border border-indigo-500/20 shadow-sm'
                                        : 'border border-transparent'
                                )}
                            >
                                <MessageSquare
                                    className={cn(
                                        'h-4 w-4 shrink-0 transition-colors',
                                        isActive ? 'text-indigo-600' : 'text-muted-foreground/60'
                                    )}
                                />
                                <div className="flex-1 min-w-0">
                                    <p
                                        className={cn(
                                            'text-xs font-medium truncate transition-colors',
                                            isActive ? 'text-foreground' : 'text-muted-foreground'
                                        )}
                                    >
                                        {session.title}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground/50 mt-0.5">
                                        {timeAgo(session.updated_at)}
                                    </p>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => handleDelete(e, session.id)}
                                    className={cn(
                                        'h-7 w-7 shrink-0 transition-all',
                                        confirmDeleteId === session.id
                                            ? 'text-red-500 hover:text-red-600 hover:bg-red-500/10 opacity-100'
                                            : 'text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100'
                                    )}
                                    title={confirmDeleteId === session.id ? 'Click again to confirm' : 'Delete'}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            </button>
                        );
                    })}
                </div>
            </ScrollArea>
        </div>
    );

    return (
        <>
            {/* Mobile: overlay drawer */}
            <div className="lg:hidden">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
                    onClick={onToggle}
                />
                {/* Drawer */}
                <div className="fixed inset-y-0 left-0 z-50 w-72 bg-background/95 backdrop-blur-xl border-r shadow-2xl animate-in slide-in-from-left duration-300">
                    {sidebarContent}
                </div>
            </div>

            {/* Desktop: inline panel */}
            <div className="hidden lg:flex lg:flex-col w-64 border-r bg-background/50 backdrop-blur-sm shrink-0">
                {sidebarContent}
            </div>
        </>
    );
}
