import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from '@/components/layout/main-layout';
import { AuthProvider } from '@/hooks/use-auth';
import { GroqAssistant } from '@/components/ai/GroqAssistant';
import { BrandingAssetsProvider } from '@/components/branding/branding-provider';
import { getBrandingAssets } from '@/lib/branding';
import { Poppins } from 'next/font/google';

export const revalidate = 60; // Cache for 60 seconds, revalidate in background

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const baseMetadata: Metadata = {
  metadataBase: new URL('https://uninest.co.in'),
  title: {
    default: 'UniNest – India’s #1 Student Platform for Internships, Hostels & Marketplace',
    template: '%s | UniNest',
  },
  description: 'Join 10,000+ students on UniNest. Find verified hostels, book library seats, find internships, and shop in India’s fastest-growing student community.',
  keywords: [
    'uninest',
    'student platform',
    'internships india',
    'competitions for students',
    'hostel booking',
    'pg near me',
    'library seat reservation',
    'student marketplace',
    'student housing management',
    'sell to students',
  ],
  authors: [{ name: 'UniNest Team' }],
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://uninest.co.in/',
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'UniNest',
  },
  verification: {
    google: 'google-site-verification=PLACEHOLDER_TOKEN',
  },
  other: {
    'meta-title': 'UniNest – India’s #1 Student Platform for Internships, Hostels & Marketplace',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

const baseOpenGraph: NonNullable<Metadata['openGraph']> = {
  title: 'UniNest – Student Housing, Internships & Marketplace',
  description: 'Join 10,000+ students on UniNest. Find verified hostels, book library seats, and grow together.',
  url: 'https://uninest.co.in/',
  siteName: 'UniNest',
  locale: 'en_IN',
  type: 'website',
};

const baseTwitter: NonNullable<Metadata['twitter']> = {
  card: 'summary_large_image',
  title: 'UniNest – India’s #1 Student Platform for Internships & Competitions',
  description: 'Join 10,000+ students on UniNest. Connect, study, and grow with your peers.',
};

export async function generateMetadata(): Promise<Metadata> {
  const brandingAssets = await getBrandingAssets();

  const faviconUrl = brandingAssets.faviconUrl ?? null;
  const appleIconUrl = brandingAssets.pwaIcon192Url ?? brandingAssets.logoUrl ?? faviconUrl ?? undefined;
  const logoUrl = brandingAssets.logoUrl ?? null;

  const icons = faviconUrl
    ? {
      icon: [{ url: faviconUrl }],
      shortcut: [{ url: faviconUrl }],
      apple: appleIconUrl ? [{ url: appleIconUrl }] : undefined,
    }
    : undefined;

  const openGraph: Metadata['openGraph'] = {
    ...baseOpenGraph,
    images: logoUrl
      ? [
        {
          url: logoUrl,
          width: 512,
          height: 512,
          alt: 'UniNest Logo',
        },
      ]
      : undefined,
  };

  const twitter: Metadata['twitter'] = {
    ...baseTwitter,
    images: logoUrl ? [logoUrl] : undefined,
  };

  return {
    ...baseMetadata,
    icons,
    openGraph,
    twitter,
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#38BDF8' },
    { media: '(prefers-color-scheme: dark)', color: '#0F172A' },
  ],
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandingAssets = await getBrandingAssets();
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <head>
        {/* Preconnect to Supabase for faster API calls */}
        <link rel="preconnect" href="https://dfkgefoqodjccrrqmqis.supabase.co" />
        <link rel="dns-prefetch" href="https://dfkgefoqodjccrrqmqis.supabase.co" />
      </head>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <Script
          id="uninest-organization-schema"
          type="application/ld+json"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'UniNest',
              url: 'https://uninest.co.in',
              logo: brandingAssets.logoUrl ?? brandingAssets.faviconUrl ?? undefined,
              contactPoint: {
                '@type': 'ContactPoint',
                telephone: '+91-XXXXXXXXXX',
                contactType: 'customer service',
                areaServed: 'IN',
                availableLanguage: ['en', 'hi']
              },
              sameAs: [
                'https://www.instagram.com/uninest',
                'https://www.linkedin.com/company/uninest',
              ],
            }),
          }}
        />
        <Script
          id="uninest-breadcrumb-schema"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                {
                  '@type': 'ListItem',
                  position: 1,
                  name: 'Home',
                  item: 'https://uninest.co.in'
                },
                {
                  '@type': 'ListItem',
                  position: 2,
                  name: 'Hostels',
                  item: 'https://uninest.co.in/hostels'
                },
                {
                  '@type': 'ListItem',
                  position: 3,
                  name: 'Marketplace',
                  item: 'https://uninest.co.in/marketplace'
                }
              ]
            }),
          }}
        />
        <AuthProvider>
          <BrandingAssetsProvider initialAssets={brandingAssets}>
            <MainLayout>
              {children}
            </MainLayout>
          </BrandingAssetsProvider>
          <GroqAssistant />
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  );
}
