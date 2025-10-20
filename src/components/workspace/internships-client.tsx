
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Building, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    stipend_period: string;
    deadline: string;
    location: string;
    image_url: string;
    details_pdf_url: string;
};

export default function InternshipsClient() {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const { supabase } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchInternships = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('internships')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch internships.' });
            console.error(error);
        } else {
            setInternships(data);
        }
        setLoading(false);
    };
    fetchInternships();
  }, [supabase, toast]);


  if (loading) {
      return (
         <div className="flex justify-center items-center h-64">
            <Loader2 className="size-8 animate-spin" />
        </div>
      )
  }

  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Internships</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Kickstart your career with valuable industry experience.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {internships.length > 0 ? (
            internships.map((internship) => (
            <Link key={internship.id} href={`/workspace/internships/${internship.id}`} className="flex">
                <Card className="flex flex-col w-full transition-shadow hover:shadow-lg">
                    <CardHeader>
                    {internship.image_url && (
                        <div className="relative h-40 mb-4 rounded-md overflow-hidden bg-muted flex items-center justify-center">
                            <Image src={internship.image_url} alt={internship.company} fill className="object-contain" data-ai-hint="company logo" />
                        </div>
                    )}
                    <CardTitle className="flex items-center gap-2">
                        <Briefcase className="size-5 text-sky-500"/>
                        {internship.role}
                    </CardTitle>
                    <CardDescription className="pt-2 flex items-center gap-2">
                        <Building className="size-4"/>{internship.company}
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IndianRupee className="size-4" />
                        <span>Stipend: {internship.stipend > 0 ? <span className="font-semibold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipend_period}</span> : <Badge variant="secondary">Unpaid</Badge>}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>Apply by: <span className="font-semibold text-foreground">{new Date(internship.deadline).toLocaleDateString()}</span></span>
                    </div>
                    <Badge>{internship.location}</Badge>
                    </CardContent>
                    <CardFooter>
                       <Button className="w-full" variant="outline">View Details</Button>
                    </CardFooter>
                </Card>
            </Link>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-16 md:col-span-3">
              <h2 className="text-xl font-semibold">No Internships Found</h2>
              <p>There are no internship listings at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
