import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster";
import MainLayout from '@/components/layout/main-layout';
import { AuthProvider } from '@/hooks/use-auth';
import ClientOnly from '@/components/client-only';
import { BrandingAssetsProvider } from '@/components/branding/branding-provider';
import { getBrandingAssets } from '@/lib/branding';
import { Poppins } from 'next/font/google';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://uninest.app'),
  title: {
    default: 'UniNest – Your Digital Campus Hub',
    template: '%s | UniNest',
  },
  description: 'A vibrant, modern, and student-friendly UI that feels like a digital campus hub. Connect, share, and thrive!',
  keywords: ['student platform', 'UniNest', 'digital campus', 'social feed', 'marketplace', 'study hub'],
  authors: [{ name: 'UniNest Team' }],
  openGraph: {
    title: 'UniNest – Your Digital Campus Hub',
    description: 'Connect, share, and thrive on your digital campus.',
    url: 'https://uninest.app',
    siteName: 'UniNest',
    images: [
      {
        url: '/images/uninest-og-new.png',
        width: 1200,
        height: 630,
        alt: 'UniNest Platform Banner',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UniNest – Your Digital Campus Hub',
    description: 'The ultimate platform for modern students.',
    images: ['/images/uninest-og-new.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brandingAssets = await getBrandingAssets();
  return (
    <html lang="en" suppressHydrationWarning className={poppins.variable}>
      <body className={cn(
        "min-h-screen bg-background font-body antialiased"
      )}>
        <ClientOnly>
          <AuthProvider>
            <BrandingAssetsProvider initialAssets={brandingAssets}>
              <MainLayout>
                {children}
              </MainLayout>
            </BrandingAssetsProvider>
          </AuthProvider>
        </ClientOnly>
        <Toaster />
      </body>
    </html>
  );
}
