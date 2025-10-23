import Link from 'next/link';
import { Button } from '@/components/ui/button';

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

export default function HomeClient() {
  return (
    <main className="bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaMarkup) }}
      />

      <section className="px-4 py-16 sm:px-6 lg:px-10 xl:px-16">
        <div className="mx-auto max-w-6xl grid gap-10 lg:grid-cols-[1.15fr_minmax(280px,1fr)]">
          <div className="space-y-6">
            <span className="inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              India’s trusted student community platform
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
              </Card>
            </div>
          </div>

          <aside className="space-y-6 rounded-3xl border border-border/60 bg-muted/40 p-8 shadow-lg">
            <div className="space-y-3">
              <h2 className="text-xl font-semibold">Why students choose UniNest</h2>
              <p className="text-sm text-muted-foreground">
                All listings and programs pass compliance checks inspired by the national standard for technical education authorities.
              </p>
            </div>
            <AnimatedBeam className="rounded-2xl bg-background/80 p-6 shadow" />
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">Your trusted student super app</p>
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-primary/15" />
                <div>
                  <p className="font-semibold">Live listings, verified communities</p>
                  <p className="text-sm text-muted-foreground">Curated experiences for every student journey.</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-12">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {quickAccessCards.map((card) => (
            <Link key={card.id} href={card.href} className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-0 transition group-hover:opacity-100" />
              <div className="relative space-y-4 p-6">
                <div className="flex items-center justify-between">
                  <Badge className="rounded-full bg-primary/10 text-primary">Featured</Badge>
                  <ArrowRight className="size-4 text-muted-foreground transition group-hover:translate-x-1" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                {card.imageUrl ? (
                  <div className="relative overflow-hidden rounded-2xl">
                    <Image src={card.imageUrl} alt={card.title} width={480} height={320} className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
                  </div>
                ) : null}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="px-6 pb-16 lg:px-12">
        <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Curated collections to explore</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {curatedCollections.map((collection) => (
            <Link key={collection.id} href={collection.href} className="group rounded-3xl border border-border/50 bg-background/80 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
              <div className="relative overflow-hidden rounded-t-3xl">
                {collection.imageUrl ? (
                  <Image src={collection.imageUrl} alt={collection.title} width={640} height={420} className="h-52 w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : (
                  <div className="h-52 w-full bg-muted" />
                )}
              </div>
              <div className="space-y-3 p-6">
                <h3 className="text-xl font-semibold">{collection.title}</h3>
                <p className="text-sm text-muted-foreground">{collection.description}</p>
                <Button variant="link" className="px-0" asChild>
                  <span className="inline-flex items-center gap-2">
                    Explore now
                    <ArrowRight className="size-4" />
                  </span>
                </Button>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {stats.length > 0 ? (
        <section className="px-6 pb-16 lg:px-12">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {stats.map(({ icon: iconName, ...stat }, index) => {
              const IconComponent = resolveIcon(iconName, Users);
              return <StatCard key={index} {...stat} icon={IconComponent} />;
            })}
          </div>
        </section>
      ) : null}

      {testimonials.length > 0 ? (
        <section className="px-6 pb-16 lg:px-12">
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Loved by Students Everywhere</h2>
          <Carousel opts={{ align: "start", loop: true }} className="w-full max-w-5xl mx-auto">
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} width={80} height={80} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic">“{testimonial.quote}”</p>
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
      ) : null}

      {timeline.length > 0 ? (
        <section className="px-6 pb-16 lg:px-12">
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Our Journey So Far</h2>
          <div className="grid gap-x-6 gap-y-10 md:grid-cols-4">
            {timeline.map((item) => {
              const IconComponent = resolveIcon(item.icon, Sparkles);
              return (
                <div key={item.title} className="text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="rounded-full border-2 border-primary/20 bg-primary/10 p-4 text-primary shadow-sm">
                      <IconComponent className="size-8" />
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.year}</p>
                  <h3 className="text-xl font-headline font-semibold">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="px-6 pb-16 lg:px-12">
        <div className="rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl md:p-12">
          <h2 className="text-3xl font-headline font-bold">Don’t Miss Out.</h2>
          <p className="mt-2 max-w-2xl text-primary-foreground/90">
            Be part of the fastest-growing student movement and supercharge your campus life.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link href="/signup">Get Started Now 🚀</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-lg text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/about">Learn more about UniNest</Link>
            </Button>
          </div>
        </div>
      </section>

      <DonationModal isOpen={false} onOpenChange={() => {}} />

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
    </main>
  );
}
