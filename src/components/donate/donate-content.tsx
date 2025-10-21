  'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Heart, Loader2, BookOpen, ShoppingBag, Armchair, IndianRupee, Sparkles, Star, ShieldCheck, Trophy, Medal, Crown, Rocket, Gift, Target, Flame } from 'lucide-react';
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
    { title: "Shared Notes", description: "Keep the knowledge flowing with free access to notes.", icon: BookOpen, href: "/notes" },
    { title: "Marketplace", description: "Enable students to buy and sell without platform fees.", icon: ShoppingBag, href: "/marketplace" },
    { title: "Library Booking", description: "Ensure seamless access to campus study spaces.", icon: Armchair, href: "/booking" },
];

const donationTiers = [
    { amount: 50, title: "📖 Knowledge Giver" },
    { amount: 100, title: "✨ Campus Hero" },
    { amount: 250, title: "🔥 UniNest Champion" },
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
    { id: "shield", goal: 4000, title: "Server Shield", description: "Keeps UniNest blazing fast for everyone.", icon: ShieldCheck },
    { id: "care", goal: 12000, title: "Student Care Fund", description: "Backs emergency micro-scholarships.", icon: Heart },
    { id: "launch", goal: 22000, title: "Launchpad Sprint", description: "Kickstarts student-led innovation events.", icon: Rocket },
];

const dailyQuests = [
    { id: "streak", title: "Keep the Streak Alive", reward: "Hit 25% of goal to earn combo XP.", threshold: 25, icon: Flame },
    { id: "share", title: "Share the Mission", reward: "Invite 3 friends to donate and unlock a bonus drop.", threshold: 50, icon: Gift },
    { id: "aim", title: "Bullseye Challenge", reward: "Reach 80% to unveil premium campus perks.", threshold: 80, icon: Target },
];

const trustBadges = [
    { icon: ShieldCheck, label: 'Secure Razorpay checkout' },
    { icon: Heart, label: 'Direct campus impact' },
    { icon: Star, label: 'Hall of Heroes shoutout' },
];

const medalColors = ["text-amber-400", "text-slate-400", "text-amber-700"];

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
              return updatedDonors.sort((a,b) => b.amount - a.amount);
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
      dailyQuests.forEach(quest => {
          if (progressPercentage >= quest.threshold) {
              updates[quest.id as keyof typeof updates] = true;
          }
      });
      setQuestProgress(prev => ({ ...prev, ...updates }));
  }, [progressPercentage]);

  const recentBoost = useMemo(() => {
      if (lastDonationRef.current >= 250) return 'Mega Boost! We just unlocked a campus innovation grant 🎯';
      if (lastDonationRef.current >= 100) return 'Power Surge! Mentor hours just got extended ⚡';
      if (lastDonationRef.current > 0) return 'Fresh Spark! Another student just got supported ✨';
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
         toast({ variant: 'destructive', title: 'Error Saving Donation', description: result.error || 'Your donation was processed, but we failed to record it. Please contact support.'});
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
        theme: { color: '#1B365D' },
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
  const otherDonors = donors.slice(3);

  return (
    <div className="space-y-16 md:space-y-24 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <section className="text-center space-y-5">
        <span className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-sm font-semibold text-primary">
          <Sparkles className="size-4" /> UniNest Fund
        </span>
        <h1 className="text-4xl md:text-6xl font-headline font-bold primary-gradient bg-clip-text text-transparent">Keep student tools online</h1>
        <p className="mx-auto max-w-xl text-base text-muted-foreground">
          Pick an amount, tap donate, and help UniNest stay live for every campus buddy.
        </p>
        <div className="flex justify-center">
          <Button
            size="lg"
            className="text-lg"
            onClick={() => {
              trackEvent('donation_scroll_to_form');
              document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Donate in 10s ⚡
          </Button>
        </div>
      </section>
      
      {/* Impact Section */}
      <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {impactCards.map(card => (
                 <Link href={card.href} key={card.title}>
                    <Card className="text-center p-6 shadow-lg hover:shadow-2xl transition-shadow hover:-translate-y-2 h-full">
                        <div className="mx-auto bg-primary/10 text-primary size-16 rounded-full flex items-center justify-center mb-4">
                            <card.icon className="size-8" />
                        </div>
                        <h3 className="text-xl font-headline font-bold">{card.title}</h3>
                        <p className="text-muted-foreground">{card.description}</p>
                    </Card>
                 </Link>
              ))}
          </div>
      </section>

      {/* Donation & Leaderboard Section */}
      <div id="donate-section" className="grid lg:grid-cols-2 gap-12 items-start max-w-6xl mx-auto w-full">
        {/* Donation Card */}
        <Card className="shadow-xl lg:shadow-2xl lg:sticky lg:top-24 lg:max-h-[calc(100vh-6rem)] lg:flex lg:flex-col">
          <CardHeader className="lg:flex-none">
            <CardTitle className="text-2xl font-headline">Boost UniNest right now</CardTitle>
            <CardDescription className="text-base">
              Keep notes, bookings, and community spaces running for students everywhere.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 lg:flex-1 lg:overflow-y-auto lg:pr-3">
            <div className="rounded-2xl bg-gradient-to-r from-primary/15 via-primary/5 to-transparent p-5 shadow-sm">
              <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide text-primary">
                <span>Goal progress</span>
                <span>{roundedProgress}% funded</span>
              </div>
              <Progress value={progressPercentage} className="mt-3 h-2.5" />
              <div className="mt-3 flex items-center justify-between text-sm font-semibold">
                <span>₹{raisedAmount.toLocaleString()} raised</span>
                <span className="text-muted-foreground">Target ₹{goalAmount.toLocaleString()}</span>
              </div>
            </div>
            {recentBoost && (
              <div className="rounded-xl border border-primary/40 bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                {recentBoost}
              </div>
            )}
            <div className="grid grid-cols-3 gap-3">
                {donationTiers.map(tier => (
                    <Button 
                        key={tier.amount} 
                        variant="outline"
                        className={cn(
                            "py-6 text-base font-bold transition-all border-2 flex flex-col h-auto",
                            donationAmount === tier.amount.toString() && "primary-gradient text-primary-foreground border-transparent ring-2 ring-primary"
                        )}
                        onClick={() => {
                            setDonationAmount(tier.amount.toString());
                            trackEvent('donation_tier_selected', {
                                amount: tier.amount,
                                label: tier.title,
                            });
                        }}
                    >
                        <span className="text-lg">₹{tier.amount}</span>
                        <span className="text-xs font-normal">{tier.title}</span>
                    </Button>
                ))}
            </div>
            <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                    type="number"
                    placeholder="Or enter a custom amount"
                    className="pl-10 text-center text-lg font-semibold h-14 rounded-xl"
                    value={donationAmount}
                    onChange={(e) => setDonationAmount(e.target.value)}
                />
            </div>
            <Button
              size="lg"
              className="w-full text-lg h-14"
              onClick={() => {
                trackEvent('donation_attempt', {
                  amount: Number(donationAmount) || 0,
                  method: 'razorpay',
                });
                handleDonate(donationAmount);
              }}
              disabled={!isLoaded || isDonating || !donationAmount}
            >
              {isLoaded ? <Sparkles className="mr-2 size-5" /> : <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isDonating ? 'Processing...' : `Donate ₹${donationAmount || 0}`}
            </Button>
            <div className="flex flex-wrap gap-2">
              {milestones.map(milestone => {
                const Icon = milestone.icon ?? Trophy;
                const achieved = milestone.achieved ?? raisedAmount >= milestone.goal;
                return (
                  <div
                    key={milestone.goal}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold',
                      achieved ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground'
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{milestone.title}</span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {trustBadges.map(badge => {
                const Icon = badge.icon;
                return (
                  <div key={badge.label} className="inline-flex items-center gap-2 rounded-full border px-3 py-2">
                    <Icon className="size-3.5 text-primary" />
                    <span className="font-medium">{badge.label}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard Card */}
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl font-headline flex items-center gap-2">
                    <Star className="text-amber-400" />
                    Hall of Heroes
                </CardTitle>
                <CardDescription>Meet the legends fueling UniNest this month.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {topDonors.length > 0 ? topDonors.map((donor, index) => (
                    <div key={donor.userId || index} className="flex items-center gap-4 p-3 rounded-lg bg-primary/10 border-2 border-primary/20">
                       <span className={cn("text-3xl font-bold w-8 text-center", medalColors[index])}>
                         {['🥇', '🥈', '🥉'][index]}
                       </span>
                        <Avatar className="size-12">
                            {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name || 'Anonymous'} data-ai-hint="person face" />}
                            <AvatarFallback className="text-xl">{donor.name?.charAt(0) || 'A'}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <p className="font-bold text-lg text-foreground">{donor.name || 'Anonymous'}</p>
                            <p className="text-sm text-primary font-semibold">₹{donor.amount.toLocaleString()}</p>
                        </div>
                    </div>
                )) : (
                     <div className="text-center text-muted-foreground py-10">
                        <p>Be the first to enter the Hall of Heroes!</p>
                    </div>
                )}
                
                {otherDonors.length > 0 && (
                  <ScrollArea className="h-64">
                    <div className="space-y-4 pr-4">
                        {otherDonors.map((donor, index) => (
                             <div key={donor.userId || index} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                                <div className="flex items-center gap-3">
                                    <Avatar className="size-9">
                                        {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name || 'Anonymous'} data-ai-hint="person face" />}
                                        <AvatarFallback>{donor.name?.charAt(0) || 'A'}</AvatarFallback>
                                    </Avatar>
                                    <p className="font-semibold">{donor.name || 'Anonymous'}</p>
                                </div>
                                <p className="font-medium text-muted-foreground">₹{donor.amount.toLocaleString()}</p>
                             </div>
                        ))}
                    </div>
                  </ScrollArea>
                )}
            </CardContent>
        </Card>
      </div>
      
      {/* Social Quests */}
      <section className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <Card className="border-primary/30">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Flame className="text-primary" /> Daily Quests
                </CardTitle>
                <CardDescription>Complete these missions to unlock campus-wide boosts.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {dailyQuests.map(quest => {
                    const completed = questProgress[quest.id as keyof typeof questProgress];
                    return (
                        <div key={quest.id} className={cn("rounded-xl border px-4 py-3 flex items-center gap-4", completed ? "border-primary/50 bg-primary/10" : "border-border") }>
                            <quest.icon className={cn("size-6", completed && "text-primary")}/>
                            <div className="flex-1">
                                <p className="font-semibold text-foreground">{quest.title}</p>
                                <p className="text-sm text-muted-foreground">{quest.reward}</p>
                            </div>
                            <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", completed ? "bg-primary text-primary-foreground" : "bg-muted") }>
                                {completed ? 'Unlocked' : `${quest.threshold}%`}
                            </span>
                        </div>
                    );
                })}
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ShieldCheck className="text-primary" /> Community Boosters
                </CardTitle>
                <CardDescription>Every stage unlocks new perks for students.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {communityBoosts.map(boost => {
                    const progress = Math.min((raisedAmount / boost.goal) * 100, 100);
                    return (
                        <div key={boost.id} className="space-y-3">
                            <div className="flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                                        <boost.icon className="size-5" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-foreground">{boost.title}</p>
                                        <p className="text-xs text-muted-foreground">{boost.description}</p>
                                    </div>
                                </div>
                                <span className="text-xs font-semibold text-primary">₹{boost.goal.toLocaleString()}</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                        </div>
                    );
                })}
            </CardContent>
        </Card>
      </section>
      
      {/* Footer CTA */}
      <section className="text-center bg-card p-8 md:p-12 rounded-2xl shadow-xl max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold font-headline primary-gradient bg-clip-text text-transparent">Your donation writes the next chapter 📖</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Join our community of supporters and make a direct impact on the student experience.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="text-lg"
              onClick={() => {
                trackEvent('donation_cta_footer');
                document.getElementById('donate-section')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
                Donate Now & Join the Heroes ⚡
            </Button>
            <Button size="lg" variant="outline" onClick={() => router.push('/donate/thank-you')}>
                Explore Hall of Heroes
            </Button>
          </div>
        </section>
    </div>
  );
}

