import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import StealthAppDownload from '@/components/stealth-app-download'

export const metadata: Metadata = {
  title: 'Download UniNest App – Full-Screen PWA Experience',
  description:
    'Install the UniNest Progressive Web App for a native-like student experience with offline access, instant notifications, and lightning-fast performance.',
}

const highlights = [
  {
    title: 'Native-like performance',
    description: 'Launch UniNest from your home screen with instant load times and zero browser chrome.',
  },
  {
    title: 'Offline ready',
    description: 'Access saved housing, internships, and marketplace listings even without an active connection.',
  },
  {
    title: 'Smart notifications',
    description: 'Get notified about booking confirmations, application updates, and community announcements.',
  },
  {
    title: 'Secure for campus life',
    description: 'Biometric unlock, verified vendors, and encrypted data powered by Supabase security layers.',
  },
]

const features = [
  {
    title: 'Housing & PG Discovery',
    description:
      'Compare verified stays, check amenities, and book trusted accommodations in seconds.',
    image: '/icons/icon-192x192.png',
  },
  {
    title: 'Internships & Competitions',
    description:
      'Set reminders, apply with confidence, and track your progress across every opportunity.',
    image: '/icons/icon-512x512.png',
  },
  {
    title: 'Marketplace & Community',
    description:
      'Trade essentials safely, join student clubs, and collaborate with peers across campuses.',
    image: '/icons/icon-1024x1024.png',
  },
]

export default function DownloadPage() {
  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-16 px-4 py-16 sm:px-6 lg:px-8">
      <section className="grid gap-10 lg:grid-cols-[1.15fr_minmax(280px,1fr)] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex w-max items-center gap-2 rounded-full bg-primary/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Ready in under 30 seconds
          </span>
          <h1 className="text-4xl font-headline font-bold leading-tight sm:text-5xl">
            Download the UniNest App for a stealth-native experience.
          </h1>
          <p className="text-lg text-muted-foreground">
            Install UniNest as a Progressive Web App that feels just like a native store download. One tap for Android, guided steps for iOS, and you're set with a full-screen hub for housing, internships, competitions, and student life.
          </p>
          <div className="space-y-4">
            <StealthAppDownload />
            <p className="text-sm text-muted-foreground">
              Works best on the latest Chrome, Safari, and Edge releases. Need help?{' '}
              <Link className="font-semibold text-primary underline-offset-4 hover:underline" href="/support">
                Contact support
              </Link>
              .
            </p>
          </div>
        </div>
        <div className="rounded-3xl border border-border/70 bg-muted/40 p-8 shadow-lg">
          <div className="space-y-5">
            <h2 className="text-xl font-semibold">Why install the app?</h2>
            <ul className="space-y-4 text-sm text-muted-foreground">
              {highlights.map((highlight) => (
                <li key={highlight.title} className="rounded-2xl bg-background/80 p-4 shadow-sm">
                  <p className="text-base font-semibold text-foreground">{highlight.title}</p>
                  <p>{highlight.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="space-y-10">
        <div className="space-y-3 text-center">
          <h2 className="text-3xl font-headline font-bold">Built for every campus workflow</h2>
          <p className="text-lg text-muted-foreground">
            The UniNest app gives you the same verified services, faster performance, and push-ready experience without needing an app store listing.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-border/60 bg-background/80 p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-center">
                <Image
                  src={feature.image}
                  alt="UniNest feature graphic"
                  width={96}
                  height={96}
                  className="h-16 w-16 rounded-2xl border border-border/60 object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6 rounded-3xl border border-primary/30 bg-primary/5 p-10 text-center shadow-lg">
        <h2 className="text-3xl font-headline font-bold text-primary sm:text-4xl">Share the UniNest App</h2>
        <p className="text-lg text-primary/80">
          Invite friends with the same install link: https://uninest.co.in/download. Every install helps the community grow with trustworthy housing, study, and opportunity workflows.
        </p>
        <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="https://wa.me/?text=Grab%20the%20UniNest%20app%20for%20campus%20life%3A%20https%3A%2F%2Funinest.co.in%2Fdownload"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-semibold text-white transition hover:bg-primary/90"
            target="_blank"
            rel="noopener noreferrer"
          >
            Share on WhatsApp
          </Link>
          <Link
            href="mailto:?subject=Join%20UniNest&body=Install%20the%20UniNest%20app%20for%20students%3A%20https%3A%2F%2Funinest.co.in%2Fdownload"
            className="inline-flex items-center gap-2 rounded-full border border-primary px-6 py-3 font-semibold text-primary transition hover:bg-primary/10"
          >
            Email the link
          </Link>
        </div>
      </section>
    </main>
  )
}
