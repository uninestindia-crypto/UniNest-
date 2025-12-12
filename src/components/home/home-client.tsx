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
import DonationModal from '@/components/home/donation-modal';
import StealthAppDownload from '@/components/stealth-app-download';
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
    <main className="bg-background text-foreground overflow-x-hidden">
      <DonationModal isOpen={donationModalOpen} onOpenChange={handleDonationModalOpenChange} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      {/* Hero Section */}
      <section className="relative px-4 pt-10 pb-20 sm:px-6 lg:px-8 lg:pt-16 xl:px-16 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 -z-10 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 left-0 -z-10 h-[500px] w-[500px] rounded-full bg-accent/5 blur-3xl" />

        <div className="mx-auto max-w-7xl">
          <Carousel opts={{ align: 'center', loop: true }} plugins={[heroAutoplay]} className="w-full">
            <CarouselContent>
              {heroSlides.map((slide, index) => (
                <CarouselItem key={slide.id ?? `${slide.title}-${index}`} className="w-full">
                  <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
                    <div className="space-y-8 animate-fade-in-up">
                      <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary shadow-sm backdrop-blur-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse"></span>
                        {slide.tag || "What's New"}
                      </div>

                      <div className="space-y-4">
                        <h1 className="text-4xl font-headline font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl text-gradient">
                          {slide.title}
                        </h1>
                        <p className="text-lg text-muted-foreground sm:text-xl max-w-lg leading-relaxed">
                          {slide.subtitle || "Experience the future of student living with UniNest. Connect, grow, and thrive."}
                        </p>
                      </div>

                      <div className="flex flex-wrap gap-4">
                        {slide.ctaHref && slide.ctaLabel && (
                          <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 transition-all hover:scale-105 hover:shadow-primary/30" asChild>
                            <Link href={slide.ctaHref}>
                              {slide.ctaLabel} <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                        {slide.secondaryCtaHref && slide.secondaryCtaLabel && (
                          <Button size="lg" variant="outline" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5 transition-all hover:scale-105" asChild>
                            <Link href={slide.secondaryCtaHref}>{slide.secondaryCtaLabel}</Link>
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-sm text-muted-foreground pt-4">
                        <div className="flex -space-x-3">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-8 w-8 rounded-full border-2 border-background bg-muted flex items-center justify-center text-[10px] overflow-hidden">
                              <Avatar className="h-full w-full">
                                <AvatarFallback className="bg-primary/10 text-primary">U{i}</AvatarFallback>
                              </Avatar>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-1">
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                          <span className="ml-1 font-medium text-foreground">5.0 from students</span>
                        </div>
                      </div>
                    </div>

                    <div className="relative mx-auto w-full max-w-[500px] lg:max-w-none perspective-1000">
                      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-white/20 bg-muted/20 shadow-2xl transition-transform duration-500 hover:rotate-1">
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
                          <div className="h-full w-full bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center">
                            <Users className="h-24 w-24 text-muted-foreground/20" />
                          </div>
                        )}
                        {/* Glass Overlays for Decorative Effect */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                        <div className="absolute -bottom-6 -right-6 h-24 w-24 rounded-full bg-secondary/20 blur-2xl" />
                        <div className="absolute -top-6 -left-6 h-24 w-24 rounded-full bg-primary/20 blur-2xl" />
                      </div>
                      {/* Floating card example */}
                      <div className="absolute -bottom-6 -left-6 hidden sm:flex items-center gap-3 rounded-2xl border border-white/20 bg-white/80 p-4 shadow-xl backdrop-blur-md dark:bg-slate-900/80 dark:border-white/10 animate-bounce-slow">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                          <ShieldCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold">Verified</p>
                          <p className="text-xs text-muted-foreground">Listings Checked</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <div className="mt-8 flex justify-center gap-2 lg:hidden">
              <CarouselPrevious className="static translate-y-0" />
              <CarouselNext className="static translate-y-0" />
            </div>
          </Carousel>
        </div>
      </section>

      {/* Trusted By / Stats Strip (Replaces old stats section) */}
      {stats.length > 0 && (
        <section className="border-y border-border bg-muted/30 py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
              {stats.map((stat, index) => (
                <div key={index} className="flex flex-col items-center justify-center text-center sm:items-start sm:text-left">
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    {(() => {
                      const Icon = resolveIcon(stat.icon);
                      return <Icon className="h-5 w-5" />;
                    })()}
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight text-foreground">{stat.value}</span>
                    {stat.isPlus && <span className="text-2xl font-bold text-primary">+</span>}
                  </div>
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Quick Access Grid */}
      {quickAccessCards.length > 0 && (
        <section className="py-24 bg-background">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mb-12 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-headline font-bold sm:text-4xl">Explore UniNest</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Your gateway to verified student housing, internships, and exclusive campus deals.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {quickAccessCards.map((card, index) => (
                <Link
                  key={card.id ?? `${card.title}-${index}`}
                  href={card.href || '#'}
                  className="group relative flex flex-col justify-end overflow-hidden rounded-3xl border border-border bg-background shadow-sm transition-all hover:shadow-2xl hover:-translate-y-1 h-[400px]"
                >
                  {/* Background Image */}
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                  </div>

                  {/* Content */}
                  <div className="relative z-10 p-8">
                    <div className="mb-4 h-1 w-12 rounded-full bg-primary transition-all group-hover:w-20" />
                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-foreground/90 transition-colors">{card.title}</h3>
                    <p className="text-white/80 line-clamp-2 mb-4">{card.description}</p>
                    <span className="inline-flex items-center text-sm font-semibold text-white/90 group-hover:text-primary-foreground group-hover:translate-x-1 transition-all">
                      Discover <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Curated Collections (Glassmorphism Cards) */}
      {curatedCollections.length > 0 && (
        <section className="py-24 relative overflow-hidden">
          {/* Subtle bg blob */}
          <div className="absolute top-1/2 left-1/2 -z-10 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[100px]" />

          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <h2 className="text-3xl font-headline font-bold sm:text-4xl">Featured Collections</h2>
                <p className="mt-4 text-lg text-muted-foreground">Curated experiences handpicked for your student life.</p>
              </div>
              <Button variant="ghost" className="hidden md:flex gap-2">View All Collection <ArrowRight className="h-4 w-4" /></Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {curatedCollections.map((collection, index) => (
                <Link
                  href={collection.href || '#'}
                  key={index}
                  className="group flex flex-col overflow-hidden rounded-2xl glass transition-all hover:shadow-xl hover:border-primary/30"
                >
                  <div className="relative h-56 w-full overflow-hidden">
                    {collection.imageUrl ? (
                      <Image
                        src={collection.imageUrl}
                        alt={collection.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="h-full w-full bg-muted flex items-center justify-center">
                        <Store className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">{collection.title}</h3>
                    <p className="mt-2 text-muted-foreground text-sm flex-1">{collection.description}</p>
                    <div className="mt-4 pt-4 border-t border-border/50 flex items-center justify-between text-sm font-medium">
                      <span className="text-secondary">Premium Collection</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary -translate-x-2 group-hover:translate-x-0 opacity-0 group-hover:opacity-100 transition-all" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Primary Value Prop: Verified Housing */}
      <section className="py-24 bg-muted/20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              {/* Abstract graphic or Placeholder for robust image */}
              <div className="relative aspect-square rounded-3xl overflow-hidden glass-card p-2 shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-accent/10 -z-10" />
                {/* Replace with actual high quality housing image if available */}
                <div className="h-full w-full rounded-2xl bg-muted/50 border border-border/50 overflow-hidden relative">
                  <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,transparent)] dark:bg-grid-slate-800" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
                    <MapPin className="h-16 w-16 text-primary mx-auto mb-4" />
                    <p className="font-bold text-lg">Verified Locations</p>
                  </div>
                </div>
                {/* Stats overlay */}
                <div className="absolute bottom-8 right-8 bg-background/90 backdrop-blur p-4 rounded-xl shadow-lg border border-border">
                  <p className="text-2xl font-bold text-foreground">100%</p>
                  <p className="text-xs text-muted-foreground">Verified Listings</p>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase text-secondary">
                <ShieldCheck className="h-3.5 w-3.5" /> Trusted Housing
              </div>
              <h2 className="text-3xl font-headline font-bold sm:text-4xl lg:text-5xl">Book your perfect stay with confidence.</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Say goodbye to uncertain PG hunts. UniNest verifies every listing, owner, and amenity. Compare commute times, check curfew policies, and read genuine reviews from students just like you.
              </p>
              <ul className="space-y-4 pt-4">
                {[
                  "100% Verified Owners & Listings",
                  "Transparent Pricing & No Hidden Fees",
                  "Student Reviews & Safety Badges",
                  "Direct Chat with Landlords"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                      <ArrowRight className="h-3 w-3" />
                    </div>
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
              <div className="pt-6 flex gap-4">
                <Button size="lg" className="rounded-xl" asChild>
                  <Link href="/housing">Find a PG</Link>
                </Button>
                <Button size="lg" variant="outline" className="rounded-xl" asChild>
                  <Link href="/hostels">Explore Hostels</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Secondary Value Prop: Internships & Competitions */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-headline font-bold text-foreground sm:text-4xl">Accelerate your career</h2>
            <p className="mt-4 text-lg text-muted-foreground">From internships at top startups to national-level hackathons, find opportunities that match your ambition.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Internship Card */}
            <Card className="overflow-hidden border-none bg-muted/30 dark:bg-muted/10">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 h-full">
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="size-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center dark:bg-purple-900/20">
                      <Users className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Internship Hub</h3>
                    <p className="text-muted-foreground">
                      Find verified roles with mentorship. Filter by stipend, remote options, and skill requirements.
                    </p>
                    <Button variant="link" className="w-fit p-0 h-auto font-semibold text-purple-600" asChild>
                      <Link href="/internships">Browse Internships <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="relative h-64 lg:h-auto bg-purple-50 dark:bg-purple-900/5">
                    {/* Decorative element or image */}
                    <div className="absolute inset-4 rounded-xl border-dashed border-2 border-purple-200 dark:border-purple-800 flex items-center justify-center">
                      <span className="text-purple-300 font-bold text-6xl opacity-20">JOB</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Competition Card */}
            <Card className="overflow-hidden border-none bg-muted/30 dark:bg-muted/10">
              <CardContent className="p-0">
                <div className="grid lg:grid-cols-2 h-full">
                  <div className="p-8 lg:p-12 flex flex-col justify-center space-y-6">
                    <div className="size-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center dark:bg-orange-900/20">
                      <Star className="size-6" />
                    </div>
                    <h3 className="text-2xl font-bold">Competition Arena</h3>
                    <p className="text-muted-foreground">
                      Join hackathons and leagues. Form teams, track prizes, and earn certificates for your profile.
                    </p>
                    <Button variant="link" className="w-fit p-0 h-auto font-semibold text-orange-600" asChild>
                      <Link href="/competitions">View Challenges <ArrowRight className="ml-1 h-4 w-4" /></Link>
                    </Button>
                  </div>
                  <div className="relative h-64 lg:h-auto bg-orange-50 dark:bg-orange-900/5">
                    {/* Decorative element or image */}
                    <div className="absolute inset-4 rounded-xl border-dashed border-2 border-orange-200 dark:border-orange-800 flex items-center justify-center">
                      <span className="text-orange-300 font-bold text-6xl opacity-20">WIN</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      {testimonials.length > 0 && (
        <section className="py-24 bg-background border-t border-border/50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-headline font-bold">Student Stories</h2>
              <p className="mt-4 text-muted-foreground">Join 10,000+ students already using UniNest.</p>
            </div>

            <Carousel opts={{ align: 'start', loop: true }} plugins={[testimonialAutoplay]} className="w-full">
              <CarouselContent className="-ml-4">
                {testimonials.map((t, i) => (
                  <CarouselItem key={i} className="pl-4 md:basis-1/2 lg:basis-1/3">
                    <div className="h-full rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-md">
                      <Quote className="h-8 w-8 text-primary/20 mb-6" />
                      <p className="text-lg font-medium leading-relaxed mb-6">"{t.quote}"</p>
                      <div className="flex items-center gap-4">
                        <Avatar>
                          {t.avatar ? <AvatarImage src={t.avatar} /> : <AvatarFallback>{getInitials(t.name)}</AvatarFallback>}
                        </Avatar>
                        <div>
                          <div className="font-bold text-sm text-foreground">{t.name}</div>
                          <div className="text-xs text-muted-foreground">{t.school}</div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <div className="mt-8 flex justify-center gap-2">
                <CarouselPrevious className="static translate-y-0" />
                <CarouselNext className="static translate-y-0" />
              </div>
            </Carousel>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative overflow-hidden py-24">
        <div className="absolute inset-0 bg-primary -z-20" />
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] opacity-10 -z-10" />
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-headline font-bold text-white sm:text-5xl">Ready to upgrade your campus life?</h2>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80">
            Join the community today. Access exclusive internships, find verified housing, and connect with peers across India.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" variant="secondary" className="h-14 px-8 text-lg font-semibold shadow-xl" asChild>
              <Link href="/signup">Get Started for Free</Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg font-semibold bg-transparent text-white border-white/30 hover:bg-white/10 hover:text-white" asChild>
              <Link href="/about">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}

