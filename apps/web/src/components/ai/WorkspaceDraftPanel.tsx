'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Briefcase, Trophy, MapPin, IndianRupee, Calendar, CheckCircle2, Edit3, X, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

type OpportunityDraft = {
    opportunity: {
        id: number;
        role?: string;
        title?: string;
        company?: string;
        stipend?: number;
        location?: string;
        deadline?: string;
        description?: string;
        requirements?: string;
        prize?: number;
    };
    essay_draft: string;
    skills_list: string[];
    status: string;
};

export default function WorkspaceDraftPanel({
    draft,
    type,
    onApprove,
    onReject,
}: {
    draft: OpportunityDraft;
    type: 'internship' | 'competition';
    onApprove: (draftText: string) => void;
    onReject: () => void;
}) {
    const [editedDraft, setEditedDraft] = useState(draft.essay_draft);
    const [isEditing, setIsEditing] = useState(false);

    const title = draft.opportunity.role || draft.opportunity.title || 'Opportunity';
    const company = draft.opportunity.company || '';

    return (
        <div className="rounded-2xl border bg-gradient-to-br from-indigo-500/5 to-violet-500/5 border-indigo-200 dark:border-indigo-800 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-white">
                <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Application Draft</span>
                    <span className="ml-auto rounded-full bg-white/20 px-2 py-0.5 text-[10px]">
                        {draft.status === 'draft_pending_review' ? 'Pending Review' : draft.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                {/* Left Panel: Opportunity Details */}
                <div className="border-r border-indigo-100 dark:border-indigo-900 p-4">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                        Opportunity Details
                    </h3>

                    <div className="space-y-3">
                        <div>
                            <h4 className="font-bold text-foreground text-sm">{title}</h4>
                            {company && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                    {type === 'internship' ? (
                                        <Briefcase className="h-3 w-3" />
                                    ) : (
                                        <Trophy className="h-3 w-3" />
                                    )}
                                    {company}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                            {draft.opportunity.location && (
                                <span className="flex items-center gap-1 bg-background/80 rounded-full px-2 py-1 border">
                                    <MapPin className="h-3 w-3" />
                                    {draft.opportunity.location}
                                </span>
                            )}
                            {(draft.opportunity.stipend || draft.opportunity.prize) && (
                                <span className="flex items-center gap-1 bg-background/80 rounded-full px-2 py-1 border">
                                    <IndianRupee className="h-3 w-3" />
                                    ₹{(draft.opportunity.stipend || draft.opportunity.prize)?.toLocaleString('en-IN')}
                                </span>
                            )}
                            {draft.opportunity.deadline && (
                                <span className="flex items-center gap-1 bg-background/80 rounded-full px-2 py-1 border">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(draft.opportunity.deadline).toLocaleDateString('en-IN', {
                                        month: 'short',
                                        day: 'numeric',
                                    })}
                                </span>
                            )}
                        </div>

                        {/* Skills */}
                        <div>
                            <p className="text-xs font-semibold text-muted-foreground mb-1.5">Your Skills</p>
                            <div className="flex flex-wrap gap-1">
                                {draft.skills_list.map((skill, i) => (
                                    <span
                                        key={i}
                                        className="rounded-full bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2.5 py-0.5 text-[11px] font-medium"
                                    >
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel: Draft Editor */}
                <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            Your Draft
                        </h3>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setIsEditing(!isEditing)}
                            className="h-6 text-xs"
                        >
                            <Edit3 className="h-3 w-3 mr-1" />
                            {isEditing ? 'Preview' : 'Edit'}
                        </Button>
                    </div>

                    {isEditing ? (
                        <textarea
                            value={editedDraft}
                            onChange={(e) => setEditedDraft(e.target.value)}
                            className="w-full h-36 rounded-lg border bg-background p-3 text-xs text-foreground resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    ) : (
                        <ScrollArea className="h-36">
                            <p className="text-xs leading-relaxed text-foreground whitespace-pre-wrap">
                                {editedDraft}
                            </p>
                        </ScrollArea>
                    )}

                    {/* Action buttons */}
                    <div className="flex gap-2 mt-3">
                        <Button
                            onClick={() => onApprove(editedDraft)}
                            size="sm"
                            className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs shadow-md"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                            Approve & Submit
                        </Button>
                        <Button
                            onClick={onReject}
                            variant="outline"
                            size="sm"
                            className="text-xs"
                        >
                            <X className="h-3.5 w-3.5 mr-1" />
                            Discard
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

/**
 * Opportunity card for search results
 */
export function OpportunityCard({
    opportunity,
    type,
    onSelect,
}: {
    opportunity: any;
    type: 'internship' | 'competition';
    onSelect: (opp: any) => void;
}) {
    const isInternship = type === 'internship';
    const title = isInternship ? opportunity.role : opportunity.title;
    const subtitle = isInternship ? opportunity.company : `Prize: ₹${opportunity.prize?.toLocaleString('en-IN')}`;
    const Icon = isInternship ? Briefcase : Trophy;

    return (
        <button
            onClick={() => onSelect(opportunity)}
            className={cn(
                'group w-full text-left rounded-2xl border bg-gradient-to-br p-4 transition-all duration-300',
                'hover:shadow-lg hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98]',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                isInternship
                    ? 'from-blue-500/10 to-cyan-500/10 border-blue-200 dark:border-blue-800'
                    : 'from-amber-500/10 to-orange-500/10 border-amber-200 dark:border-amber-800'
            )}
        >
            <div className="flex gap-3">
                <div className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                    isInternship ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                )}>
                    <Icon className={cn('h-6 w-6', isInternship ? 'text-blue-500' : 'text-amber-500')} />
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>

                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        {opportunity.location && (
                            <span className="flex items-center gap-0.5">
                                <MapPin className="h-3 w-3" />
                                {opportunity.location}
                            </span>
                        )}
                        {(opportunity.stipend || opportunity.prize) && (
                            <span className="flex items-center gap-0.5 font-semibold text-foreground">
                                <IndianRupee className="h-3 w-3" />
                                {(opportunity.stipend || opportunity.prize)?.toLocaleString('en-IN')}
                            </span>
                        )}
                        {opportunity.deadline && (
                            <span className="flex items-center gap-0.5">
                                <Calendar className="h-3 w-3" />
                                {new Date(opportunity.deadline).toLocaleDateString('en-IN', {
                                    month: 'short',
                                    day: 'numeric',
                                })}
                            </span>
                        )}
                    </div>
                </div>
            </div>
        </button>
    );
}

export function OpportunityCardSkeleton() {
    return (
        <div className="w-full rounded-2xl border bg-gradient-to-br from-muted/50 to-muted/30 p-4 animate-pulse">
            <div className="flex gap-3">
                <div className="h-12 w-12 shrink-0 rounded-xl bg-muted" />
                <div className="flex-1 space-y-2">
                    <div className="h-4 w-3/4 rounded bg-muted" />
                    <div className="h-3 w-1/2 rounded bg-muted" />
                    <div className="h-3 w-2/3 rounded bg-muted mt-1" />
                </div>
            </div>
        </div>
    );
}
