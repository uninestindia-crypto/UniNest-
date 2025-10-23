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
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(({ icon: iconName, ...stat }, index) => {
              const IconComponent = resolveIcon(iconName, Users);
              return <StatCard key={index} {...stat} icon={IconComponent} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Loved by Students Everywhere</h2>
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
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Our Journey So Far</h2>
          <div className="grid md:grid-cols-4 gap-x-6 gap-y-10 max-w-5xl mx-auto">
            {timeline.map((item) => {
              const IconComponent = resolveIcon(item.icon, Sparkles);
              return (
              <div key={item.title} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-primary/10 text-primary rounded-full p-4 border-2 border-primary/20 shadow-sm">
                    <IconComponent className="size-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{item.year}</p>
                <h3 className="font-headline font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
            })}
          </div>
        </section>

        <section className="text-center rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl md:p-12">
          <h2 className="text-3xl font-bold font-headline">Don’t Miss Out.</h2>
          <p className="mt-2 max-w-2xl mx-auto text-primary-foreground/90">
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
        </section>
      </div>
    </>
  );
}
