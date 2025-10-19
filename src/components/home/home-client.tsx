
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import Autoplay from 'embla-carousel-autoplay';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowRight, BookOpen, GraduationCap, Rocket, Users, Building, Sparkles, Library, Search, Package } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import StatCard from '@/components/home/stat-card';
import DonationModal from './donation-modal';
import Image from 'next/image';
import type { HomePosterConfig } from '@/lib/types';
import { defaultHomePosterConfig } from '@/lib/home-poster';

const stats = [
  { value: 10000, label: 'Students Connected', icon: GraduationCap, isPlus: true },
  { value: 200, label: 'Vendors Onboarded', icon: Building, isPlus: true },
  { value: 50, label: 'Libraries Managed', icon: Library, isPlus: true },
];

const testimonials = [
  {
    quote: "UniNest completely changed how I find study materials. The note sharing is a lifesaver, and I've connected with so many peers!",
    name: "Fatima Khan",
    school: "Jamia Millia Islamia",
    avatar: "https://picsum.photos/seed/testimonial1/100"
  },
  {
    quote: "The marketplace is brilliant. I sold all my old textbooks in a week and found a great deal on a used bike. It's so much better than other platforms.",
    name: "John Mathew",
    school: "St. Stephen's College",
    avatar: "https://picsum.photos/seed/testimonial2/100"
  },
  {
    quote: "As a fresher, UniNest helped me feel connected to the campus community instantly. The social feed is always buzzing with useful info.",
    name: "Jaspreet Kaur",
    school: "Guru Nanak Dev University",
    avatar: "https://picsum.photos/seed/testimonial3/100"
  },
];

const timeline = [
  { year: "2024", title: "The Vision", description: "Founded with a mission to simplify student life.", icon: Sparkles },
  { year: "2024 Q2", title: "First 1,000 Users", description: "Our community begins to take shape.", icon: Users },
  { year: "2025 Q1", title: "10,000 Strong", description: "Crossed 10k students & 200 vendors.", icon: Rocket },
  { year: "Future", title: "Global Expansion", description: "Connecting 100,000+ learners worldwide.", icon: GraduationCap },
];

const quickAccess = [
  {
    title: 'Marketplace deals',
    description: 'Fresh finds under ₹199',
    icon: Package,
    href: '/marketplace',
    image: 'https://placehold.co/400x220/ffe2cc/31220c?text=Marketplace',
  },
  {
    title: 'Peer study rooms',
    description: 'Start a collaborative session',
    icon: Users,
    href: '/workspace',
    image: 'https://placehold.co/400x220/d6e6ff/0a1f44?text=Study+Hub',
  },
  {
    title: 'Download fresh notes',
    description: 'Expert summaries & solved papers',
    icon: BookOpen,
    href: '/notes',
    image: 'https://placehold.co/400x220/e4f7d7/143a04?text=Notes',
  },
  {
    title: 'Join the social buzz',
    description: 'Trending conversations from campuses',
    icon: ArrowRight,
    href: '/feed',
    image: 'https://placehold.co/400x220/f4e2ff/240835?text=Social+Feed',
  },
];

const curatedCollections = [
  {
    title: 'Last-minute competition prep',
    description: 'Register for top hackathons and contests closing soon.',
    href: '/workspace/competitions',
    image: 'https://placehold.co/500x300/fff0f0/661111?text=Competitions',
  },
  {
    title: 'Internships ready to apply',
    description: 'Handpicked roles from verified partners for UniNest students.',
    href: '/workspace/internships',
    image: 'https://placehold.co/500x300/ebfff4/0b3d24?text=Internships',
  },
  {
    title: 'Upgrade your hostel life',
    description: 'Comfort essentials and gadgets from verified vendors.',
    href: '/marketplace?category=hostel',
    image: 'https://placehold.co/500x300/eff3ff/172152?text=Hostel+Essentials',
  },
];

type HomeClientProps = {
  posterConfig: HomePosterConfig;
};

export default function HomeClient({ posterConfig }: HomeClientProps) {
  const { user } = useAuth();
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Show the donation modal once per session
    const hasSeenModal = sessionStorage.getItem('hasSeenDonationModal');
    if (!hasSeenModal) {
      const timer = setTimeout(() => {
        setIsDonationModalOpen(true);
        sessionStorage.setItem('hasSeenDonationModal', 'true');
      }, 2000); // Pop up after 2 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const executeSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      executeSearch();
    }
  };

  const heroSlides = posterConfig?.heroSlides?.length ? posterConfig.heroSlides : defaultHomePosterConfig.heroSlides;

  return (
    <>
      <DonationModal isOpen={isDonationModalOpen} onOpenChange={setIsDonationModalOpen} />
      <div className="bg-muted/30 py-4 sm:py-6">
        <div className="mx-auto w-full max-w-6xl space-y-6 sm:space-y-8 px-4 sm:px-6">
          <section className="grid gap-4 lg:grid-cols-[minmax(0,3fr),minmax(280px,1fr)]">
            <div className="relative overflow-hidden rounded-2xl bg-background shadow-xl">
              <Carousel
                opts={{ loop: true }}
                plugins={heroSlides.length > 1 ? [Autoplay({ delay: 5000 })] : undefined}
                className="w-full"
              >
                <CarouselContent>
                  {heroSlides.map((slide) => (
                    <CarouselItem key={slide.id} className="h-[320px] md:h-[420px]">
                      <div className="relative h-full w-full">
                        <Image
                          src={slide.imageUrl}
                          alt={slide.title}
                          fill
                          className="object-cover"
                          priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-background/85 via-background/60 to-background/20" />
                        <div className="absolute inset-0 flex flex-col justify-between p-6 md:p-10">
                          <div className="space-y-4 max-w-2xl">
                            {slide.tag && (
                              <span className="inline-flex rounded-full bg-primary/10 px-4 py-1 text-sm font-medium text-primary">
                                {slide.tag}
                              </span>
                            )}
                            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-background md:text-foreground">
                              {slide.title}
                            </h1>
                            {slide.subtitle && (
                              <p className="text-base md:text-lg text-background/90 md:text-foreground/80">
                                {slide.subtitle}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-wrap items-center gap-3">
                            {slide.ctaLabel && slide.ctaHref && (
                              <Button size="lg" asChild>
                                <Link href={slide.ctaHref}>{slide.ctaLabel}</Link>
                              </Button>
                            )}
                            {slide.secondaryCtaLabel && slide.secondaryCtaHref && (
                              <Button size="lg" variant="outline" asChild>
                                <Link href={slide.secondaryCtaHref}>{slide.secondaryCtaLabel}</Link>
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                {heroSlides.length > 1 && (
                  <>
                    <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2" />
                    <CarouselNext className="right-3 top-1/2 -translate-y-1/2" />
                  </>
                )}
              </Carousel>
              <div className="absolute bottom-4 left-4 right-4 sm:left-6 sm:right-6">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search for products, peers, or posts"
                    className="w-full rounded-full bg-background/95 py-5 pl-12 text-base shadow-lg"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchKeyDown}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <Card className="h-full rounded-2xl bg-background/90 shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl">For your best experience</CardTitle>
                  <CardDescription>Pick up where you left off across UniNest.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user ? (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">Signed in as</p>
                      <p className="text-lg font-semibold">{user.user_metadata?.full_name || user.email}</p>
                      <Button asChild className="w-full mt-4">
                        <Link href="/feed">Go to your dashboard</Link>
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">Hello, guest</p>
                      <Button className="w-full" asChild>
                        <Link href="/login">Sign in securely</Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href="/signup">Create your UniNest account</Link>
                      </Button>
                    </div>
                  )}
                  <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                    Save your favourite vendors, notes, and orders by keeping your profile up to date.
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quickAccess.map((item) => (
              <Link key={item.title} href={item.href} className="group">
                <Card className="overflow-hidden rounded-2xl shadow-lg transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative h-40 w-full">
                    <Image src={item.image} alt={item.title} fill className="object-cover" />
                  </div>
                  <CardHeader className="space-y-1">
                    <div className="flex items-center gap-2 text-primary">
                      <item.icon className="size-5" />
                      <span className="text-sm font-semibold uppercase tracking-wide">Explore</span>
                    </div>
                    <CardTitle className="text-xl">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </section>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24 py-10 sm:py-12">
        <section>
          <div className="grid gap-6 lg:grid-cols-3">
            {curatedCollections.map((collection) => (
              <Link key={collection.title} href={collection.href} className="group">
                <Card className="overflow-hidden rounded-2xl border shadow-md transition-transform duration-300 group-hover:-translate-y-1">
                  <div className="relative h-56 w-full">
                    <Image src={collection.image} alt={collection.title} fill className="object-cover" />
                  </div>
                  <CardHeader>
                    <CardTitle className="text-2xl font-semibold tracking-tight">{collection.title}</CardTitle>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={collection.href}>
                        Shop now
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Loved by Students Everywhere</h2>
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center text-center justify-center p-6 gap-3">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} width={80} height={80} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        <div>
                          <p className="font-bold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-12">Our Journey So Far</h2>
          <div className="grid md:grid-cols-4 gap-x-6 gap-y-10 max-w-5xl mx-auto">
            {timeline.map((item) => (
              <div key={item.title} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-primary/10 text-primary rounded-full p-4 border-2 border-primary/20 shadow-sm">
                    <item.icon className="size-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{item.year}</p>
                <h3 className="font-headline font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center bg-card p-8 md:p-12 rounded-2xl shadow-xl">
          <h2 className="text-3xl font-bold font-headline primary-gradient bg-clip-text text-transparent">Don’t Miss Out.</h2>
          <p className="mt-2 max-w-2xl mx-auto text-muted-foreground">
            Be part of the fastest-growing student movement and supercharge your campus life.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Button size="lg" className="text-lg" asChild>
              <Link href="/signup">Get Started Now 🚀</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
