'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OpportunityShareButton } from '@/components/workspace/opportunity-share';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import { Briefcase, Calendar, IndianRupee, FileText, MapPin, Users, ChevronLeft, Building2, Clock, Share2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Separator } from '@/components/ui/separator';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    stipend_period: string;
    deadline: string;
    location: string;
    image_url: string | null;
    details_pdf_url: string | null;
    description?: string | null; // Assuming description can be part of it
};

type Applicant = {
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}

type InternshipDetailClientProps = {
    internship: Internship;
    initialApplicants: Applicant[];
    showApplicants?: boolean;
}

export default function InternshipDetailClient({ internship, initialApplicants, showApplicants = true }: InternshipDetailClientProps) {
    const { user } = useAuth();
    const applyHref = useMemo(() => {
        const basePath = `/workspace/internships/${internship.id}/apply`;
        if (user) {
            return basePath;
        }
        const params = new URLSearchParams({ redirect: basePath });
        return `/login?${params.toString()}`;
    }, [internship.id, user]);
    const [hasApplied, setHasApplied] = useState(false); // Placeholder state

    // In a real app, this should be checked against the database
    // For now, we assume user hasn't applied unless they click.
    // A more robust solution would pass the application status from the server.

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
                    <span className="font-medium text-foreground truncate max-w-[200px] sm:max-w-md">{internship.company}</span>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* LEFT COLUMN: Content */}
                    <div className="lg:col-span-8 space-y-8">
                        {/* Company Banner/Header */}
                        <div className="relative w-full rounded-2xl overflow-hidden bg-muted/30 border shadow-sm group">
                            {internship.image_url ? (
                                <div className="relative h-48 w-full bg-muted">
                                    <Image
                                        src={internship.image_url}
                                        alt={internship.company}
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/40" />
                                </div>
                            ) : (
                                <div className="h-32 bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
                            )}

                            <div className="px-6 pb-6 pt-0 relative flex flex-col sm:flex-row items-end sm:items-center gap-4 -mt-10 sm:-mt-12">
                                <div className="size-24 rounded-xl border-4 border-background bg-white shadow-md flex items-center justify-center overflow-hidden shrink-0">
                                    {internship.image_url ? (
                                        <Image src={internship.image_url} alt={internship.company} width={80} height={80} className="object-contain" />
                                    ) : (
                                        <Building2 className="size-10 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="flex-1 space-y-1 mb-1">
                                    <h1 className="text-2xl sm:text-3xl font-bold font-headline">{internship.role}</h1>
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-lg font-medium text-muted-foreground">{internship.company}</span>
                                        <Badge variant="secondary" className="rounded-full">
                                            <MapPin className="size-3 mr-1" />
                                            {internship.location}
                                        </Badge>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between border-b pb-4">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Briefcase className="size-5 text-primary" />
                                    Job Description
                                </h2>
                            </div>

                            <div className="prose dark:prose-invert prose-slate max-w-none text-muted-foreground leading-relaxed">
                                <p className="whitespace-pre-wrap">{internship.description || 'No detailed description provided. Please refer to the official job description if available.'}</p>
                            </div>

                            <Card className="bg-muted/30 border-dashed">
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">Key Responsibilities (Expected)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className="grid sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                            <span>Collaborate with cross-functional teams</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                            <span>Assist in project development cycles</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                            <span>Conduct research and analysis</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                                            <span>Participate in code/design reviews</span>
                                        </li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </section>

                        {/* Applicants Section */}
                        {showApplicants && initialApplicants.length > 0 && (
                            <section className="space-y-4 pt-4">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <Users className="size-5 text-muted-foreground" />
                                    Recent Applicants <span className="text-muted-foreground font-normal text-sm">({initialApplicants.length})</span>
                                </h3>
                                <div className="flex -space-x-3 overflow-hidden p-1">
                                    {initialApplicants.slice(0, 8).map((applicant) => (
                                        <Avatar key={applicant.user_id} className="inline-block ring-2 ring-background size-10">
                                            <AvatarImage src={applicant.profiles?.avatar_url || ''} />
                                            <AvatarFallback>{applicant.profiles?.full_name?.[0]}</AvatarFallback>
                                        </Avatar>
                                    ))}
                                    {initialApplicants.length > 8 && (
                                        <div className="flex h-10 w-10 items-center justify-center rounded-full ring-2 ring-background bg-muted text-xs font-medium">
                                            +{initialApplicants.length - 8}
                                        </div>
                                    )}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sticky Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="sticky top-24 space-y-6">
                            {/* Primary Action Card */}
                            <Card className="shadow-lg border-primary/20 overflow-hidden relative">
                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-amber-500" />
                                <CardHeader className="pb-4">
                                    <CardTitle className="text-lg">Internship Details</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100 border border-emerald-100 dark:border-emerald-900/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-white dark:bg-emerald-900 shadow-sm text-emerald-600 dark:text-emerald-400">
                                                    <IndianRupee className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium opacity-80 uppercase tracking-wider">Stipend</span>
                                                    <span className="font-bold text-lg">
                                                        {internship.stipend > 0 ? `₹${internship.stipend.toLocaleString()}` : 'Unpaid'}
                                                        <span className="text-xs font-normal opacity-70 ml-1">/{internship.stipend_period}</span>
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-background shadow-sm text-muted-foreground">
                                                    <Calendar className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Apply By</span>
                                                    <span className="font-semibold">{format(new Date(internship.deadline), 'MMM d, yyyy')}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-md bg-background shadow-sm text-muted-foreground">
                                                    <MapPin className="size-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Location</span>
                                                    <span className="font-semibold">{internship.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    <div className="space-y-3">
                                        <Button
                                            size="lg"
                                            className="w-full text-base font-semibold shadow-md"
                                            asChild
                                        >
                                            <Link href={applyHref} className="flex items-center justify-center gap-2">
                                                Apply for Role
                                                <ArrowRight className="size-5" />
                                            </Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Secondary Actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {internship.details_pdf_url && (
                                    <Button variant="outline" className="w-full h-auto py-3 flex-col gap-1 border-dashed hover:border-solid" asChild>
                                        <a href={internship.details_pdf_url} target="_blank" rel="noopener noreferrer">
                                            <FileText className="size-5 text-muted-foreground" />
                                            <span className="text-xs">Job Desc.</span>
                                        </a>
                                    </Button>
                                )}
                                <OpportunityShareButton
                                    title={`${internship.role} at ${internship.company}`}
                                    description="Invite friends to apply or save this internship."
                                    sharePath={`/workspace/internships/${internship.id}`}
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
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
