'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Loader2, BookOpen, ShoppingBag, Armchair, IndianRupee, Sparkles, Star, ShieldCheck, Trophy, Medal, Crown, Rocket, Gift, Target, Flame, Users, ArrowRight } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect, useMemo, useRef } from 'react';
import { Input } from '../ui/input';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { trackEvent } from '@/lib/analytics';
import { ScrollArea } from '../ui/scroll-area';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const impactCards = [
  { title: "Shared Knowledge", description: "Keep lecture notes and study materials free for everyone.", icon: BookOpen, href: "/notes", color: "text-blue-500", bg: "bg-blue-500/10" },
  { title: "Campus Market", description: "Power the student economy with 0% commission fees.", icon: ShoppingBag, href: "/marketplace", color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { title: "Study Access", description: "Maintain real-time library seat booking systems.", icon: Armchair, href: "/booking", color: "text-purple-500", bg: "bg-purple-500/10" },
];

const donationTiers = [
  { amount: 100, title: "☕ Coffee for Code", description: "Fuels one hour of dev time." },
  { amount: 500, title: "🚀 Server Boost", description: "Keeps the platform fast for a day." },
  { amount: 1000, title: "💎 Campus Legend", description: "Sponsors a student grant pool." },
];

type MilestoneReward = {
  goal: number;
  title: string;
  description?: string;
  icon: LucideIcon;
  achieved?: boolean;
};

const milestoneRewards: MilestoneReward[] = [
  { goal: 5000, title: "Peer Mentorship Boost", description: "Unlock mentor office hours for freshers.", icon: Trophy },
  { goal: 15000, title: "Skill Sprint Weekend", description: "Fund campus-wide learning workshops.", icon: Medal },
  { goal: 30000, title: "Founders' Innovation Grant", description: "Sponsor prototyping grants for student teams.", icon: Crown },
];

const communityBoosts = [
  { id: "shield", goal: 4000, title: "System Stability", description: "Keeps UniNest blazing fast.", icon: ShieldCheck },
  { id: "care", goal: 12000, title: "Student Fund", description: "Backs emergency micro-scholarships.", icon: Heart },
  { id: "launch", goal: 22000, title: "Innovation Launch", description: "Kickstarts student events.", icon: Rocket },
];

const dailyQuests = [
  { id: "streak", title: "Early Bird", reward: "Be among the first 10 donors today.", threshold: 10, icon: Flame },
  { id: "share", title: "Spread the Word", reward: "Invite friends to the cause.", threshold: 50, icon: Gift },
];

const trustBadges = [
  { icon: ShieldCheck, label: 'Secure Payment' },
  { icon: Heart, label: '100% Student Impact' },
  { icon: Star, label: 'Verified Community' },
];

const medalColors = ["text-yellow-400 drop-shadow-sm", "text-slate-400 drop-shadow-sm", "text-amber-700 drop-shadow-sm"];

type QuestProgress = {
  streak: boolean;
  share: boolean;
  aim: boolean;
};

const defaultQuestProgress: QuestProgress = {
  streak: false,
  share: false,
  aim: false,
};

type Donor = {
  name: string | null;
  avatar: string | null;
  amount: number;
  userId: string;
}

type DonateContentProps = {
  initialDonors: Donor[];
  initialGoal: number;
  initialRaised: number;
}

type DonationStatsResponse = {
  goal: {
    amount: number;
    raised: number;
    progress: number;
  };
  donors: {
    leaderboard: {
      userId: string;
      name: string;
      avatar: string | null;
      total: number;
    }[];
  };
  milestones: {
    goal: number;
    title: string;
    description?: string;
    achieved: boolean;
  }[];
};

export default function DonateContent({ initialDonors, initialGoal, initialRaised }: DonateContentProps) {
  const router = useRouter();
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [donors, setDonors] = useState<Donor[]>(initialDonors);
  const [goalAmount, setGoalAmount] = useState(initialGoal);
  const [raisedAmount, setRaisedAmount] = useState(initialRaised);
  const [milestones, setMilestones] = useState<MilestoneReward[]>(milestoneRewards);
  const [donationAmount, setDonationAmount] = useState('100');
  const [questProgress, setQuestProgress] = useState<QuestProgress>(() => {
    if (typeof window === 'undefined') return defaultQuestProgress;
    const stored = window.localStorage.getItem('donation-quests');
    if (!stored) return defaultQuestProgress;
    try {
      const parsed = JSON.parse(stored) as Partial<QuestProgress>;
      return { ...defaultQuestProgress, ...parsed };
    } catch {
      return defaultQuestProgress;
    }
  });
  const lastDonationRef = useRef<number>(initialRaised);

  useEffect(() => {
    const hydrateStats = async () => {
      try {
        const response = await fetch('/api/donations/stats');
        if (!response.ok) return;
        const data = await response.json() as DonationStatsResponse;
        setGoalAmount(data.goal.amount);
        setRaisedAmount(data.goal.raised);

        if (Array.isArray(data.donors?.leaderboard) && data.donors.leaderboard.length > 0) {
          const leaderboardDonors = data.donors.leaderboard.map((item) => ({
            name: item.name,
            avatar: item.avatar,
            amount: item.total,
            userId: item.userId,
          }));

          setDonors((prevDonors) => {
            const combined = [...leaderboardDonors, ...prevDonors];
            const merged = combined.reduce<Donor[]>((acc, donor) => {
              const existing = acc.find((d) => d.userId === donor.userId);
              if (existing) {
                existing.amount = Math.max(existing.amount, donor.amount);
                existing.avatar = existing.avatar ?? donor.avatar;
                existing.name = existing.name ?? donor.name;
              } else {
                acc.push({ ...donor });
              }
              return acc;
            }, []);
            return merged.sort((a, b) => b.amount - a.amount);
          });
        }

        if (Array.isArray(data.milestones)) {
          setMilestones(
            data.milestones.map((milestone) => ({
              goal: milestone.goal,
              title: milestone.title,
              description:
                milestone.description ??
                milestoneRewards.find((m) => m.goal === milestone.goal)?.description,
              icon:
                milestoneRewards.find((m) => m.goal === milestone.goal)?.icon ?? Trophy,
              achieved: milestone.achieved,
            }))
          );
        }
      } catch (error) {
        console.warn('[donations] failed to hydrate stats', error);
      }
    };

    hydrateStats();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('donation-quests', JSON.stringify(questProgress));
  }, [questProgress]);

  useEffect(() => {
    if (!supabase) return;

    const channel = supabase
      .channel('public:donations')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'donations' }, async (payload) => {
        const newDonation = payload.new as { user_id: string; amount: number; };

        // Fetch profile for the new donation
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name, avatar_url')
          .eq('id', newDonation.user_id)
          .single();

        setRaisedAmount(prev => prev + newDonation.amount);
        lastDonationRef.current = newDonation.amount;

        const newDonorInfo = {
          name: profileData?.full_name || 'Anonymous',
          avatar: profileData?.avatar_url,
          amount: newDonation.amount,
          userId: newDonation.user_id,
        };

        setDonors(prevDonors => {
          const existingDonorIndex = prevDonors.findIndex(d => d.userId === newDonorInfo.userId);
          let updatedDonors;
          if (existingDonorIndex > -1) {
            updatedDonors = [...prevDonors];
            updatedDonors[existingDonorIndex].amount += newDonation.amount;
          } else {
            updatedDonors = [...prevDonors, newDonorInfo];
          }
          return updatedDonors.sort((a, b) => b.amount - a.amount);
        });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    }
  }, [supabase]);

  const progressPercentage = goalAmount > 0 ? Math.min((raisedAmount / goalAmount) * 100, 100) : 0;
  const roundedProgress = Math.round(progressPercentage);

  useEffect(() => {
    const updates = { ...questProgress };
    const currentStreak = raisedAmount > 0; // Simplified streak check
    if (currentStreak !== updates.streak) {
      setQuestProgress(prev => ({ ...prev, streak: currentStreak }));
    }
  }, [raisedAmount]);

  const recentBoost = useMemo(() => {
    if (lastDonationRef.current >= 1000) return 'Mega Boost! You are a true legend 🏆';
    if (lastDonationRef.current >= 500) return 'Power Surge! Keeping us running strong ⚡';
    if (lastDonationRef.current > 0) return 'Fresh Spark! Thanks for the support ✨';
    return null;
  }, [lastDonationRef.current]);

  const handlePaymentSuccess = async (paymentResponse: any, accessToken: string) => {
    const amount = parseInt(donationAmount, 10);
    const verificationResponse = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Pass the token here
      },
      body: JSON.stringify({
        orderId: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        type: 'donation',
        amount: amount,
      })
    });

    const result = await verificationResponse.json();
    setIsDonating(false);

    if (!verificationResponse.ok) {
      toast({ variant: 'destructive', title: 'Error Saving Donation', description: result.error || 'Your donation was processed, but we failed to record it. Please contact support@uninest.co.in.' });
    } else {
      router.push(`/donate/thank-you?amount=${amount}`);
    }
  }

  const handleDonate = async (amountStr: string) => {
    if (!user) {
      toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to donate.' });
      return;
    }
    const amount = parseInt(amountStr, 10);
    if (isNaN(amount) || amount <= 0) {
      toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid donation amount.' });
      return;
    }
    setIsDonating(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount * 100, currency: 'INR' }),
      });

      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create order');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Donation',
        description: 'Support student innovation!',
        order_id: order.id,
        handler: handlePaymentSuccess,
        prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '' },
        notes: { type: 'donation', userId: user?.id },
        theme: { color: '#0F172A' },
        modal: {
          ondismiss: () => setIsDonating(false),
        },
      };
      openCheckout(options);
    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: 'Donation Failed', description: error instanceof Error ? error.message : 'Could not connect to the payment gateway.' });
      setIsDonating(false);
    }
  };

  const topDonors = donors.slice(0, 3);
  const otherDonors = donors.slice(3, 10);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Immersive Hero Section */}
      <section className="relative overflow-hidden bg-slate-900 text-white">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-900/60 z-10"></div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1950&q=80"
            alt="Students collaborating"
            className="w-full h-full object-cover opacity-40 mix-blend-overlay"
          />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-32">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/20 px-4 py-1.5 text-sm font-semibold text-blue-300 border border-blue-500/30 backdrop-blur-md mb-6 animate-fade-in">
              <Sparkles className="size-4" /> Official Campus Fund
            </span>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight leading-tight mb-6">
              Fuel the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Future</span> of Students
            </h1>
            <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-8">
              Your contribution directly powers free lecture notes, student market spaces, and verified campus opportunities. Join the movement today.
            </p>
            <Button
              size="lg"
              className="text-lg h-14 rounded-xl px-8 bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/30 transition-all hover:scale-105"
              onClick={() => {
                trackEvent('donation_scroll_to_form');
                document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Become a Supporter <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Live Ticker */}
        <div className="relative z-20 border-t border-white/10 bg-black/20 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="flex size-3 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-sm font-medium text-slate-300">Live Impact: <span className="text-white font-bold">{donors.length} heroes</span> contributed recently</span>
            </div>
            <div className="flex -space-x-2">
              {donors.slice(0, 5).map((donor, i) => (
                <Avatar key={i} className="size-8 border-2 border-slate-900 ring-2 ring-white/10">
                  <AvatarImage src={donor.avatar || ''} />
                  <AvatarFallback className="bg-blue-600 text-[10px] text-white font-bold">{donor.name?.charAt(0)}</AvatarFallback>
                </Avatar>
              ))}
              {donors.length > 5 && (
                <div className="size-8 rounded-full bg-slate-800 border-2 border-slate-900 ring-2 ring-white/10 flex items-center justify-center text-[10px] font-bold text-slate-300">
                  +{donors.length - 5}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 md:-mt-20 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {impactCards.map(card => (
            <Card key={card.title} className="bg-card/90 backdrop-blur-xl border-border/50 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="flex flex-row items-center gap-4 space-y-0 pb-2">
                <div className={cn("p-3 rounded-xl", card.bg, card.color)}>
                  <card.icon className="size-6" />
                </div>
                <CardTitle className="text-lg font-bold">{card.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed">{card.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div id="donate-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-12 items-start">
          {/* Left Column: Donation Actions */}
          <div className="space-y-8">
            <Card className="shadow-2xl border-0 overflow-hidden ring-1 ring-border/50">
              <CardHeader className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800/50 p-6 md:p-8">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                    <Target className="w-4 h-4 text-blue-500" /> Goal Progress
                  </span>
                  <span className="text-lg font-black font-mono text-primary">{roundedProgress}%</span>
                </div>
                <Progress value={progressPercentage} className="h-4 rounded-full bg-slate-200 dark:bg-slate-700" indicatorClassName="bg-gradient-to-r from-blue-500 to-emerald-500" />
                <div className="flex justify-between items-baseline mt-3">
                  <div className="flex flex-col">
                    <span className="text-3xl font-black text-foreground">₹{raisedAmount.toLocaleString()}</span>
                    <span className="text-sm text-muted-foreground font-medium">raised of ₹{goalAmount.toLocaleString()}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">Active Funding</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 md:p-8 space-y-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 font-headline flex items-center gap-2">
                    Choose your impact <span className="text-xs font-normal text-muted-foreground ml-2">(Secure via Razorpay)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {donationTiers.map(tier => (
                      <button
                        key={tier.amount}
                        onClick={() => {
                          setDonationAmount(tier.amount.toString());
                          trackEvent('donation_tier_selected', { amount: tier.amount, label: tier.title });
                        }}
                        className={cn(
                          "relative group p-4 rounded-2xl border-2 text-left transition-all duration-200 outline-none focus:ring-4 focus:ring-blue-500/20",
                          donationAmount === tier.amount.toString()
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10 shadow-lg shadow-blue-500/10"
                            : "border-border hover:border-blue-300 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xl font-black text-foreground">₹{tier.amount}</span>
                          {donationAmount === tier.amount.toString() && <div className="absolute top-4 right-4 text-blue-500"><ShieldCheck className="size-5" /></div>}
                        </div>
                        <p className="font-bold text-sm text-foreground mb-1 pr-4">{tier.title}</p>
                        <p className="text-xs text-muted-foreground leading-tight group-hover:text-slate-600 dark:group-hover:text-slate-300">{tier.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <label className="text-sm font-semibold text-muted-foreground mb-2 block">Or enter custom amount</label>
                    <div className="relative">
                      <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        className="pl-12 h-14 text-lg font-bold rounded-xl border-2 focus-visible:ring-blue-500"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    size="lg"
                    className="w-full h-16 text-lg font-bold rounded-xl gap-3 shadow-xl shadow-blue-600/20"
                    onClick={() => {
                      trackEvent('donation_attempt', { amount: Number(donationAmount) || 0, method: 'razorpay' });
                      handleDonate(donationAmount);
                    }}
                    disabled={!isLoaded || isDonating || !donationAmount}
                  >
                    {isDonating ? (
                      <>
                        <Loader2 className="animate-spin" /> Processing Payment...
                      </>
                    ) : (
                      <>
                        <Heart className="fill-current animate-pulse" /> Donate ₹{donationAmount || 0}
                      </>
                    )}
                  </Button>

                  <div className="flex items-center justify-center gap-6 pt-2">
                    {trustBadges.map((badge, i) => (
                      <div key={i} className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                        <badge.icon className="size-3.5 text-emerald-500" />
                        {badge.label}
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Milestones */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {milestones.map((m, i) => {
                const achieved = raisedAmount >= m.goal;
                return (
                  <div key={i} className={cn("p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-colors", achieved ? "bg-amber-50 border-amber-200 dark:bg-amber-900/10 dark:border-amber-800" : "bg-card border-border")}>
                    <div className={cn("p-2 rounded-full", achieved ? "bg-amber-100 text-amber-600 dark:bg-amber-800 dark:text-amber-200" : "bg-muted text-muted-foreground")}>
                      <m.icon className="size-5" />
                    </div>
                    <div>
                      <p className={cn("text-xs font-bold uppercase tracking-wider mb-1", achieved ? "text-amber-600" : "text-muted-foreground")}>{achieved ? 'Unlocked' : `Goal: ₹${(m.goal / 1000).toFixed(0)}k`}</p>
                      <p className="text-sm font-semibold line-clamp-2">{m.title}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Right Column: Leaderboard & Impact */}
          <div className="space-y-8">
            <Card className="border-0 shadow-lg ring-1 ring-border/50 bg-card overflow-hidden">
              <CardHeader className="bg-slate-50 dark:bg-slate-900/50 pb-4 border-b">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl font-bold flex items-center gap-2">
                      <Crown className="text-amber-500 fill-current" /> Hall of Heroes
                    </CardTitle>
                    <CardDescription>Top supporters this month</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" className="text-xs" asChild><Link href="/donate/leaderboard">View All</Link></Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border/50">
                  {topDonors.map((donor, index) => (
                    <div key={donor.userId} className="flex items-center gap-4 p-4 hover:bg-muted/30 transition-colors">
                      <div className="font-mono font-bold text-lg w-6 text-center text-muted-foreground opacity-50">#{index + 1}</div>
                      <Avatar className={cn("size-10 border-2", index === 0 ? "border-amber-400" : "border-transparent")}>
                        <AvatarImage src={donor.avatar || ''} />
                        <AvatarFallback>{donor.name?.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold truncate">{donor.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">₹{donor.amount.toLocaleString()}</span>
                          {index === 0 && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-bold">Top Donor</span>}
                        </div>
                      </div>
                      <div className={cn("text-xl", medalColors[index])}>
                        {index === 0 ? <Crown className="size-5 fill-current" /> : (index === 1 ? <Medal className="size-5" /> : <Medal className="size-5" />)}
                      </div>
                    </div>
                  ))}

                  {otherDonors.length > 0 && (
                    <div className="bg-muted/10 p-4">
                      <p className="text-xs font-semibold text-muted-foreground uppercase mb-3 px-2">Recent Supporters</p>
                      <div className="space-y-3">
                        {otherDonors.map((donor) => (
                          <div key={donor.userId} className="flex items-center justify-between px-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="size-6">
                                <AvatarImage src={donor.avatar || ''} />
                                <AvatarFallback className="text-[10px]">{donor.name?.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <span className="text-sm font-medium text-muted-foreground">{donor.name}</span>
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">₹{donor.amount}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Target className="size-6 text-blue-200" />
                </div>
                <div>
                  <h4 className="font-bold text-lg mb-1">Make an Impact</h4>
                  <p className="text-blue-100 text-sm leading-relaxed mb-4">
                    Every donation above ₹500 helps us sponsor a sever node for an entire day, keeping the platform free for 1000+ students.
                  </p>
                  <div className="flex -space-x-2 mb-4">
                    <div className="size-8 rounded-full bg-blue-500 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold">1k</div>
                    <div className="size-8 rounded-full bg-indigo-500 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold">5k</div>
                    <div className="size-8 rounded-full bg-purple-500 border-2 border-indigo-600 flex items-center justify-center text-xs font-bold">10k</div>
                  </div>
                  <Button variant="secondary" size="sm" className="w-full font-semibold text-blue-900" onClick={() => {
                    setDonationAmount('500');
                    trackEvent('donation_tier_selected', { amount: 500, label: 'Impact Card' });
                  }}>
                    Donate ₹500 Now
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
