import type { Metadata } from 'next';
import Link from 'next/link';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://uninest.app'),
  title: 'UniNest | Verified Student Housing & Career Hub',
  description:
    'UniNest is the trusted student housing and opportunity hub in India. Book verified PGs, internships, competitions, library seats, vendors, and marketplace deals in one platform.',
  keywords: [
    'UniNest student housing',
    'verified PG booking India',
    'student internships platform',
    'online student competitions',
    'library seat booking system',
    'student marketplace India',
    'student community app',
    'campus vendor platform',
  ],
  openGraph: {
    title: 'UniNest | Verified Student Housing & Career Hub',
    description:
      'Book verified PGs, internships, competitions, library seats, vendor deals, and marketplace essentials crafted for India’s students.',
    url: 'https://uninest.app/',
    siteName: 'UniNest',
    type: 'website',
    images: [
      {
        url: '/images/uninest-og-new.png',
        width: 1200,
        height: 630,
        alt: 'UniNest student housing and opportunity hub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniNest | Verified Student Housing & Career Hub',
    description:
      'Unlock verified PGs, internships, competitions, vendors, and marketplace essentials on UniNest, India’s student community platform.',
    images: ['/images/uninest-og-new.png'],
  },
  alternates: {
    canonical: 'https://uninest.app/',
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    'meta-tag-student-housing-india': 'student housing india',
    'meta-tag-verified-pg-booking': 'verified pg booking',
    'meta-tag-student-internships-platform': 'student internships platform',
    'meta-tag-student-competitions-hub': 'student competitions hub',
    'meta-tag-library-seat-booking': 'library seat booking system',
    'meta-tag-student-marketplace': 'student marketplace india',
    'meta-tag-campus-vendors': 'campus vendors india',
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': 'https://uninest.app/#organization',
      name: 'UniNest',
      url: 'https://uninest.app/',
      logo: {
        '@type': 'ImageObject',
        url: 'https://uninest.app/icons/icon-512x512.png',
      },
      sameAs: [
        'https://www.linkedin.com/company/uninest/',
        'https://www.instagram.com/uninest/',
        'https://twitter.com/uninest',
      ],
      description:
        'UniNest is a modern student community platform in India that connects learners to verified PGs, hostels, internships, competitions, library seats, and trusted campus vendors.',
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'hello@uninest.app',
        },
      ],
    },
    {
      '@type': 'LocalBusiness',
      '@id': 'https://uninest.app/#pg-listings',
      name: 'UniNest Verified PG Network',
      parentOrganization: {
        '@id': 'https://uninest.app/#organization',
      },
      areaServed: 'India',
      priceRange: '₹₹',
      serviceType: 'Verified student PG and hostel booking',
      url: 'https://uninest.app/marketplace',
    },
    {
      '@type': 'EducationalOrganization',
      '@id': 'https://uninest.app/#internships',
      name: 'UniNest Internships Hub',
      parentOrganization: {
        '@id': 'https://uninest.app/#organization',
      },
      url: 'https://uninest.app/workspace/internships',
      description: 'Curated and verified internships for Indian college students with mentor support and performance tracking.',
    },
    {
      '@type': 'Event',
      '@id': 'https://uninest.app/#competitions',
      name: 'UniNest Student Competitions',
      eventAttendanceMode: 'https://schema.org/MixedEventAttendanceMode',
      eventStatus: 'https://schema.org/EventScheduled',
      location: {
        '@type': 'VirtualLocation',
        url: 'https://uninest.app/workspace/competitions',
      },
      organizer: {
        '@id': 'https://uninest.app/#organization',
      },
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'INR',
        availability: 'https://schema.org/InStock',
      },
    },
    {
      '@type': 'HowTo',
      '@id': 'https://uninest.app/#library-booking',
      name: 'How to book a library seat on UniNest',
      step: [
        {
          '@type': 'HowToStep',
          position: 1,
          name: 'Choose a library partner',
          text: 'Browse verified libraries and study spaces across UniNest partners.',
        },
        {
          '@type': 'HowToStep',
          position: 2,
          name: 'Select a seat slot',
          text: 'Pick the date and slot that matches your study schedule and confirm availability.',
        },
        {
          '@type': 'HowToStep',
          position: 3,
          name: 'Confirm and pay',
          text: 'Finalize your booking with secure checkout and receive instant confirmation.',
        },
      ],
    },
    {
      '@type': 'Product',
      '@id': 'https://uninest.app/#student-marketplace',
      name: 'UniNest Student Marketplace',
      description: 'A secure marketplace for students to buy, sell, or rent essentials with escrow-backed payments and verified sellers.',
      brand: {
        '@id': 'https://uninest.app/#organization',
      },
      offers: {
        '@type': 'AggregateOffer',
        priceCurrency: 'INR',
        lowPrice: '99',
        highPrice: '1999',
        offerCount: 50,
      },
    },
  ],
};

const aboutCards = [
  {
    title: 'Why verified PG partners matter',
    body: 'Each UniNest PG and hostel is inspected for safety, transparent pricing, student-friendly amenities, and peer reviews so you settle in confidently from day one.',
  },
  {
    title: 'Community-first support',
    body: 'Moderated community rooms, 24/7 student support, and curated city guides mean you always have a senior to reach out to.',
  },
];

const quickLinks = [
  { href: '/workspace/internships', label: 'Browse internships dashboard' },
  { href: '/workspace/competitions', label: 'Explore competition hub' },
  { href: '/marketplace', label: 'Book PGs, hostels & study spaces' },
  { href: '/vendor/onboarding', label: 'Vendors: join UniNest platform' },
];

const internshipHighlights = [
  {
    title: 'How UniNest curates paid internships',
    body: 'Rigorous vetting, mentor interviews, and alignment to in-demand skills keep every internship meaningful and scam-free.',
  },
  {
    title: 'AI-matched opportunities',
    body: 'Our recommendation engine analyses your goals, hackathon history, and availability to surface tailored roles every week.',
  },
  {
    title: 'Performance analytics',
    body: 'Track milestones, mentor feedback, and certificates in one dashboard to build a portfolio recruiters trust.',
  },
];

const competitionHighlights = [
  {
    title: 'Spotlight on upcoming competitions',
    body: 'Stay ready with curated tech, design, and social impact challenges hosted across India and hybrid online events.',
  },
  {
    title: 'Team matchmaking',
    body: 'Discover peers with complementary skills and form winning squads through UniNest’s competition matchmaking board.',
  },
  {
    title: 'Skill-building kits',
    body: 'Prep checklists, mentor AMAs, and replay archives keep your team sharp before submission day.',
  },
];

const vendorHighlights = [
  {
    title: 'Library seat booking made seamless',
    body: 'Reserve study pods, quiet corners, or group rooms at verified libraries with real-time availability and instant confirmation.',
  },
  {
    title: 'Data-backed vendor choices',
    body: 'Vendors receive onboarding support, analytics dashboards, and sentiment data to deliver consistent student experiences.',
  },
];

const marketplaceHighlights = [
  {
    title: 'Safe buy, sell, rent protection',
    body: 'Orders stay in escrow until both parties confirm delivery, keeping every swap transparent and accountable.',
  },
  {
    title: 'Verified seller badges',
    body: 'Earn trust faster with KYC-backed verification, student ID checks, and consistent positive reviews.',
  },
  {
    title: 'Vendor storefronts',
    body: 'Campus vendors launch storefronts, bundle offers, and run promos with UniNest analytics on student demand.',
  },
];

function CardGrid({
  items,
  className = '',
}: {
  items: { title: string; body: string }[];
  className?: string;
}) {
  return (
    <div className={`grid gap-4 sm:grid-cols-2 ${className}`}>
      {items.map((item) => (
        <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
        </div>
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <Script id="uninest-landing-jsonld" type="application/ld+json">
        {JSON.stringify(jsonLd)}
      </Script>
      <main className="bg-muted/10">
        <section className="px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-6 text-center">
            <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
              Built for India’s students
            </span>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
              UniNest: Your Trusted Student Housing & Opportunity Hub
            </h1>
            <p className="text-lg text-slate-600 sm:text-xl">
              Unlock verified PGs, paid internships, campus competitions, library seats, trusted vendors, and a secure student marketplace — all in one place.
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg transition hover:bg-primary/90"
              >
                Join UniNest Today
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-primary/40 px-6 py-3 text-base font-semibold text-primary transition hover:bg-primary/5"
              >
                Explore Our Mission
              </Link>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[2fr,1fr]">
            <div className="space-y-6">
              <h2 className="text-3xl font-semibold text-slate-900">About UniNest — Mission & Community</h2>
              <p className="text-base leading-7 text-slate-600">
                UniNest was born from a simple belief: every student deserves a single home for housing, career growth, and a supportive community. Our platform vets every partner, curates every opportunity, and delivers real-time support so you can focus on discovering the future you want.
              </p>
              <CardGrid items={aboutCards} />
            </div>
            <div className="space-y-4 rounded-2xl border border-primary/20 bg-primary/5 p-6 shadow-inner">
              <h3 className="text-lg font-semibold text-primary">Quick access</h3>
              <ul className="space-y-3 text-sm text-slate-700">
                {quickLinks.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="font-medium text-primary hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Verified Internships Built for Ambitious Students</h2>
              <p className="text-base leading-7 text-slate-600">
                UniNest curates internship opportunities that align with your course load, skill level, and growth plans. Partners submit detailed project briefs, mentor availability, and stipend structures so you can evaluate every role with clarity.
              </p>
            </div>
            <CardGrid items={internshipHighlights} className="sm:grid-cols-3" />
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/workspace/internships"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
              >
                Browse internships →
              </Link>
              <a
                href="https://www.nasscomfoundation.org/futureskills-prime/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                NASSCOM FutureSkills insights
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold text-slate-900">Competitions & Campus Challenges to Elevate Skills</h2>
              <p className="text-base leading-7 text-slate-600">
                From hackathons and design marathons to social impact pitch-offs, track every competition inside UniNest. Team up, register, and get reminders without juggling dozens of tabs.
              </p>
            </div>
            <CardGrid items={competitionHighlights} className="sm:grid-cols-3" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/workspace/competitions"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90"
              >
                Discover competitions →
              </Link>
              <a
                href="https://ficci.in/public/uploads/newsletters/ficci-higher-education-committee-newsletter.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                FICCI employability insights
              </a>
            </div>
          </div>
        </section>

        <section className="bg-slate-50 px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-10">
            <div className="space-y-4">
              <h2 className="text-3xl font-semibold text-slate-900">Vendors, PGs, and Study Spaces Students Love</h2>
              <p className="text-base leading-7 text-slate-600">
                Find a seat you trust. UniNest connects you to verified PGs, women-only hostels, co-living studios, and library partners near major campuses. Filter by budget, distance, roommate vibe, and amenities while reading peer reviews that keep things transparent.
              </p>
            </div>
            <CardGrid items={vendorHighlights} />
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
              >
                Explore PG listings →
              </Link>
              <Link
                href="/marketplace/library"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Reserve library seats
              </Link>
              <a
                href="https://www.education.gov.in/sites/upload_files/mhrd/files/upload_document/PG_Hostel_Guidelines.pdf"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Govt. hostel guidelines
              </a>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-200 bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl space-y-8">
            <div className="space-y-4 text-center">
              <h2 className="text-3xl font-semibold text-slate-900">A Marketplace Built for Student Life</h2>
              <p className="text-base leading-7 text-slate-600">
                Pay less, trust more. The UniNest student marketplace protects every transaction with escrow-backed payments and verified seller badges so you can buy, sell, or rent essentials stress-free.
              </p>
            </div>
            <CardGrid items={marketplaceHighlights} className="sm:grid-cols-3" />
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white shadow transition hover:bg-primary/90"
              >
                Visit student marketplace →
              </Link>
              <Link
                href="/vendor/onboarding"
                className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-white"
              >
                Become a UniNest vendor
              </Link>
            </div>
          </div>
        </section>

        <section className="bg-primary px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-4xl space-y-6 text-center text-primary-foreground">
            <h2 className="text-3xl font-semibold sm:text-4xl">Join UniNest’s Growing Community</h2>
            <p className="text-base leading-7 text-primary-foreground/90">
              Thousands of students already trust UniNest to sync housing, internships, competitions, and campus life. Sign up to unlock personalized dashboards, AI-powered listing optimizers, and exclusive student rewards.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-primary shadow transition hover:bg-slate-100"
              >
                Create your UniNest account
              </Link>
              <Link
                href="mailto:hello@uninest.app?subject=Campus%20Walkthrough%20Request"
                className="inline-flex items-center justify-center rounded-full border border-white/40 px-6 py-3 text-base font-semibold text-primary-foreground transition hover:bg-primary/20"
              >
                Book a campus walkthrough
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
