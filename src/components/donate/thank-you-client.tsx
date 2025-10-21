
'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/hooks/use-auth';
import { trackEvent } from '@/lib/analytics';
import { Users, BookOpen, Library, Star, Share2, Rocket } from 'lucide-react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useWindowSize } from 'react-use';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Confetti = dynamic(() => import('react-confetti'), { ssr: false });

type ImpactStats = {
  studentsHelped: number;
  notesShared: number;
  librariesDigitized: number;
};

type Donor = {
  name: string;
  avatar: string | null;
  amount: number;
};

type DonationStatsResponse = {
  goal: {
    amount: number;
    raised: number;
    progress: number;
  };
  impact: ImpactStats;
  donors: {
    leaderboard: {
      userId: string;
      name: string;
      avatar: string | null;
      total: number;
    }[];
    recent: Donor[];
  };
  milestones: {
    goal: number;
    title: string;
    achieved: boolean;
  }[];
};

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const INSTALL_STORAGE_KEY = 'uninest-pwa-install-dismissed';

// --- Helper Functions & Components ---

const getBadgeForAmount = (amount: number) => {
  if (amount >= 250) {
    return { name: '🔥 UniNest Champion', icon: '🏆', color: 'text-amber-400' };
  }
  if (amount >= 100) {
    return { name: '✨ Campus Hero', icon: '🦸', color: 'text-sky-400' };
  }
  return { name: '📖 Knowledge Giver', icon: '📚', color: 'text-green-400' };
};

const AnimatedCounter = ({ to }: { to: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const duration = 1500; // ms
    const frameRate = 1000 / 60; // 60fps
    const totalFrames = Math.round(duration / frameRate);
    let frame = 0;

    const counter = setInterval(() => {
      frame++;
      const progress = frame / totalFrames;
      const currentCount = Math.round(to * progress);
      setCount(currentCount);

      if (frame === totalFrames) {
        clearInterval(counter);
      }
    }, frameRate);

    return () => clearInterval(counter);
  }, [to]);

  return <span className="font-bold">{count.toLocaleString()}</span>;
};

// --- Main Component ---

export default function ThankYouClient() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [stats, setStats] = useState<DonationStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const deferredPromptRef = useRef<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Trigger confetti on mount
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), 8000); // Stop confetti after 8 seconds
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/donations/stats');
        if (!response.ok) {
          throw new Error('Failed to load donation stats');
        }
        const data = (await response.json()) as DonationStatsResponse;
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('[thank-you-client] stats load failed', err);
        setError('We could not load the latest impact stats.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const storage = window.localStorage;
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;

    if (isStandalone) {
      storage.setItem(INSTALL_STORAGE_KEY, 'installed');
      setShowInstallBanner(false);
    }

    const handleBeforeInstallPrompt = (event: Event) => {
      const promptEvent = event as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      const status = storage.getItem(INSTALL_STORAGE_KEY);
      if (status === 'dismissed' || status === 'installed') {
        return;
      }
      deferredPromptRef.current = promptEvent;
      setShowInstallBanner(true);
    };

    const handleAppInstalled = () => {
      storage.setItem(INSTALL_STORAGE_KEY, 'installed');
      deferredPromptRef.current = null;
      setShowInstallBanner(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    const status = storage.getItem(INSTALL_STORAGE_KEY);
    if (!deferredPromptRef.current && !status) {
      const isiOS = /iphone|ipad|ipod/i.test(window.navigator.userAgent);
      if (isiOS && !isStandalone) {
        setShowInstallBanner(true);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (typeof window === 'undefined') {
      return;
    }

    const storage = window.localStorage;
    const promptEvent = deferredPromptRef.current;

    if (promptEvent) {
      await promptEvent.prompt();
      const { outcome } = await promptEvent.userChoice;
      const status = outcome === 'accepted' ? 'installed' : 'dismissed';
      storage.setItem(INSTALL_STORAGE_KEY, status);
      deferredPromptRef.current = null;
      setShowInstallBanner(status !== 'installed');
      return;
    }

    const isiOS = typeof navigator !== 'undefined' && /iphone|ipad|ipod/i.test(navigator.userAgent);
    const fallbackUrl = isiOS
      ? 'https://support.apple.com/en-in/HT208982'
      : 'https://support.google.com/chrome/answer/9658361';
    window.open(fallbackUrl, '_blank', 'noopener');
    storage.setItem(INSTALL_STORAGE_KEY, 'dismissed');
    setShowInstallBanner(false);
  };

  const handleDismissInstall = () => {
    if (typeof window === 'undefined') {
      return;
    }

    window.localStorage.setItem(INSTALL_STORAGE_KEY, 'dismissed');
    deferredPromptRef.current = null;
    setShowInstallBanner(false);
  };

  const amount = Number(searchParams.get('amount') || '50');
  const isAnonymous = searchParams.get('anonymous') === 'true';
  const donorName = isAnonymous ? 'A kind soul' : user?.user_metadata?.full_name || 'Campus Hero';
  const badge = getBadgeForAmount(amount);

  const shareText = `I just fueled the future at UniNest by becoming a ${badge.name}! Join me in supporting our student community. 🚀`;

  const impactCounters = useMemo(() => {
    return stats?.impact ?? {
      studentsHelped: 0,
      notesShared: 0,
      librariesDigitized: 0,
    };
  }, [stats?.impact]);

  const goalProgress = stats?.goal.progress ?? 0;
  const recentDonors = stats?.donors.recent ?? [];

  return (
    <>
      {showInstallBanner && (
        <div className="fixed bottom-6 left-4 right-4 z-50 sm:left-auto sm:right-6 sm:w-96 rounded-2xl border border-white/20 bg-slate-950/90 px-5 py-4 shadow-2xl backdrop-blur">
          <div className="flex items-start gap-4">
            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-white">Install UniNest</p>
              <p className="text-xs text-slate-200">
                Add this experience to your home screen to access bookings and campaigns in one tap.
              </p>
            </div>
            <div className="flex flex-shrink-0 gap-2">
              <Button variant="ghost" size="sm" className="text-xs text-slate-200" onClick={handleDismissInstall}>
                Later
              </Button>
              <Button size="sm" className="text-xs" onClick={handleInstallClick}>
                Install
              </Button>
            </div>
          </div>
        </div>
      )}
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />}
      {error && (
        <div className="max-w-2xl mx-auto text-center text-sm text-amber-500">
          {error}
        </div>
      )}
      <div className="max-w-2xl mx-auto space-y-12 py-8 text-center">
        {/* 1. Thank You Section */}
        <section className="space-y-3">
          <h1 className="text-4xl md:text-5xl font-headline font-bold primary-gradient bg-clip-text text-transparent">
            {isAnonymous ? 'A kind soul just made a difference 🙏' : `Thank you, ${donorName}! 🌟`}
          </h1>
          <p className="text-lg text-muted-foreground">
            You just unlocked a brighter campus for thousands of students.
          </p>
        </section>

        {/* 2. Contribution Badge */}
        <section>
          <Card className="bg-card/50 backdrop-blur-sm inline-block p-6 shadow-xl animate-in fade-in-50 zoom-in-90 duration-700">
            <div className="flex flex-col items-center gap-4">
              <span className="text-6xl animate-bounce [animation-delay:500ms]">{badge.icon}</span>
              <div>
                <p className="text-sm text-muted-foreground">YOU'VE UNLOCKED THE</p>
                <h2 className={`text-2xl font-bold font-headline ${badge.color}`}>{badge.name}</h2>
              </div>
              <p className="text-muted-foreground mt-2">You’re now a Campus Hero ✨ — wear your badge proudly!</p>
            </div>
          </Card>
        </section>

        {/* 3. Impact Highlights */}
        <section className="space-y-6">
           <h2 className="text-3xl font-bold font-headline">Your Real-World Impact</h2>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
               <Card>
                  <CardContent className="p-4">
                      <Users className="size-8 mx-auto text-primary mb-2"/>
                      <p className="text-2xl">
                        {loading ? '—' : <AnimatedCounter to={impactCounters.studentsHelped} />}
                      </p>
                      <p className="text-sm text-muted-foreground">Students Helped</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-4">
                      <BookOpen className="size-8 mx-auto text-primary mb-2"/>
                      <p className="text-2xl">
                        {loading ? '—' : <AnimatedCounter to={impactCounters.notesShared} />}
                      </p>
                      <p className="text-sm text-muted-foreground">Notes Shared</p>
                  </CardContent>
               </Card>
               <Card>
                  <CardContent className="p-4">
                      <Library className="size-8 mx-auto text-primary mb-2"/>
                       <p className="text-2xl">
                        {loading ? '—' : <AnimatedCounter to={impactCounters.librariesDigitized} />}
                       </p>
                      <p className="text-sm text-muted-foreground">Libraries Digitized</p>
                  </CardContent>
               </Card>
           </div>
        </section>

        {/* 4. Community Impact Banner */}
        <section className="w-full">
            <h2 className="text-3xl font-bold font-headline mb-4">Join a Movement of Heroes</h2>
            <p className="text-muted-foreground mb-6">You're building the future of UniNest, one contribution at a time.</p>
             <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-lg mx-auto">
                <CarouselContent>
                    {(recentDonors.length > 0 ? recentDonors : [{ name: 'Anonymous Hero', avatar: null, amount: 0 }]).map((donor, index) => (
                      <CarouselItem key={`${donor.name}-${index}`} className="basis-1/3 sm:basis-1/4">
                          <div className="flex flex-col items-center gap-2">
                               <Avatar className="size-16 border-2 border-primary/50">
                                  {donor.avatar && <AvatarImage src={donor.avatar} alt={donor.name} width={64} height={64} data-ai-hint="person face" />}
                                  <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <p className="font-semibold text-sm">{donor.name}</p>
                          </div>
                      </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious className="hidden sm:flex" />
                <CarouselNext className="hidden sm:flex" />
            </Carousel>
        </section>

        {/* 5. Repeat Donation Teaser */}
        <section className="bg-card rounded-2xl p-8 shadow-xl">
            <h2 className="text-2xl font-bold font-headline mb-3">Keep the Momentum Going! ⚡</h2>
            <p className="text-muted-foreground">
              We’re at <span className="font-bold text-primary">{loading ? '—' : `${Math.round(goalProgress)}%`}</span> of this month’s target to keep UniNest running ad-free!
            </p>
            <Progress value={goalProgress} className="my-4 h-3" />
            <p className="text-sm text-muted-foreground mb-6">Help us reach 100% to unlock free premium features for all students. 🎉</p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                 <Button size="lg" asChild>
                    <Link
                      href="/donate"
                      onClick={() => trackEvent('donation_thankyou_donate_again_click', { amount })}
                    >
                        <Rocket className="mr-2"/>
                        Donate Again
                    </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${'https://uninest.app'}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => trackEvent('donation_thankyou_share_click', { platform: 'twitter', amount })}
                    >
                        <Share2 className="mr-2"/>
                        Share Your Impact
                    </a>
                </Button>
            </div>
        </section>
      </div>
    </>
  );
}
