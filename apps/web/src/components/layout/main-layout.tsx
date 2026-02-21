
'use client';

import React, { type ReactNode, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Logo } from '@/components/icons';
import { useBrandingAssets } from '@/components/branding/branding-provider';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { MobileBottomNav, SidebarNav } from '@/components/layout/sidebar-nav';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Instagram, Loader2, User as UserIcon } from 'lucide-react';
import NotificationsDropdown from './notifications-dropdown';
import UserDropdown from './user-dropdown';
import { AppVersionWatcher } from '@/components/app-version-watcher';


export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();
  const { assets } = useBrandingAssets();

  // Redirect admin users away from the main site.
  useEffect(() => {
    if (loading || role !== 'admin') {
      return;
    }

    if (pathname.startsWith('/admin') || pathname.startsWith('/vendor')) {
      return;
    }

    const allowedPublicPrefixes = [
      '/',
      '/marketplace',
      '/workspace',
      '/ai',
      '/notes',
      '/donate',
      '/support',
      '/about',
      '/search',
      '/profile',
      '/hostels',
      '/booking',
    ];

    const isAllowedPublicRoute = allowedPublicPrefixes.some(prefix =>
      prefix === '/' ? pathname === '/' : pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

    if (!isAllowedPublicRoute) {
      router.push('/admin/dashboard');
    }
  }, [loading, role, pathname, router]);

  useEffect(() => {
    const preconnectUrls = [
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://picsum.photos',
    ];

    preconnectUrls.forEach((href) => {
      if (!document.querySelector(`link[rel="preconnect"][href="${href}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = href;
        if (href.includes('gstatic')) {
          link.crossOrigin = 'anonymous';
        }
        document.head.appendChild(link);
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return;
    }

    const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
    if (!isSecureContext) {
      return;
    }

    const registerServiceWorker = async () => {
      try {
        await navigator.serviceWorker.register('/service-worker.js');
      } catch (error) {
        console.warn('[pwa] service worker registration failed', error);
      }
    };

    registerServiceWorker();
  }, []);

  const isAdminPage = pathname.startsWith('/admin');
  const isVendorPage = pathname.startsWith('/vendor');
  const isHomePage = pathname === '/';

  const versionWatcher = <AppVersionWatcher versionUrl="/api/version" />;


  if (isAdminPage || isVendorPage) {
    return (
      <>
        {versionWatcher}

        {children}
      </>
    );
  }

  // Note: Removed loading spinner - layout now renders immediately.
  // User-specific content hydrates when auth is ready.

  const userHandle = user?.user_metadata?.handle;
  const profileLink = user ? (userHandle ? `/profile/${userHandle}` : '/profile') : '/login';


  return (
    <>
      {versionWatcher}

      <SidebarProvider>
        <Sidebar className="hidden lg:flex flex-col border-r border-border/40 bg-card/30 backdrop-blur-xl">
          <SidebarHeader className="px-4 py-4">
            <Link href="/" className="flex items-center gap-3 transition-opacity hover:opacity-90">
              {assets.logoUrl ? (
                <div className="relative size-9 overflow-hidden rounded-lg shadow-sm">
                  <Image src={assets.logoUrl} alt={assets.brandName || 'Logo'} fill className="object-cover" />
                </div>
              ) : (
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-md shadow-primary/20">
                  <Logo className="size-5 text-white" />
                </div>
              )}
              <h1 className="text-lg font-bold tracking-tight text-foreground">{assets.brandName || 'UniNest'}</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent className="px-2">
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-3">
            {user ? (
              <div className="overflow-hidden rounded-2xl border border-transparent transition-all hover:bg-accent/50 hover:border-border/50">
                <Link href={profileLink} className="flex items-center gap-3 p-2">
                  <Avatar className="size-9 border border-border/50">
                    <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="User avatar" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <span className="truncate text-sm font-semibold leading-none">{user.user_metadata?.full_name || 'User'}</span>
                    <span className="truncate text-xs text-muted-foreground/70 mt-0.5">{user.email}</span>
                  </div>
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 bg-accent/20 p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="size-9 bg-background border border-border/50">
                    <AvatarFallback className="text-muted-foreground text-xs"><UserIcon className="size-4" /></AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">Guest User</span>
                    <Link href="/login" className="text-xs font-medium text-primary hover:underline">
                      Sign in to continue
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset className="min-w-0">
          <header className="flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 lg:px-6 sticky top-0 z-40 w-full overflow-hidden">
            <div className="flex items-center gap-2 lg:hidden">
              <SidebarTrigger className="-ml-2" />
              <Link href="/" className="flex items-center gap-2">
                {assets.logoUrl ? (
                  <div className="relative size-8 overflow-hidden rounded-md">
                    <Image src={assets.logoUrl} alt={assets.brandName || 'Logo'} fill className="object-cover" />
                  </div>
                ) : (
                  <Logo className="size-6 text-primary" />
                )}
                <h1 className="text-lg font-bold tracking-tight">{assets.brandName || 'UniNest'}</h1>
              </Link>
            </div>
            <div className="flex-1" />
            <div className="flex items-center gap-3">
              <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Link href="https://www.instagram.com/uninest_x?igsh=MXhyaXhybmFndzY0NQ==" target="_blank" rel="noopener noreferrer">
                  <Instagram className="size-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              {user && <NotificationsDropdown />}
              <UserDropdown />
            </div>
          </header>
          <main className={cn(
            "flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-6 lg:p-8 w-full max-w-full min-w-0",
            // Remove padding on mobile home for full-bleed feel if desired, but general padding needed for other pages
            isMobile && isHomePage && "px-0 py-4",
            // Ensure bottom padding for nav bar on mobile/tablet (anything < lg)
            "pb-28 lg:pb-8"
          )}>
            {children}
          </main>
        </SidebarInset>

        {/* Mobile/Tablet Bottom Navigation - Visible below lg breakpoint */}
        <div className="lg:hidden">
          <MobileBottomNav />
        </div>
      </SidebarProvider>
    </>
  );
}
