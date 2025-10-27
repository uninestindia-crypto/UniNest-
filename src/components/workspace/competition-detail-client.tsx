
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OpportunityShareButton } from '@/components/workspace/opportunity-share';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, IndianRupee, Trophy, Users } from 'lucide-react';

type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    deadline: string;
    entry_fee: number;
    image_url: string | null;
    details_pdf_url: string | null;
    winner_id?: string | null;
    result_description?: string | null;
    winner?: {
        full_name: string;
        avatar_url: string;
    } | null;
};

type Applicant = {
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}

type CompetitionDetailClientProps = {
    competition: Competition;
    initialApplicants: Applicant[];
    showApplicants?: boolean;
}

export default function CompetitionDetailClient({ competition: initialCompetition, initialApplicants, showApplicants = true }: CompetitionDetailClientProps) {
    const { user, supabase } = useAuth();
    const [applicants, setApplicants] = useState(initialApplicants);
    const [competition, setCompetition] = useState(initialCompetition);

    const hasApplied = applicants.some(app => app.user_id === user?.id);

    useEffect(() => {
        if (!supabase) return;
        const competitionChannel = supabase
            .channel(`competition-updates-${competition.id}`)
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'competitions', filter: `id=eq.${competition.id}` }, 
            async (payload) => {
                const updatedCompetition = payload.new as Competition;
                if (updatedCompetition.winner_id) {
                    const { data: winnerProfile } = await supabase
                        .from('profiles')
                        .select('full_name, avatar_url')
                        .eq('id', updatedCompetition.winner_id)
                        .single();
                    updatedCompetition.winner = winnerProfile;
                }
                setCompetition(updatedCompetition);
            })
            .subscribe();

        const entriesChannel = supabase
            .channel(`competition-entries-${competition.id}`)
            .on('postgres_changes', {
                event: 'INSERT',
                schema: 'public',
                table: 'competition_entries',
                filter: `competition_id=eq.${competition.id}`
            }, async (payload) => {
                const newEntry = payload.new as { user_id: string };
                const { data: profile } = await supabase.from('profiles').select('full_name, avatar_url').eq('id', newEntry.user_id).single();
                if (profile) {
                    setApplicants(prev => [...prev, { user_id: newEntry.user_id, profiles: profile }]);
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(competitionChannel);
            supabase.removeChannel(entriesChannel);
        }
    }, [supabase, competition.id]);
    
    const isCompetitionOver = new Date(competition.deadline) < new Date();

    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="space-y-4">
                {competition.image_url && (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-muted flex items-center justify-center">
                        <Image src={competition.image_url} alt={competition.title} fill className="object-contain" data-ai-hint="competition banner abstract" />
                    </div>
                )}
                <h1 className="text-4xl font-bold font-headline">{competition.title}</h1>
                <div className="flex flex-wrap items-center gap-4 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Trophy className="size-5 text-amber-500" />
                        <span>Prize Pool: <span className="font-bold text-foreground">₹{competition.prize.toLocaleString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-5" />
                        <span>Deadline: <span className="font-bold text-foreground">{format(new Date(competition.deadline), 'PPP')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <IndianRupee className="size-5" />
                        <span>Entry: {competition.entry_fee > 0 ? <span className="font-bold text-foreground">₹{competition.entry_fee}</span> : <Badge variant="secondary">Free</Badge>}</span>
                    </div>
                </div>
            </div>
            
            <Tabs defaultValue="details" className="w-full">
                <TabsList className={cn('grid w-full', showApplicants ? 'grid-cols-3' : 'grid-cols-2')}>
                    <TabsTrigger value="details">Details</TabsTrigger>
                    {showApplicants && (
                        <TabsTrigger value="applicants">Applicants ({applicants.length})</TabsTrigger>
                    )}
                    <TabsTrigger value="results" disabled={!isCompetitionOver || !competition.winner_id}>Results</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="mt-6">
                     <div className="prose dark:prose-invert max-w-none">
                        <p className="text-muted-foreground whitespace-pre-wrap">{competition.description}</p>
                    </div>
                     <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t mt-6">
                        <Button size="lg" className="flex-1" disabled={hasApplied || isCompetitionOver} asChild>
                           <Link href={`/workspace/competitions/${competition.id}/apply`}>
                             {hasApplied ? 'Applied' : isCompetitionOver ? 'Deadline Passed' : 'Apply Now'}
                           </Link>
                        </Button>
                        {competition.details_pdf_url && (
                            <Button size="lg" variant="outline" className="flex-1" asChild>
                                <a href={competition.details_pdf_url} target="_blank" rel="noopener noreferrer">
                                    <FileText className="mr-2"/>
                                    Rulebook (PDF)
                                </a>
                            </Button>
                        )}
                        <OpportunityShareButton
                            title={competition.title}
                            description="Invite peers to join this competition."
                            sharePath={`/workspace/competitions/${competition.id}`}
                            buttonLabel="Share"
                            buttonVariant="ghost"
                            buttonSize="lg"
                            className="flex-1"
                        />
                    </div>
                </TabsContent>
                {showApplicants && (
                    <TabsContent value="applicants" className="mt-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users />
                                    Current Applicants
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {applicants.length > 0 ? (
                                    <div className="flex flex-wrap gap-4">
                                        {applicants.map(applicant => (
                                            <div key={applicant.user_id} className="flex flex-col items-center gap-2">
                                                <Avatar>
                                                    <AvatarImage src={applicant.profiles?.avatar_url || ''} />
                                                    <AvatarFallback>{applicant.profiles?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <span className="text-xs text-center w-20 truncate">{applicant.profiles?.full_name}</span>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground">Be the first to apply!</p>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                )}
                <TabsContent value="results" className="mt-6">
                     <Card className="bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800">
                        <CardHeader className="text-center">
                            <Trophy className="mx-auto size-12 text-amber-500" />
                            <CardTitle className="text-3xl">Results Declared!</CardTitle>
                        </CardHeader>
                        <CardContent className="text-center space-y-4">
                            <h3 className="text-xl font-semibold">Winner</h3>
                            <div className="inline-flex flex-col items-center gap-2">
                                <Avatar className="size-20 border-4 border-amber-400">
                                    <AvatarImage src={competition.winner?.avatar_url} />
                                    <AvatarFallback>{competition.winner?.full_name[0]}</AvatarFallback>
                                </Avatar>
                                <p className="font-bold text-2xl">{competition.winner?.full_name}</p>
                            </div>
                            {competition.result_description && (
                                <div className="pt-4">
                                     <h3 className="text-xl font-semibold">Announcement</h3>
                                     <p className="text-muted-foreground">{competition.result_description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
