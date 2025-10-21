
'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Trophy, PlusCircle, Calendar, IndianRupee, MapPin, Loader2, Building, Search, Sparkles, ShieldCheck, Clock, SlidersHorizontal } from 'lucide-react';
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
  image_url: string | null;
};

type SortOption = 'deadline' | 'prize-high' | 'stipend-high';

export default function WorkspaceClient() {
  const { user, supabase } = useAuth();
  const role = user?.user_metadata?.role;
  const isAdmin = role === 'admin';
  const [competitions, setCompetitions] = useState<CompetitionPreview[]>([]);
  const [internships, setInternships] = useState<InternshipPreview[]>([]);
  const [competitionsLoading, setCompetitionsLoading] = useState(true);
  const [internshipsLoading, setInternshipsLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'competitions' | 'internships'>('competitions');
  const [sortOption, setSortOption] = useState<SortOption>('deadline');
  const [feeRange, setFeeRange] = useState<[number, number]>([0, 0]);
  const [stipendRange, setStipendRange] = useState<[number, number]>([0, 0]);

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
        .select('id,role,company,stipend,stipend_period,deadline,location,image_url')
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

  const competitionsWithFilters = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = competitions.filter(comp => {
      if (trimmed && !comp.title.toLowerCase().includes(trimmed) && !comp.description.toLowerCase().includes(trimmed)) {
        return false;
      }
      if (feeRange[1] > 0 && (comp.entry_fee < feeRange[0] || comp.entry_fee > feeRange[1])) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortOption === 'deadline') {
      sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortOption === 'prize-high') {
      sorted.sort((a, b) => b.prize - a.prize);
    }

    return sorted;
  }, [competitions, feeRange, query, sortOption]);

  const internshipsWithFilters = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const filtered = internships.filter(intern => {
      if (trimmed && !intern.role.toLowerCase().includes(trimmed) && !intern.company.toLowerCase().includes(trimmed)) {
        return false;
      }
      if (stipendRange[1] > 0 && (intern.stipend < stipendRange[0] || intern.stipend > stipendRange[1])) {
        return false;
      }
      return true;
    });

    const sorted = [...filtered];
    if (sortOption === 'deadline') {
      sorted.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
    } else if (sortOption === 'stipend-high') {
      sorted.sort((a, b) => (b.stipend ?? 0) - (a.stipend ?? 0));
    }

    return sorted;
  }, [internships, query, sortOption, stipendRange]);

  useEffect(() => {
    if (!competitions.length) {
      setFeeRange([0, 0]);
    } else {
      const fees = competitions.map(c => c.entry_fee || 0);
      const min = Math.min(...fees);
      const max = Math.max(...fees);
      setFeeRange([min, max]);
    }
  }, [competitions]);

  useEffect(() => {
    if (!internships.length) {
      setStipendRange([0, 0]);
    } else {
      const stipends = internships.map(i => i.stipend || 0);
      const min = Math.min(...stipends);
      const max = Math.max(...stipends);
      setStipendRange([min, max]);
    }
  }, [internships]);

  useEffect(() => {
    if (activeTab === 'competitions' && sortOption === 'stipend-high') {
      setSortOption('deadline');
    }
    if (activeTab === 'internships' && sortOption === 'prize-high') {
      setSortOption('deadline');
    }
  }, [activeTab, sortOption]);

  const FilterSheet = () => {
    const showFee = activeTab === 'competitions';
    const showStipend = activeTab === 'internships';

    return (
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="gap-2 rounded-full">
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm space-y-6">
          <SheetHeader>
            <SheetTitle>Refine {activeTab === 'competitions' ? 'competitions' : 'internships'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-6">
            {showFee && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Entry fee range</Label>
                <Slider
                  value={feeRange}
                  min={0}
                  max={Math.max(feeRange[1], 1000)}
                  step={100}
                  onValueChange={(value) => setFeeRange([value[0], value[1]])}
                />
                <p className="text-sm text-muted-foreground">₹{feeRange[0]} – ₹{feeRange[1]}</p>
              </div>
            )}
            {showStipend && (
              <div className="space-y-3">
                <Label className="text-sm font-semibold">Stipend range</Label>
                <Slider
                  value={stipendRange}
                  min={0}
                  max={Math.max(stipendRange[1], 20000)}
                  step={500}
                  onValueChange={(value) => setStipendRange([value[0], value[1]])}
                />
                <p className="text-sm text-muted-foreground">₹{stipendRange[0]} – ₹{stipendRange[1]}</p>
              </div>
            )}
          </div>
          <SheetClose asChild>
            <Button className="w-full">Apply filters</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border bg-card p-6 shadow-md space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-primary sm:text-5xl">Workspace</h1>
            <p className="text-muted-foreground">Discover competitions, internships, and campus gigs curated for UniNest students.</p>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-muted-foreground">
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <ShieldCheck className="size-4 text-primary" />
                Verified partners
              </span>
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <Clock className="size-4 text-primary" />
                Deadlines updated daily
              </span>
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <Sparkles className="size-4 text-primary" />
                New drops every week
              </span>
            </div>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:flex-row">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search competitions or internships"
                className="pl-10 h-11 rounded-full"
              />
            </div>
            {FilterSheet()}
            <Button asChild className="rounded-full">
              <Link href="/workspace/suggest">Suggest an opportunity</Link>
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'competitions' | 'internships')} className="space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <TabsList className="rounded-full bg-muted/70 p-1">
              <TabsTrigger className="rounded-full px-4" value="competitions">
                Competitions
              </TabsTrigger>
              <TabsTrigger className="rounded-full px-4" value="internships">
                Internships
              </TabsTrigger>
            </TabsList>
            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 rounded-full bg-muted px-3 py-1">
                <MapPin className="size-4 text-primary" />
                Hybrid & remote options
              </span>
              <div className="inline-flex items-center gap-2 rounded-full border bg-card px-2 py-1">
                <span className="text-xs uppercase tracking-wide text-muted-foreground">Sort</span>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="h-8 w-[170px] rounded-full border-muted-foreground/40">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent align="end">
                    <SelectItem value="deadline">Nearest deadline</SelectItem>
                    {activeTab === 'competitions' ? (
                      <SelectItem value="prize-high">Prize: High to Low</SelectItem>
                    ) : (
                      <SelectItem value="stipend-high">Stipend: High to Low</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <TabsContent value="competitions" className="space-y-6">
            <section className="rounded-2xl border bg-card/70 p-4 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-primary">Step into leaderboards with UniNest challenges</h2>
                  <p className="text-sm text-muted-foreground md:max-w-xl">
                    Join hackathons, ideathons, and creativity sprints. Win prizes, earn certificates, and level up your resume.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" asChild className="rounded-full">
                    <Link href="/workspace/competitions" className="gap-2">
                      Explore competitions
                      <Trophy className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="pt-3">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <ShieldCheck className="size-4 text-primary" />
                    Verified partners
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <Clock className="size-4 text-primary" />
                    Deadlines updated daily
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <Sparkles className="size-4 text-primary" />
                    New drops every week
                  </span>
                </div>
              </div>
            </section>

            {competitionsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : competitionsWithFilters.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {competitionsWithFilters.map((comp) => (
                  <Link key={comp.id} href={`/workspace/competitions/${comp.id}`} className="group block">
                    <Card className="flex flex-col transition-shadow hover:shadow-lg">
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-lg group-hover:text-primary transition-colors">{comp.title}</CardTitle>
                        <CardDescription className="line-clamp-3 pt-2 text-sm">{comp.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2">
                          <Trophy className="size-4 text-amber-500" />
                          <span>Prize pool <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Deadline <span className="font-semibold text-foreground">{new Date(comp.deadline).toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
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
                  No competitions match your filters. Try adjusting your search.
                </CardContent>
              </Card>
            )}
            {!competitionsLoading && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Why join?</CardTitle>
                  <CardDescription>Students unlocked ₹3.2L+ in rewards last quarter.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Top rewards</Badge>
                    Up to ₹1L prize pools monthly.
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Mentored</Badge>
                    Industry mentors & alumni jury panels.
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Certificates</Badge>
                    Shareable badges for LinkedIn and resumes.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="internships" className="space-y-6">
            <section className="rounded-2xl border bg-card/70 p-4 md:p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-primary">Unlock paid internships and resume-worthy roles</h2>
                  <p className="text-sm text-muted-foreground md:max-w-xl">
                    From startups to national brands, apply faster with curated opportunities tailored for students.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" asChild className="rounded-full">
                    <Link href="/workspace/internships" className="gap-2">
                      Browse internships
                      <Briefcase className="size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="pt-3">
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <Badge variant="secondary">Paid roles</Badge>
                    Transparent stipend details.
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <Clock className="size-4 text-primary" />
                    Apply in minutes
                  </span>
                  <span className="flex items-center gap-2 rounded-full border border-muted/40 bg-background/80 px-3 py-1">
                    <Sparkles className="size-4 text-primary" />
                    Mentor-backed journeys
                  </span>
                </div>
              </div>
            </section>

            {internshipsLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : internshipsWithFilters.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {internshipsWithFilters.map((internship) => (
                  <Link key={internship.id} href={`/workspace/internships/${internship.id}`} className="group block">
                    <Card className="flex flex-col transition-shadow hover:shadow-lg">
                      <CardHeader className="space-y-2">
                        {internship.image_url && (
                          <div className="relative w-full overflow-hidden rounded-xl border border-border/40 aspect-[4/3]">
                            <Image
                              src={internship.image_url}
                              alt={`${internship.role} poster`}
                              fill
                              className="object-cover"
                              sizes="(min-width: 1280px) 320px, (min-width: 768px) 45vw, 90vw"
                            />
                          </div>
                        )}
                        <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                          <Briefcase className="size-5 text-sky-500" />
                          <span className="line-clamp-2">{internship.role}</span>
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 text-sm">
                          <Building className="size-4" />
                          {internship.company}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
                        <div className="flex flex-wrap items-center gap-2">
                          <IndianRupee className="size-4" />
                          <span>
                            Stipend {internship.stipend > 0 ? <span className="font-semibold text-foreground">₹{internship.stipend.toLocaleString()}/{internship.stipend_period}</span> : <Badge variant="secondary">Unpaid</Badge>}
                          </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Calendar className="size-4" />
                          <span>Apply by <span className="font-semibold text-foreground">{new Date(internship.deadline).toLocaleDateString()}</span></span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
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
                  No internships match your filters. Try adjusting your search.
                </CardContent>
              </Card>
            )}
            {!internshipsLoading && (
              <Card className="border-dashed">
                <CardHeader>
                  <CardTitle className="text-lg">Why apply?</CardTitle>
                  <CardDescription>Average stipends grew 38% last semester.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-3 text-sm text-muted-foreground md:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Paid roles</Badge>
                    Transparent stipend details across roles.
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">Ready in 5</Badge>
                    Quick apply forms with resume autofill.
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Mentors</Badge>
                    Learn from founders, VPs, and alumni coaches.
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
