'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { MessageSquare, Quote, Store, Users, type LucideIcon } from 'lucide-react';

import StatCard from '@/components/home/stat-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { Card, CardContent } from '@/components/ui/card';
import { defaultHomePosterConfig } from '@/lib/home-poster';
import type { HomePosterConfig, HomeStat, HomeTestimonial } from '@/lib/types';
import DonationModal from '@/components/home/donation-modal';
import StealthAppDownload from '@/components/stealth-app-download';

const iconMap: Record<string, LucideIcon> = {
  users: Users,
  store: Store,
  'message-square': MessageSquare,
};

const schemaMarkup = {
  '@context': 'https://schema.org',
  '@type': 'EducationalOrganization',
  name: 'UniNest',
  url: 'https://uninest.in',
  description:
    'UniNest is a student community platform offering verified PG booking, internships, competitions, and marketplace tools for college students in India.',
  sameAs: [
    'https://www.aicte-india.org/',
    'https://ndl.iitkgp.ac.in/',
    'https://www.nirfindia.org/',
  ],
  department: {
    '@type': 'LocalBusiness',
    name: 'UniNest Housing and Vendor Network',
    areaServed: 'India',
    makesOffer: [
      'Verified PG booking',
      'Hostel discovery',
      'Library seat booking',
      'Student marketplace listings',
    ],
  },
  event: {
    '@type': 'Event',
    name: 'UniNest Competition Arena',
    eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
    eventStatus: 'https://schema.org/EventScheduled',
    description:
      'National-level student competitions, hackathons, and cultural festivals hosted on UniNest.',
  },
  knowsAbout: [
    'student community platform',
    'verified PG booking',
    'student internship portal',
    'college competition platform',
    'real-time library seat booking',
    'student marketplace app',
  ],
};

const resolveIcon = (icon: HomeStat['icon']): LucideIcon => {
  if (typeof icon === 'function') {
    return icon;
  }

  if (typeof icon === 'string') {
    const normalized = icon.toLowerCase();
    if (normalized in iconMap) {
      return iconMap[normalized];
    }
  }

  return Users;
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
    .slice(0, 2);
};

const DONATION_PROMPT_DISMISSED_UNTIL_KEY = 'uninest-donation-prompt-dismissed-until';
const DONATION_PROMPT_DELAY_MS = 12_000;
const DONATION_DISMISS_TTL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days

type HomeClientProps = {
  posterConfig?: HomePosterConfig;
};

export default function HomeClient({ posterConfig }: HomeClientProps) {
  const config = posterConfig ?? defaultHomePosterConfig;
  const stats: HomeStat[] =
    Array.isArray(config.stats) && config.stats.length > 0
      ? config.stats
      : defaultHomePosterConfig.stats ?? [];
  const testimonials: HomeTestimonial[] =
    Array.isArray(config.testimonials) && config.testimonials.length > 0
      ? config.testimonials
      : defaultHomePosterConfig.testimonials ?? [];

  const autoplayPlugin = useMemo(() => Autoplay({ delay: 6000, stopOnInteraction: false }), []);
  const [donationModalOpen, setDonationModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return undefined;
    }

    const storage = window.localStorage;
    const dismissedUntilRaw = storage.getItem(DONATION_PROMPT_DISMISSED_UNTIL_KEY);
    const dismissedUntil = dismissedUntilRaw ? Number(dismissedUntilRaw) : Number.NaN;

    if (Number.isFinite(dismissedUntil) && dismissedUntil > Date.now()) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setDonationModalOpen(true), DONATION_PROMPT_DELAY_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  const handleDonationModalOpenChange = (open: boolean) => {
    setDonationModalOpen(open);

    if (!open && typeof window !== 'undefined') {
      const nextEligible = Date.now() + DONATION_DISMISS_TTL_MS;
      window.localStorage.setItem(DONATION_PROMPT_DISMISSED_UNTIL_KEY, nextEligible.toString());
    }
  };

  return (
    <main className="bg-background text-foreground">
      <DonationModal isOpen={donationModalOpen} onOpenChange={handleDonationModalOpenChange} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <section className="flex min-h-[calc(100vh-4rem)] items-center px-4 py-16 sm:min-h-[calc(100vh-5rem)] sm:px-6 lg:min-h-[75vh] lg:px-10 xl:px-16">
        <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.15fr_minmax(280px,1fr)]">
          <div className="space-y-6">
            <span className="inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              India's trusted student community platform
            </span>
            <h1 className="text-4xl font-headline font-bold leading-tight sm:text-5xl lg:text-[3.25rem]">
              UniNest keeps campus life simple, safe, and full of possibilities.
            </h1>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Discover verified hostels and PGs, reserve study spaces on demand, land real internships, compete in national contests, and trade safely with peers. UniNest brings every trusted campus service into one confident, modern super app built for student growth.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button size="lg" className="text-base" asChild>
                <Link href="/signup">Join UniNest Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base" asChild>
                <Link href="/housing">Explore Verified PGs</Link>
              </Button>
            </div>
            <StealthAppDownload />
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
                <p className="text-3xl font-bold">10k+</p>
                <p className="text-sm text-muted-foreground">Students rely on UniNest for housing and opportunities.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
                <p className="text-3xl font-bold">480+</p>
                <p className="text-sm text-muted-foreground">Verified vendors, hostels, and co-study partners onboarded.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-background/80 p-5 shadow-sm">
                <p className="text-3xl font-bold">3200+</p>
                <p className="text-sm text-muted-foreground">Daily campus interactions tracked with transparent analytics.</p>
              </div>
            </div>
          </div>
          <aside className="space-y-6 rounded-3xl border border-border/60 bg-muted/40 p-8 shadow-lg">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold">Why students choose UniNest</h2>
              <p className="text-sm text-muted-foreground">
                All listings and programs pass compliance checks inspired by{' '}
                <a
                  href="https://www.aicte-india.org/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  AICTE
                </a>{' '}
                and curated data from the{' '}
                <a
                  href="https://ndl.iitkgp.ac.in/"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  National Digital Library of India
                </a>
                .
              </p>
            </div>
            <ul className="space-y-4 text-sm text-muted-foreground">
              <li className="rounded-2xl bg-background/80 p-4 shadow-sm">
                <span className="block text-base font-semibold text-foreground">Verified PG booking and hostel discovery</span>
                <span>Match with accredited accommodations near NIRF-recognized institutes in minutes.</span>
              </li>
              <li className="rounded-2xl bg-background/80 p-4 shadow-sm">
                <span className="block text-base font-semibold text-foreground">Real-time library seat booking</span>
                <span>Reserve quiet zones or collaborative pods with just-in-time availability updates.</span>
              </li>
              <li className="rounded-2xl bg-background/80 p-4 shadow-sm">
                <span className="block text-base font-semibold text-foreground">Student marketplace safeguards</span>
                <span>Trade essentials securely with escrow-style payments and ID-verified peers.</span>
              </li>
            </ul>
            <Button variant="secondary" className="w-full" asChild>
              <Link href="/vendor-dashboard">Partner with UniNest</Link>
            </Button>
          </aside>
        </div>
      </section>

      {stats.length > 0 && (
        <section className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
          <div className="mx-auto max-w-6xl space-y-8">
            <div className="text-center space-y-3">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Trusted Growth</span>
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Numbers that reflect UniNest confidence</h2>
              <p className="text-muted-foreground">
                Students, vendors, and partners rely on UniNest every day. These live metrics showcase our expanding, trusted community.
              </p>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((stat, index) => (
                <StatCard
                  key={`${stat.label}-${index}`}
                  value={stat.value}
                  label={stat.label}
                  icon={resolveIcon(stat.icon)}
                  isPlus={stat.isPlus}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="border-t border-border/60 bg-muted/30 px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-5xl space-y-6 text-center">
          <h2 className="text-3xl font-headline font-bold">About UniNest</h2>
          <p className="text-lg text-muted-foreground">
            UniNest is the student community platform designed to centralize campus life. From verified housing to vendor partnerships and collaborative study spaces, we combine technology, student feedback, and institutional oversight to keep every decision informed and trustworthy.
          </p>
          <p className="text-lg text-muted-foreground">
            Get guided workflows, moderator-backed listings, and transparent analytics that show how your campus interactions evolve. UniNest ensures every member experiences modern design, soft pastel highlights, and mobile-first usability on any device.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/about">Discover the UniNest Story</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild>
              <Link href="/study-spaces">Browse Study Spaces</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-2">
          <div className="space-y-5">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Internship Hub</span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">Turn ambition into real experience.</h2>
            <p className="text-lg text-muted-foreground">
              The UniNest internship portal curates opportunities from verified companies and fast-growing startups. Each project includes mentor credentials, skill pathways, and realistic timelines so you can prepare with confidence.
            </p>
            <p className="text-lg text-muted-foreground">
              Pair internship applications with prep materials, interview templates, and peer review loops. Sync schedules with your UniNest planner to balance classes, competitions, and part-time roles smoothly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/internships">Explore Internships</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/study-spaces">Plan Your Study Schedule</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-5">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Competition Arena</span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">Compete, win, and showcase your edge.</h2>
            <p className="text-lg text-muted-foreground">
              Join hackathons, case study leagues, innovation challenges, and national cultural events without chasing scattered forms. UniNest highlights eligibility, prizes, and mentor access in one structured hub.
            </p>
            <p className="text-lg text-muted-foreground">
              Rally teammates through collaboration spaces, share live updates, and store badges plus certificates on your profile. Every participation record strengthens your placement readiness and scholarship profile.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/competitions">Discover Competitions</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/social">Create a Team Space</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border/60 bg-muted/20 px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-6xl grid gap-12 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Verified Housing & Study Spaces</span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">Book stays and seats with total certainty.</h2>
            <p className="text-lg text-muted-foreground">
              Browse hostel and PG listings audited by UniNest moderators. Compare commute times, amenities, curfew policies, and student reviews pulled from trusted communities. Every listing includes transparent pricing and verified owner details.
            </p>
            <p className="text-lg text-muted-foreground">
              Need a quiet desk before exams? Reserve real-time library seats, co-study lounges, or focus pods that sync with your calendar. Automated reminders prevent double-booking so you can stay on track.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/housing">Find PGs Near You</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/study-spaces">Book a Library Seat</Link>
              </Button>
            </div>
          </div>
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Student Marketplace</span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">Swap essentials safely within your campus.</h2>
            <p className="text-lg text-muted-foreground">
              The UniNest student marketplace verifies every profile before transactions go live. Buy or rent textbooks, lab gear, gadgets, or event tickets using escrow-style payments that release funds only after inspection is confirmed.
            </p>
            <p className="text-lg text-muted-foreground">
              Vendor partners get access to analytics, promotional tools, and CRM insights via the vendor dashboard. Promote services, launch student-only offers, and monitor campaign performance in real time.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/marketplace">Browse the Marketplace</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vendor-dashboard">Access Vendor Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
          <div className="mx-auto max-w-5xl space-y-10 text-center">
            <div className="space-y-3">
              <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">Community Voices</span>
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Students who thrive with UniNest</h2>
              <p className="text-muted-foreground">
                Hear how UniNest simplifies housing, internships, competitions, and social life directly from real users.
              </p>
            </div>
            <Carousel opts={{ align: 'center', loop: true }} plugins={[autoplayPlugin]} className="w-full">
              <CarouselContent>
                {testimonials.map((testimonial, index) => (
                  <CarouselItem key={`${testimonial.name}-${index}`} className="md:basis-1/2 lg:basis-1/3">
                    <Card className="h-full border border-border/60 bg-background/90 shadow-md">
                      <CardContent className="flex h-full flex-col gap-6 p-6 text-left">
                        <Quote className="size-10 text-primary" />
                        <p className="text-base text-muted-foreground">“{testimonial.quote}”</p>
                        <div className="mt-auto flex items-center gap-3">
                          <Avatar className="size-12">
                            {testimonial.avatar ? (
                              <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                            ) : (
                              <AvatarFallback>{getInitials(testimonial.name)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <p className="font-semibold text-foreground">{testimonial.name}</p>
                            <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-6 flex items-center justify-center gap-3">
                <CarouselPrevious className="relative" />
                <CarouselNext className="relative" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      <section className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-5xl space-y-6 text-center">
          <h2 className="text-3xl font-headline font-bold">Grow with UniNest Today</h2>
          <p className="text-lg text-muted-foreground">
            Create your UniNest profile, sync your preferences, and unlock instant access to PG booking tools, the internship hub, the competition arena, and the marketplace. Our support team guides first-time users through onboarding so you can start exploring in minutes.
          </p>
          <p className="text-lg text-muted-foreground">
            We continually add features requested by the community—skill badges, volunteering boards, analytics dashboards, and more. Your feedback fuels a trusted platform that champions student experience, expertise, authoritativeness, and trustworthiness.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="text-base" asChild>
              <Link href="/signup">Join Now</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-base" asChild>
              <Link href="/internships">Start with Internships</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/housing">Find PGs Near You</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1.5fr,1fr]">
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Housing & Study Tools
            </span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">
              Book stays and seats with total certainty.
            </h2>
            <p className="text-lg text-muted-foreground">
              Browse hostel and PG listings audited by UniNest moderators. Compare commute times, amenities, curfew policies, and student reviews pulled from trusted communities. Every listing includes transparent pricing and verified owner details.
            </p>
            <p className="text-lg text-muted-foreground">
              Need a quiet desk before exams? Reserve real-time library seats, co-study lounges, or focus pods that sync with your calendar. Automated reminders prevent double-booking so you can stay on track.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/housing">Find PGs Near You</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/study-spaces">Book a Library Seat</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-primary/5 p-6 shadow-inner">
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-primary">Why students trust UniNest</h3>
              <ul className="space-y-2 text-sm text-primary/80">
                <li>Verified owners and transparent pricing on every listing</li>
                <li>Attendance and slot reminders for study reservations</li>
                <li>Peer reviews and safety badges curated by moderators</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-border bg-background px-4 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr,1fr]">
          <div className="space-y-6">
            <span className="text-sm font-semibold uppercase tracking-[0.3em] text-primary">
              Student Marketplace
            </span>
            <h2 className="text-3xl font-headline font-bold sm:text-4xl">
              Swap essentials safely within your campus.
            </h2>
            <p className="text-lg text-muted-foreground">
              The UniNest student marketplace verifies every profile before transactions go live. Buy or rent textbooks, lab gear, gadgets, or event tickets using escrow-style payments that release funds only after inspection is confirmed.
            </p>
            <p className="text-lg text-muted-foreground">
              Vendor partners get access to analytics, promotional tools, and CRM insights via the vendor dashboard. Promote services, launch student-only offers, and monitor campaign performance in real time.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/marketplace">Browse the Marketplace</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/vendor-dashboard">Access Vendor Dashboard</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-3xl border border-primary/20 bg-card p-6 shadow-lg">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Marketplace perks</h3>
              <p className="text-sm text-muted-foreground">
                Escrow-backed payments, campus delivery partners, and reputation scores keep peer-to-peer trades trustworthy.
              </p>
              <p className="text-sm text-muted-foreground">
                Vendors unlock tier badges, promo scheduling, and AI listing optimization tuned for student preferences.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-5xl space-y-6 text-center">
          <h2 className="text-3xl font-headline font-bold">Grow with UniNest Today</h2>
          <p className="text-lg text-muted-foreground">
            Create your UniNest profile, sync your preferences, and unlock instant access to PG booking tools, the internship hub, the competition arena, and the marketplace. Our support team guides first-time users through onboarding so you can start exploring in minutes.
          </p>
          <p className="text-lg text-muted-foreground">
            We continually add features requested by the community—skill badges, volunteering boards, analytics dashboards, and more. Your feedback fuels a trusted platform that champions student experience, expertise, authoritativeness, and trustworthiness.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="text-base" asChild>
              <Link href="/signup">Join Now</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-base" asChild>
              <Link href="/internships">Start with Internships</Link>
            </Button>
            <Button size="lg" variant="outline" className="text-base" asChild>
              <Link href="/housing">Find PGs Near You</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );

}
