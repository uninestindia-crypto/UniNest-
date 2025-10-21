
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Calendar, IndianRupee, Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import Link from 'next/link';
import Image from 'next/image';

type Competition = {
    id: number;
    title: string;
    description: string;
    prize: number;
    deadline: string;
    entry_fee: number;
    image_url: string | null;
};

export default function CompetitionsClient() {
  const { isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { supabase } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchCompetitions = async () => {
        if (!supabase) return;
        setLoading(true);
        const { data, error } = await supabase
            .from('competitions')
            .select('*')
            .order('deadline', { ascending: true });

        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not fetch competitions.' });
            console.error(error);
        } else {
            setCompetitions(data);
        }
        setLoading(false);
    };
    fetchCompetitions();
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
        <h1 className="text-3xl font-bold tracking-tight text-primary">Competitions</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Challenge yourself, showcase your skills, and win exciting prizes.
        </p>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {competitions.length > 0 ? (
            competitions.map((comp) => (
             <Link key={comp.id} href={`/workspace/competitions/${comp.id}`} className="flex">
                <Card className="flex flex-col w-full transition-shadow hover:shadow-lg">
                    <CardHeader className="space-y-4">
                    {comp.image_url && (
                        <div className="relative w-full overflow-hidden rounded-xl aspect-[4/3] border border-border/40">
                        <Image
                            src={comp.image_url}
                            alt={`${comp.title} poster`}
                            fill
                            className="object-cover"
                            sizes="(min-width: 1024px) 300px, (min-width: 768px) 40vw, 90vw"
                        />
                        </div>
                    )}
                    <div className="space-y-2">
                        <CardTitle>{comp.title}</CardTitle>
                        <CardDescription className="pt-2 line-clamp-2">{comp.description}</CardDescription>
                    </div>
                    </CardHeader>
                    <CardContent className="flex-grow space-y-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Trophy className="size-4 text-amber-500" />
                        <span>Prize Pool: <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="size-4" />
                        <span>Deadline: <span className="font-semibold text-foreground">{new Date(comp.deadline).toLocaleDateString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <IndianRupee className="size-4" />
                        <span>Entry Fee: {comp.entry_fee > 0 ? <span className="font-semibold text-foreground">₹{comp.entry_fee}</span> : <Badge variant="secondary">Free</Badge>}</span>
                    </div>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">View Details</Button>
                    </CardFooter>
                </Card>
            </Link>
            ))
        ) : (
            <div className="text-center text-muted-foreground py-16 md:col-span-3">
              <h2 className="text-xl font-semibold">No Competitions Found</h2>
              <p>There are no competitions running at the moment. Please check back later.</p>
            </div>
        )}
      </div>
    </div>
  );
}
