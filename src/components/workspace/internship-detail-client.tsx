'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OpportunityShareButton } from '@/components/workspace/opportunity-share';
import { useAuth } from '@/hooks/use-auth';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { format } from 'date-fns';
import { Briefcase, Calendar, IndianRupee, FileText, MapPin, Users } from 'lucide-react';

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
    const [hasApplied, setHasApplied] = useState(false); // Placeholder state

    // In a real app, this should be checked against the database
    // For now, we assume user hasn't applied unless they click.
    // A more robust solution would pass the application status from the server.
    
    return (
        <div className="max-w-4xl mx-auto p-4 space-y-8">
            <div className="space-y-4">
                {internship.image_url && (
                    <div className="relative h-64 w-full rounded-2xl overflow-hidden shadow-lg bg-muted flex items-center justify-center">
                        <Image src={internship.image_url} alt={internship.company} fill className="object-contain" data-ai-hint="company banner office building" />
                    </div>
                )}
                 <div className="space-y-2">
                    <Badge variant="outline">{internship.company}</Badge>
                    <h1 className="text-4xl font-bold font-headline">{internship.role}</h1>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <IndianRupee className="size-5" />
                        <span>{internship.stipend > 0 ? <span className="font-bold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipend_period}</span> : <Badge variant="secondary">Unpaid</Badge>}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Calendar className="size-5" />
                        <span>Apply by <span className="font-bold text-foreground">{format(new Date(internship.deadline), 'PPP')}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="size-5" />
                        <span className="font-bold text-foreground">{internship.location}</span>
                    </div>
                </div>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <p className="text-muted-foreground whitespace-pre-wrap">{internship.description || 'No detailed description provided. Please refer to the official job description if available.'}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t">
                <Button size="lg" className="flex-1" asChild>
                    <Link href={`/workspace/internships/${internship.id}/apply`}>
                        <Briefcase className="mr-2"/>
                        Apply Now
                    </Link>
                </Button>
                {internship.details_pdf_url && (
                    <Button size="lg" variant="outline" className="flex-1" asChild>
                        <a href={internship.details_pdf_url} target="_blank" rel="noopener noreferrer">
                            <FileText className="mr-2"/>
                            Job Description (PDF)
                        </a>
                    </Button>
                )}
                <OpportunityShareButton
                    title={`${internship.role} at ${internship.company}`}
                    description="Invite friends to apply or save this internship."
                    sharePath={`/workspace/internships/${internship.id}`}
                    buttonLabel="Share"
                    buttonVariant="ghost"
                    buttonSize="lg"
                    className="flex-1"
                />
            </div>
            
             {showApplicants && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users />
                            Applicants ({initialApplicants.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {initialApplicants.length > 0 ? (
                            <div className="flex flex-wrap gap-4">
                                {initialApplicants.map(applicant => (
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
                            <p className="text-muted-foreground">No applicants yet. Be the first to apply!</p>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
