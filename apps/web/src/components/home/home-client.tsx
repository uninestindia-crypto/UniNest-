'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import Autoplay from 'embla-carousel-autoplay';
import { MessageSquare, Quote, Store, Users, ArrowRight, Star, ShieldCheck, MapPin, type LucideIcon } from 'lucide-react';

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
import dynamic from 'next/dynamic';

// Lazy load DonationModal - it's not needed until 12s after page load
const DonationModal = dynamic(() => import('@/components/home/donation-modal'), { ssr: false });

import { cn } from '@/lib/utils';

// ... (keep iconMap, schemaMarkup, resolveIcon, getInitials, constants same as before if not changing logic)
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

  const heroSlides =
    Array.isArray(config.heroSlides) && config.heroSlides.length > 0
      ? config.heroSlides
      : defaultHomePosterConfig.heroSlides;
  const quickAccessCards =
    Array.isArray(config.quickAccessCards) && config.quickAccessCards.length > 0
      ? config.quickAccessCards
      : defaultHomePosterConfig.quickAccessCards ?? [];
  const curatedCollections =
    Array.isArray(config.curatedCollections) && config.curatedCollections.length > 0
      ? config.curatedCollections
      : defaultHomePosterConfig.curatedCollections ?? [];

  const heroAutoplay = useMemo(() => Autoplay({ delay: 5000, stopOnInteraction: false }), []);
  const testimonialAutoplay = useMemo(() => Autoplay({ delay: 6000, stopOnInteraction: false }), []);
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
    <main className="bg-background text-foreground overflow-x-hidden min-h-screen pb-32 md:pb-24">
      {/* <DonationModal isOpen={donationModalOpen} onOpenChange={handleDonationModalOpenChange} /> */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Hero Section */}
      <section className="relative px-4 pt-6 pb-16 sm:px-6 lg:px-8 lg:pt-12 xl:px-16 overflow-hidden">
        {/* Enhanced Background Elements */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-gradient-to-b from-primary/10 to-transparent blur-3xl opacity-60" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-3xl opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 h-[800px] w-[800px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white/40 via-transparent to-transparent dark:from-white/5 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <Carousel opts={{ align: 'center', loop: true }} plugins={[heroAutoplay]} className="w-full">
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={slide.id ?? `${slide.title}-${index}`} className="w-full">
                  <div className="grid gap-8 lg:gap-16 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-6 lg:space-y-8 animate-in slide-in-from-left duration-700 fade-in">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs sm:text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        {slide.tag || "What's New"}
                      </div>

                      <div className="space-y-4">
                        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-headline font-extrabold leading-[1.1] tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-foreground to-foreground/70 dark:from-white dark:to-white/70">
                          {slide.title}
                        </h1>
                        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl leading-relaxed">
                          {slide.subtitle || "Experience the future of student living with UniNest. Connect, grow, and thrive."}
                        </p>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        {slide.ctaHref && slide.ctaLabel && (
                          <Button size="lg" className="h-14 px-8 text-base font-semibold shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-0.5" asChild>
                            <Link href={slide.ctaHref}>
                              {slide.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {slide.secondaryCtaHref && slide.secondaryCtaLabel && (
                          <Button size="lg" variant="outline" className="h-14 px-8 text-base font-semibold border-primary/20 hover:bg-primary/5 hover:text-primary transition-all" asChild>
                            <Link href={slide.secondaryCtaHref}>{slide.secondaryCtaLabel}</Link>
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-9 w-9 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] overflow-hidden shadow-sm">
                              <Avatar className="h-full w-full">
                                <AvatarFallback className="bg-primary/10 text-primary font-bold">U{i}</AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                        </div>
                        <div>
                          <div className="flex gap-0.5">
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          </div>
                          <span className="font-semibold text-foreground text-xs">Trusted by 10k+ students</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000 mt-8 lg:mt-0">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2rem] border border-white/20 bg-muted/20 shadow-2xl transition-transform duration-500 hover:rotate-1 dark:border-white/5 dark:bg-slate-900/50">
                        {slide.imageUrl ? (
                          <Image
                            src={slide.imageUrl}
                            alt={slide.title}
                            fill
                            priority={index === 0}
                            className="object-cover"
                            sizes="(min-width: 1024px) 600px, 100vw"
                          />
                        ) : (
                          <div className="h-full w-full bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center">
                            <Users className="h-24 w-24 text-primary/20" />
                          </div>
                        )}
                        {/* Glass Overlays for Decorative Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
                      </div>

                      {/* Floating card example */}
                      <div className="absolute -bottom-6 -right-6 hidden sm:flex items-center gap-4 rounded-2xl border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur-xl dark:bg-slate-900/90 dark:border-white/10 animate-bounce-slow max-w-xs">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100/80 text-green-600 dark:bg-green-900/30">
                          <ShieldCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">100% Verified</p>
                          <p className="text-xs text-muted-foreground leading-tight">Every listing checked physically by our team.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {/* Mobile Navigation Dots or Arrows could go here if needed */}
          </Carousel>
        </div>
      </section>

      {/* Trusted By / Stats Strip */}
      {stats.length > 0 && (
        <section className="border-y bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center justify-center text-center sm:items-start sm:text-left transition-transform hover:scale-105 duration-300">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
                    {(() => {
                      const Icon = resolveIcon(stat.icon);
                      return <Icon className="h-6 w-6" />;
                    })()}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold tracking-tight text-foreground">{stat.value}</span>
                    {stat.isPlus && <span className="text-2xl font-bold text-primary">+</span>}
                  </div>
                  <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Access Grid */}
      {quickAccessCards.length > 0 && (
        <section className="py-20 lg:py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center max-w-2xl mx-auto space-y-4">
              <Badge variant="outline" className="rounded-full px-4 py-1 text-sm border-primary/20 text-primary bg-primary/5">Explore Platform</Badge>
              <h2 className="text-3xl font-headline font-bold sm:text-4xl lg:text-5xl">Everything you need</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Your one-stop destination for housing, career growth, and student marketplace.
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccessCards.map((card, index) => (
                <Link
                  key={card.id ?? `${card.title}-${index}`}
                  href={card.href || '#'}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-[2rem] border border-border bg-background shadow-md transition-all hover:shadow-2xl hover:-translate-y-2 h-[420px]"
                >
                  <div className="absolute inset-0 z-0 h-full w-full">
                    {card.imageUrl ? (
                      <Image
                        src={card.imageUrl}
                        alt={card.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                        sizes="(min-width: 1024px) 384px, 100vw"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted/50" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  </div>

                  <div className="relative z-10 p-8 space-y-4">
                    <div className="h-1.5 w-12 rounded-full bg-primary/80 transition-all group-hover:w-20 group-hover:bg-primary" />
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-foreground transition-colors">{card.title}</h3>
                      <p className="text-white/80 line-clamp-2 leading-relaxed">{card.description}</p>
                    </div>
                    <div className="pt-2">
                      <span className="inline-flex items-center text-sm font-bold text-white group-hover:underline decoration-2 underline-offset-4 transition-all">
                        Explore Now <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curated Collections */}
      {curatedCollections.length > 0 && (
        <section className="py-24 relative overflow-hidden bg-muted/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl space-y-2">
                <h2 className="text-3xl font-headline font-bold sm:text-4xl text-foreground">Curated Collections</h2>
                <p className="text-lg text-muted-foreground">Handpicked experiences tailored for your student lifestyle.</p>
              </div>
              <Button variant="ghost" className="hidden md:flex gap-2 text-primary hover:text-primary hover:bg-primary/10">View All <ArrowRight className="h-4 w-4" /></Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {curatedCollections.map((collection, index) => (
                <Link
                  href={collection.href || '#'}
                  key={index}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-card border shadow-sm transition-all hover:shadow-xl hover:border-primary/30"
                >
                  <div className="relative h-60 w-full overflow-hidden">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Store className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      Featured
                    </div>
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{collection.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm flex-1 leading-relaxed">{collection.description}</p>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-sm font-semibold">
                      <span className="text-secondary group-hover:underline">Explore Collection</span>
                      <ArrowRight className="h-4 w-4 text-primary -translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Verified Housing Section */}
      <section className="py-24 bg-background">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative px-4 sm:px-0">
              <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-gradient-to-tr from-primary/20 to-accent/20 p-2 sm:p-4 shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                <div className="h-full w-full rounded-[2rem] bg-card border border-border overflow-hidden relative group">
                  <div className="absolute inset-0 bg-[url('/patterns/map-grid.svg')] opacity-20" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center z-10">
                    <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                      <MapPin className="h-12 w-12 text-primary" />
                    </div>
                    <p className="font-bold text-2xl">Verified Locations</p>
                    <p className="text-sm text-muted-foreground mt-2">Across 5+ Cities</p>
                  </div>
                </div>
                {/* Stats overlay */}
                <div className="absolute bottom-8 right-8 bg-foreground text-background p-5 rounded-2xl shadow-xl z-20">
                  <p className="text-3xl font-extrabold text-primary-foreground">100%</p>
                  <p className="text-xs font-semibold opacity-80">Physically Verified</p>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-8">
              <div className="space-y-4">
                <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 px-3 py-1">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Trusted Housing
                </Badge>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-headline font-bold leading-tight">
                  Book your perfect stay <br className="hidden lg:block" /> with confidence.
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  Say goodbye to uncertain PG hunts. UniNest verifies every listing, owner, and amenity. Compare commute times, check curfew policies, and read genuine reviews from students just like you.
                </p>
              </div>

              <ul className="space-y-4">
                {[
                  "100% Verified Owners & Listings",
                  "Transparent Pricing & No Hidden Fees",
                  "Student Reviews & Safety Badges",
                  "Direct Chat with Landlords"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 hover:bg-muted transition-colors">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="h-12 rounded-xl text-base shadow-lg shadow-primary/20" asChild>
                  <Link href="/marketplace?category=Hostel">Find a PG Now</Link>
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-xl text-base" asChild>
                  <Link href="/hostels">Explore Hostels</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Internships & Competitions Section */}
      <section className="py-24 bg-muted/30 border-t">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16 space-y-4">
            <h2 className="text-3xl font-headline font-bold text-foreground sm:text-4xl">Accelerate your career</h2>
            <p className="text-lg text-muted-foreground">From internships at top startups to national-level hackathons, find opportunities that match your ambition.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Internship Card */}
            <Card className="group overflow-hidden border-none bg-background shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 rounded-3xl">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 h-full">
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6 order-2 lg:order-1">
                    <div className="size-14 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/20 shadow-inner">
                      <Users className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Internship Hub</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Find verified roles with mentorship. Filter by stipend, remote options, and skill requirements.
                      </p>
                    </div>
                    <Button variant="ghost" className="w-fit p-0 h-auto font-bold text-purple-600 hover:text-purple-700 hover:bg-transparent group-hover:translate-x-2 transition-transform" asChild>
                      <Link href="/workspace/internships">Browse Internships <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="relative h-48 lg:h-auto bg-purple-50 dark:bg-purple-900/5 order-1 lg:order-2">
                    <div className="absolute inset-4 rounded-xl border-2 border-dashed border-purple-200 dark:border-purple-800 flex items-center justify-center">
                      <Store className="size-16 text-purple-200" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competition Card */}
            <Card className="group overflow-hidden border-none bg-background shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 rounded-3xl">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 h-full">
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6 order-2 lg:order-1">
                    <div className="size-14 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-900/20 shadow-inner">
                      <Star className="size-7" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-2">Competition Arena</h3>
                      <p className="text-muted-foreground leading-relaxed">
                        Join hackathons and leagues. Form teams, track prizes, and earn certificates for your profile.
                      </p>
                    </div>
                    <Button variant="ghost" className="w-fit p-0 h-auto font-bold text-orange-600 hover:text-orange-700 hover:bg-transparent group-hover:translate-x-2 transition-transform" asChild>
                      <Link href="/workspace/competitions">View Challenges <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="relative h-48 lg:h-auto bg-orange-50 dark:bg-orange-900/5 order-1 lg:order-2">
                    <div className="absolute inset-4 rounded-xl border-2 border-dashed border-orange-200 dark:border-orange-800 flex items-center justify-center">
                      <Star className="size-16 text-orange-200" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24 sm:py-32">
        <div className="absolute inset-0 bg-primary -z-20" />
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 -z-10" />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] bg-white/10 blur-[100px] rounded-full" />
        <div className="absolute -bottom-40 -left-40 h-[500px] w-[500px] bg-secondary/20 blur-[100px] rounded-full" />

        <div className="mx-auto max-w-4xl px-4 text-center">
          <Badge className="bg-white/20 text-white hover:bg-white/30 border-none backdrop-blur-md mb-6 px-4 py-1.5 text-sm font-medium">✨ Join the Revolution</Badge>
          <h2 className="text-4xl font-headline font-extrabold text-white sm:text-5xl lg:text-6xl tracking-tight">
            Ready to upgrade your <br /> campus life?
          </h2>
          <p className="mx-auto mt-8 max-w-2xl text-xl text-primary-foreground/90 leading-relaxed font-light">
            Join the community today. Access exclusive internships, find verified housing, and connect with peers across India.
          </p>
          <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-16 px-10 text-lg font-bold rounded-2xl shadow-2xl hover:scale-105 transition-transform" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-lg font-bold rounded-2xl bg-transparent text-white border-white/40 hover:bg-white/10 hover:text-white hover:border-white transition-all" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

