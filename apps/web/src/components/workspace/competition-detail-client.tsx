
'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { OpportunityShareButton } from '@/components/workspace/opportunity-share';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, FileText, IndianRupee, Trophy, Users, Clock, Share2, ChevronLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

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
    const applyHref = useMemo(() => {
        const basePath = `/workspace/competitions/${competition.id}/apply`;
        if (user) {
            return basePath;
        }
        const params = new URLSearchParams({ redirect: basePath });
        return `/login?${params.toString()}`;
    }, [competition.id, user]);

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
        <div className="min-h-screen bg-background pb-20">
            {/* Header / Breadcrumb */}
            <div className="border-b bg-background/50 backdrop-blur-sm sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-2 text-sm text-muted-foreground">
                    <Link href="/workspace" className="hover:text-primary transition-colors flex items-center gap-1">
                        <ChevronLeft className="size-4" />
                        Workspace
                    </Link>
                    <span>/</span>
                    <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">{competition.title}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Main Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Banner Image */}
                        <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-sm border bg-muted/30 group">
                            {competition.image_url ? (
                                <Image
                                    src={competition.image_url}
                                    alt={competition.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-w-768px) 100vw, 800px"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/20">
                                    <Trophy className="size-20 text-indigo-300/50" />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />

                            <div className="absolute bottom-0 left-0 p-6 sm:p-8 w-full">
                                <Badge className="mb-3 bg-primary/90 hover:bg-primary backdrop-blur-md shadow-lg border-primary/20">
                                    Competition
                                </Badge>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold font-headline text-foreground tracking-tight mb-2 drop-shadow-sm">
                                    {competition.title}
                                </h1>
                            </div>
                        </div>

                        {/* Tabs Navigation */}
                        <Tabs defaultValue="overview" className="w-full">
                            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 rounded-xl overflow-x-auto">
                                <TabsTrigger value="overview" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Overview</TabsTrigger>
                                {showApplicants && (
                                    <TabsTrigger value="participants" className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
                                        Participants
                                        <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-[10px] bg-muted-foreground/10 text-muted-foreground">
                                            {applicants.length}
                                        </Badge>
                                    </TabsTrigger>
                                )}
                                <TabsTrigger value="results" disabled={!isCompetitionOver && !competition.winner_id} className="rounded-lg px-4 py-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">Results</TabsTrigger>
                            </TabsList>

                            {/* OVERVIEW CONTENT */}
                            <TabsContent value="overview" className="mt-8 space-y-8 animate-in fade-in-50 slide-in-from-bottom-2 duration-500">
                                <section className="space-y-4">
                                    <h2 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
                                        <FileText className="size-5 text-primary" />
                                        About this Competition
                                    </h2>
                                    <div className="prose dark:prose-invert prose-indigo max-w-none text-muted-foreground leading-relaxed">
                                        <p className="whitespace-pre-wrap">{competition.description}</p>
                                    </div>
                                </section>

                                {/* Generic Timeline or Rules Placeholder if not in DB, for visual completeness */}
                                <section className="grid sm:grid-cols-2 gap-4">
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <ShieldCheck className="size-4 text-green-500" />
                                                Evaluation Criteria
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                <li>Innovation & Creativity</li>
                                                <li>Technical Complexity</li>
                                                <li>Design & Usability</li>
                                                <li>Presentation Quality</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                    <Card className="bg-muted/30 border-dashed">
                                        <CardHeader>
                                            <CardTitle className="text-base flex items-center gap-2">
                                                <Trophy className="size-4 text-amber-500" />
                                                Rewards
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                <li>Cash Prize: ₹{competition.prize.toLocaleString()}</li>
                                                <li>Certificate of Excellence</li>
                                                <li>Featured on UniNest Platform</li>
                                                <li>Direct Internship Opportunity</li>
                                            </ul>
                                        </CardContent>
                                    </Card>
                                </section>
                            </TabsContent>

                            {/* PARTICIPANTS CONTENT */}
                            {showApplicants && (
                                <TabsContent value="participants" className="mt-8 animate-in fade-in-50 duration-500">
                                    <Card className="border-none shadow-none bg-background">
                                        <CardHeader className="px-0 pt-0">
                                            <CardTitle>Registered Participants</CardTitle>
                                            <CardDescription>Join {applicants.length} others in this challenge.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="px-0">
                                            {applicants.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                                    {applicants.map(applicant => (
                                                        <div key={applicant.user_id} className="group relative flex flex-col items-center p-4 rounded-xl border bg-card hover:shadow-md transition-all">
                                                            <Avatar className="size-16 mb-3 border-2 border-transparent group-hover:border-primary/20 transition-all">
                                                                <AvatarImage src={applicant.profiles?.avatar_url || ''} />
                                                                <AvatarFallback className="text-lg bg-primary/5 text-primary">
                                                                    {applicant.profiles?.full_name?.[0]}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <span className="font-medium text-sm text-center truncate w-full" title={applicant.profiles?.full_name}>
                                                                {applicant.profiles?.full_name}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="text-center py-12 border-2 border-dashed rounded-xl bg-muted/20">
                                                    <Users className="size-12 mx-auto text-muted-foreground/50 mb-3" />
                                                    <h3 className="font-medium">No participants yet</h3>
                                                    <p className="text-sm text-muted-foreground">Be the first to join the leaderboard!</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </TabsContent>
                            )}

                            {/* RESULTS CONTENT */}
                            <TabsContent value="results" className="mt-8 animate-in fade-in-50 duration-500">
                                {competition.winner ? (
                                    <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/30 dark:to-background animate-pulse-soft">
                                        <CardHeader className="text-center pb-2">
                                            <Trophy className="mx-auto size-16 text-amber-500 mb-2 drop-shadow-md" />
                                            <CardTitle className="text-3xl text-amber-700 dark:text-amber-500">Winner Announced!</CardTitle>
                                            <CardDescription>The results are in. Congratulations!</CardDescription>
                                        </CardHeader>
                                        <CardContent className="flex flex-col items-center pt-6 pb-8">
                                            <div className="relative">
                                                <div className="absolute -inset-4 bg-amber-200/50 dark:bg-amber-500/20 blur-xl rounded-full" />
                                                <Avatar className="size-32 border-4 border-amber-400 shadow-xl relative z-10">
                                                    <AvatarImage src={competition.winner.avatar_url} />
                                                    <AvatarFallback>{competition.winner.full_name[0]}</AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white p-2 rounded-full shadow-lg z-20 border-2 border-white dark:border-slate-900">
                                                    <Trophy className="size-5" />
                                                </div>
                                            </div>

                                            <h3 className="text-2xl font-bold mt-6">{competition.winner.full_name}</h3>
                                            <p className="text-muted-foreground font-medium">1st Place</p>

                                            {competition.result_description && (
                                                <div className="mt-8 max-w-lg text-center p-4 bg-white/50 dark:bg-black/20 rounded-xl border border-amber-100 dark:border-amber-900/50">
                                                    <p className="italic text-amber-900/80 dark:text-amber-200/80">"{competition.result_description}"</p>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center border rounded-xl bg-muted/50">
                                        <Clock className="size-12 text-muted-foreground/50 mb-4" />
                                        <h3 className="text-lg font-medium">Evaluation in Progress</h3>
                                        <p className="text-muted-foreground">Results will be declared shortly after the deadline.</p>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Primary Action Card */}
                            <Card className="border-primary/20 shadow-lg overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-purple-600" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="flex justify-between items-center text-lg">
                                        Registration
                                        {competition.entry_fee === 0 && <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-100">Free</Badge>}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-background shadow-sm text-primary">
                                                    <Trophy className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Prize Pool</span>
                                                    <span className="font-bold text-lg">₹{competition.prize.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-background shadow-sm text-primary">
                                                    <Calendar className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Deadline</span>
                                                    <span className="font-semibold">{format(new Date(competition.deadline), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {competition.entry_fee > 0 && (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-md bg-background shadow-sm text-primary">
                                                        <IndianRupee className="size-5" />
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Entry Fee</span>
                                                        <span className="font-semibold">₹{competition.entry_fee}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="w-full text-base font-semibold shadow-md bg-gradient-to-r from-primary to-primary-end hover:brightness-110 transition-all"
                                            disabled={hasApplied || isCompetitionOver}
                                            asChild
                                        >
                                            <Link href={applyHref} className="flex items-center justify-center gap-2">
                                                {hasApplied ? (
                                                    <>
                                                        <ShieldCheck className="size-5" />
                                                        Registered
                                                    </>
                                                ) : isCompetitionOver ? (
                                                    'Deadline Ended'
                                                ) : (
                                                    <>
                                                        Register Now
                                                        <ArrowRight className="size-5" />
                                                    </>
                                                )}
                                            </Link>
                                        </Button>
                                        <p className="text-xs text-center text-muted-foreground">
                                            {applicants.length} people have already registered
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Secondary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {competition.details_pdf_url && (
                                    <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 border-dashed hover:border-solid" asChild>
                                        <a href={competition.details_pdf_url} target="_blank" rel="noopener noreferrer">
                                            <FileText className="size-5 text-muted-foreground" />
                                            <span className="text-xs">Rulebook</span>
                                        </a>
                                    </Button>
                                )}
                                <OpportunityShareButton
                                    title={competition.title}
                                    description="Invite peers to join this competition."
                                    sharePath={`/workspace/competitions/${competition.id}`}
                                    buttonLabel="Share"
                                    buttonVariant="outline"
                                    buttonSize="default"
                                    className="w-full h-auto py-3 flex-col gap-1 border-dashed hover:border-solid hover:bg-muted/50"
                                    customContent={
                                        <>
                                            <Share2 className="size-5 text-muted-foreground" />
                                            <span className="text-xs">Share</span>
                                        </>
                                    }
                                />
                            </div>

                            {/* Trust Badge / Support Info */}
                            <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/50 flex items-start gap-3">
                                <div className="p-1.5 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full shrink-0">
                                    <ShieldCheck className="size-4" />
                                </div>
                                <div className="space-y-1">
                                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-100">Verified Opportunity</p>
                                    <p className="text-[10px] text-blue-700 dark:text-blue-300 leading-tight">
                                        This competition is verified by UniNest. Payments and rewards are secured.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
