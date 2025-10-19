
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Briefcase, Trophy, PlusCircle, Calendar, IndianRupee, MapPin, ArrowUpRight, Loader2, Building } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

type CompetitionPreview = {
  id: number;
  title: string;
  description: string;
  prize: number;
  deadline: string;
  entry_fee: number;
};

type InternshipPreview = {
  id: number;
  role: string;
  company: string;
  stipend: number;
  stipend_period: string;
  deadline: string;
  location: string;
};

type LayoutMode = 'grid' | 'list';

export default function WorkspaceClient() {
  const { user, supabase } = useAuth();
  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const [competitions, setCompetitions] = useState<CompetitionPreview[]>([]);
  const [internships, setInternships] = useState<InternshipPreview[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(true);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('grid');

  const layoutToggle = useMemo(() => (
    <div className="inline-flex items-center gap-2 rounded-full border bg-card px-2 py-1 text-sm">
      <span className="text-muted-foreground">Layout</span>
      <div className="flex rounded-full bg-muted p-1">
        <Button
          size="sm"
          variant={layoutMode === 'grid' ? 'default' : 'ghost'}
          className="rounded-full px-3"
          onClick={() => setLayoutMode('grid')}
        >
          Grid
        </Button>
        <Button
          size="sm"
          variant={layoutMode === 'list' ? 'default' : 'ghost'}
          className="rounded-full px-3"
          onClick={() => setLayoutMode('list')}
        >
          List
        </Button>
      </div>
    </div>
  ), [layoutMode]);

  useEffect(() => {
    let isMounted = true;

    const loadCompetitions = async () => {
      if (!supabase) return;
      setCompetitionsLoading(true);
      const { data, error } = await supabase
        .from('competitions')
        .select('id,title,description,deadline,prize,entry_fee')
        .order('deadline', { ascending: true })
        .limit(3);
      if (isMounted && !error) {
        setCompetitions(data ?? []);
      }
      if (isMounted) {
        setCompetitionsLoading(false);
      }
    };

    const loadInternships = async () => {
      if (!supabase) return;
      setInternshipsLoading(true);
      const { data, error } = await supabase
        .from('internships')
        .select('id,role,company,stipend,stipend_period,deadline,location')
        .order('deadline', { ascending: true })
        .limit(3);
      if (isMounted && !error) {
        setInternships(data ?? []);
      }
      if (isMounted) {
        setInternshipsLoading(false);
      }
    };

    loadCompetitions();
    loadInternships();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Workspace</h1>
        <p className="mt-4 max-w-2xl mx-auto text-lg text-muted-foreground">
          Compete. Learn. Grow. – Unlock your potential with UniNest.
        </p>
         <div className="mt-8 flex justify-center">
          <Button asChild>
            <Link href="/workspace/suggest">
              Have a listing to suggest?
            </Link>
          </Button>
        </div>
      </section>

      <section className="bg-muted/40 border rounded-3xl p-8 lg:p-10 grid gap-6 md:grid-cols-[1.5fr_minmax(0,1fr)] items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-semibold leading-tight">Build your journey with the UniNest Marketplace</h2>
          <p className="text-muted-foreground text-base md:text-lg">
            Discover hostels, library seats, food plans, and student-made products in one destination. List your own offers and reach the UniNest community instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
            <Button size="lg" asChild>
              <Link href="/marketplace" className="gap-2">
                Explore Marketplace
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/marketplace/new" className="gap-2">
                List a Product
                <PlusCircle className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        <div className="grid gap-4">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Highlights</CardTitle>
              <CardDescription>What students love right now</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Verified</Badge>
                Trusted listings from authenticated peers and vendors.
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">Smart Deals</Badge>
                Compare pricing across categories before you buy.
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="secondary">Fast</Badge>
                Chat instantly to book or reserve what you need.
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                    <Trophy className="text-amber-500" />
                    Competitions
                    </CardTitle>
                    <CardDescription className="mt-2">
                    Test your skills and win amazing prizes in exclusive competitions.
                    </CardDescription>
                </div>
                 {isAdmin && (
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/admin/competitions/new">
                            <PlusCircle className="mr-2 size-4"/>
                            Add New
                        </Link>
                    </Button>
                 )}
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/workspace/competitions">View Competitions</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg transition-shadow hover:shadow-xl">
          <CardHeader>
            <div className="flex justify-between items-start">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                    <Briefcase className="text-sky-500" />
                    Internships
                    </CardTitle>
                    <CardDescription className="mt-2">
                    Gain real-world experience with internships from top companies.
                    </CardDescription>
                </div>
                {isAdmin && (
                    <Button size="sm" variant="outline" asChild>
                        <Link href="/admin/internships/new">
                            <PlusCircle className="mr-2 size-4"/>
                            Add New
                        </Link>
                    </Button>
                 )}
            </div>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link href="/workspace/internships">View Internships</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Latest Competitions</h2>
            <p className="text-muted-foreground">Speed-run your achievements with upcoming challenges.</p>
          </div>
          <div className="flex items-center gap-3">
            {layoutToggle}
            <Button variant="ghost" asChild>
              <Link href="/workspace/competitions" className="gap-2">
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        {competitionsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : competitions.length > 0 ? (
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {competitions.map((comp) => (
              <Link key={comp.id} href={`/workspace/competitions/${comp.id}`} className={layoutMode === 'grid' ? 'flex' : 'block'}>
                <Card className={`transition-shadow hover:shadow-lg ${layoutMode === 'list' ? 'flex flex-col md:flex-row md:items-center' : 'flex flex-col flex-1'}`}>
                  <CardHeader className={layoutMode === 'list' ? 'md:w-1/3' : undefined}>
                    <CardTitle className="line-clamp-2 text-lg">{comp.title}</CardTitle>
                    <CardDescription className="line-clamp-3 pt-2 text-sm">{comp.description}</CardDescription>
                  </CardHeader>
                  <CardContent className={`text-sm text-muted-foreground ${layoutMode === 'list' ? 'md:w-2/3 md:border-l md:border-muted/50 md:pl-6 flex flex-col gap-4' : 'flex flex-col gap-4'}`}>
                    <div className="flex items-center gap-2">
                      <Trophy className="size-4 text-amber-500" />
                      <span>Prize Pool <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>Deadline <span className="font-semibold text-foreground">{new Date(comp.deadline).toLocaleDateString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="size-4" />
                      <span>
                        Entry {comp.entry_fee > 0 ? <span className="font-semibold text-foreground">₹{comp.entry_fee}</span> : <Badge variant="secondary">Free</Badge>}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No competitions posted yet. Check back soon.
            </CardContent>
          </Card>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold">Hot Internships</h2>
            <p className="text-muted-foreground">Land real-world experience without hopping across pages.</p>
          </div>
          <div className="flex items-center gap-3">
            {layoutToggle}
            <Button variant="ghost" asChild>
              <Link href="/workspace/internships" className="gap-2">
                View all
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
        {internshipsLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="size-6 animate-spin text-muted-foreground" />
          </div>
        ) : internships.length > 0 ? (
          <div className={layoutMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {internships.map((internship) => (
              <Link key={internship.id} href={`/workspace/internships/${internship.id}`} className={layoutMode === 'grid' ? 'flex' : 'block'}>
                <Card className={`transition-shadow hover:shadow-lg ${layoutMode === 'list' ? 'flex flex-col md:flex-row md:items-center' : 'flex flex-col flex-1'}`}>
                  <CardHeader className={`space-y-2 ${layoutMode === 'list' ? 'md:w-1/3' : ''}`}>
                    <CardTitle className="flex items-center gap-2 text-lg">
                      <Briefcase className="size-5 text-sky-500" />
                      <span className="line-clamp-2">{internship.role}</span>
                    </CardTitle>
                    <CardDescription className="flex items-center gap-2 text-sm">
                      <Building className="size-4" />
                      {internship.company}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className={`text-sm text-muted-foreground ${layoutMode === 'list' ? 'md:w-2/3 md:border-l md:border-muted/50 md:pl-6 flex flex-col gap-4' : 'flex flex-col gap-4'}`}>
                    <div className="flex items-center gap-2">
                      <IndianRupee className="size-4" />
                      <span>
                        Stipend {internship.stipend > 0 ? <span className="font-semibold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipend_period}</span> : <Badge variant="secondary">Unpaid</Badge>}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4" />
                      <span>Apply by <span className="font-semibold text-foreground">{new Date(internship.deadline).toLocaleDateString()}</span></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="size-4" />
                      <Badge variant="outline" className="border-dashed">
                        {internship.location}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No internships have been added yet. New roles will appear here.
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
