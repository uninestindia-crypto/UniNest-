'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Briefcase, Trophy, Calendar, IndianRupee, MapPin, Loader2, Building, Search, Sparkles, ShieldCheck, Clock, SlidersHorizontal, ArrowRight, UserCheck, Flame } from 'lucide-react';
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
        // .gt('deadline', new Date().toISOString()) // Only show future competitions
        .order('deadline', { ascending: true })
        .limit(9); // Increased limit
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
        // .gt('deadline', new Date().toISOString()) // Only show future internships
        .order('deadline', { ascending: true })
        .limit(9); // Increased limit
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
          <Button variant="outline" className="gap-2 rounded-xl h-11 border-border/60">
            <SlidersHorizontal className="size-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-full sm:max-w-sm space-y-8">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold">Refine {activeTab === 'competitions' ? 'Competitions' : 'Internships'}</SheetTitle>
          </SheetHeader>
          <div className="space-y-8">
            {showFee && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Entry fee range</Label>
                  <span className="text-xs font-medium text-muted-foreground">₹{feeRange[0]} – ₹{feeRange[1]}</span>
                </div>
                <Slider
                  value={feeRange}
                  min={0}
                  max={Math.max(feeRange[1], 1000)}
                  step={100}
                  onValueChange={(value) => setFeeRange([value[0], value[1]])}
                  className="py-2"
                />
              </div>
            )}
            {showStipend && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold">Stipend range</Label>
                  <span className="text-xs font-medium text-muted-foreground">₹{stipendRange[0]} – ₹{stipendRange[1]}</span>
                </div>
                <Slider
                  value={stipendRange}
                  min={0}
                  max={Math.max(stipendRange[1], 20000)}
                  step={500}
                  onValueChange={(value) => setStipendRange([value[0], value[1]])}
                  className="py-2"
                />
              </div>
            )}
          </div>
          <SheetClose asChild>
            <Button className="w-full rounded-xl" size="lg">Show Results</Button>
          </SheetClose>
        </SheetContent>
      </Sheet>
    );
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 md:p-14 shadow-2xl">
        <div className="absolute inset-0 bg-[url('/patterns/circuit.svg')] opacity-10"></div>
        <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute left-0 bottom-0 w-80 h-80 bg-purple-500/20 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start justify-between">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-sm font-medium text-blue-200 backdrop-blur-sm border border-white/10">
              <Trophy className="w-4 h-4 text-yellow-400" />
              <span>Level Up Your Career</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-time">
              Your Gateway to <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400">Opportunities</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-2xl leading-relaxed">
              Discover hackathons, internships, and competitions curated for students.
              Build your portfolio, earn rewards, and get hired.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search interactions, internships..."
                  className="bg-white/10 border-white/10 text-white placeholder:text-slate-400 pl-11 h-12 rounded-xl focus:bg-white/20 transition-all"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </div>
              <Button asChild size="lg" className="rounded-xl bg-blue-600 hover:bg-blue-500 text-white border-0 shadow-lg shadow-blue-500/25 h-12 px-8">
                <Link href="/workspace/suggest">
                  <Sparkles className="mr-2 h-4 w-4" /> Suggest Opportunity
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:block w-72 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Flame className="w-5 h-5 text-orange-400" /> Trending Now
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold">AI</div>
                <div>
                  <p className="font-medium text-sm">GenAI Hackathon</p>
                  <p className="text-xs text-slate-400">2 days left</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 font-bold">FE</div>
                <div>
                  <p className="font-medium text-sm">Frontend Challenge</p>
                  <p className="text-xs text-slate-400">500+ participants</p>
                </div>
              </div>
              <div className="pt-2">
                <Button variant="link" className="w-full text-white/50 hover:text-white p-0 h-auto text-xs">View all trends <ArrowRight className="w-3 h-3 ml-1" /></Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Tabs Section */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'competitions' | 'internships')} className="space-y-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 sticky top-20 z-30 bg-background/80 backdrop-blur-lg py-4 border-b border-border/50">
          <TabsList className="bg-muted/50 p-1.5 rounded-full border border-border/50 h-auto">
            <TabsTrigger
              value="competitions"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              <Trophy className="w-4 h-4 mr-2" /> Competitions
            </TabsTrigger>
            <TabsTrigger
              value="internships"
              className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-sm transition-all"
            >
              <Briefcase className="w-4 h-4 mr-2" /> Internships
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
            {FilterSheet()}
            <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
              <SelectTrigger className="w-[180px] rounded-xl h-11 border-border/60 bg-background">
                <SelectValue placeholder="Sort By" />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="deadline">Nearest Deadline</SelectItem>
                {activeTab === 'competitions' ? (
                  <SelectItem value="prize-high">Prize: High to Low</SelectItem>
                ) : (
                  <SelectItem value="stipend-high">Stipend: High to Low</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <TabsContent value="competitions" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {competitionsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted rounded-3xl border-0" />
              ))
            ) : competitionsWithFilters.length > 0 ? (
              competitionsWithFilters.map((comp) => (
                <Link key={comp.id} href={`/workspace/competitions/${comp.id}`} className="group block h-full">
                  <Card className="h-full rounded-3xl border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:-translate-y-1 group-hover:border-blue-500/30 flex flex-col">
                    <CardHeader className="p-6 pb-4">
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <Badge variant="secondary" className="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg px-2 py-1 text-xs uppercase tracking-wider font-bold">
                          Competition
                        </Badge>
                        {new Date(comp.deadline).getTime() - new Date().getTime() < 1000 * 60 * 60 * 24 * 3 && (
                          <Badge variant="destructive" className="animate-pulse flex items-center gap-1 rounded-full px-2">
                            <Clock className="w-3 h-3" /> Closing Soon
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-xl font-bold leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                        {comp.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-0 flex-grow space-y-4">
                      <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed">
                        {comp.description}
                      </p>

                      <div className="flex flex-wrap gap-2 text-sm text-muted-foreground mt-4">
                        <span className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                          <Trophy className="w-4 h-4 text-amber-500" />
                          Prize: <span className="font-semibold text-foreground">₹{comp.prize.toLocaleString()}</span>
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-muted/50 px-3 py-1.5 rounded-lg border border-border/50">
                          <IndianRupee className="w-4 h-4 text-green-500" />
                          Fee: <span className="font-semibold text-foreground">{comp.entry_fee === 0 ? 'Free' : `₹${comp.entry_fee}`}</span>
                        </span>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 mt-auto border-t border-border/40 bg-muted/10">
                      <div className="flex items-center justify-between w-full pt-4">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          Ends {new Date(comp.deadline).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 p-0 h-auto font-semibold">
                          View Details <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-muted/20 rounded-3xl border border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trophy className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold">No competitions found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Try adjusting your filters to find more opportunities.</p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="internships" className="space-y-8 mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {internshipsLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="h-64 animate-pulse bg-muted rounded-3xl border-0" />
              ))
            ) : internshipsWithFilters.length > 0 ? (
              internshipsWithFilters.map((internship) => (
                <Link key={internship.id} href={`/workspace/internships/${internship.id}`} className="group block h-full">
                  <Card className="h-full rounded-3xl border-border/60 bg-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 hover:-translate-y-1 group-hover:border-purple-500/30 flex flex-col">
                    <div className="relative h-32 w-full bg-gradient-to-r from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                      {internship.image_url ? (
                        <Image
                          src={internship.image_url}
                          alt={internship.company}
                          fill
                          className="object-cover opacity-80 mix-blend-overlay"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center opacity-10">
                          <Building className="w-16 h-16" />
                        </div>
                      )}
                      <div className="absolute bottom-4 left-6 w-12 h-12 bg-white rounded-xl shadow-md p-2 flex items-center justify-center border border-border/50">
                        <Building className="w-6 h-6 text-purple-600" />
                      </div>
                    </div>

                    <CardHeader className="p-6 pt-2 pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-bold text-lg text-foreground group-hover:text-purple-600 transition-colors">{internship.role}</h3>
                          <p className="text-sm font-medium text-muted-foreground">{internship.company}</p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 pt-4 flex-grow space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Stipend</p>
                          <p className="font-semibold text-sm">
                            {internship.stipend > 0 ? `₹${internship.stipend.toLocaleString()}` : 'Unpaid'}
                            <span className="text-xs text-muted-foreground font-normal ml-1">/{internship.stipend_period.slice(0, 2)}</span>
                          </p>
                        </div>
                        <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                          <p className="text-xs text-muted-foreground font-medium mb-1">Location</p>
                          <p className="font-semibold text-sm truncate">{internship.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg w-fit">
                        <UserCheck className="w-3.5 h-3.5" />
                        Typically replies in 2 days
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0 mt-auto border-t border-border/40 bg-muted/10">
                      <div className="flex items-center justify-between w-full pt-4">
                        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          Apply by {new Date(internship.deadline).toLocaleDateString()}
                        </span>
                        <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 p-0 h-auto font-semibold">
                          Apply Now <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-muted/20 rounded-3xl border border-dashed">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold">No internships found</h3>
                <p className="text-muted-foreground max-w-sm mx-auto mt-2">Try adjusting your filters to find more opportunities.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
