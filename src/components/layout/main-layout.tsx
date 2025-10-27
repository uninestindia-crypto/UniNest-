
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
import { useAuth } from '@/hooks/use-auth';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { MobileBottomNav, SidebarNav } from '@/components/layout/sidebar-nav';
import Link from 'next/link';
import { Button } from '../ui/button';
import { Instagram, Loader2 } from 'lucide-react';
import NotificationsDropdown from './notifications-dropdown';
import UserDropdown from './user-dropdown';
import { AppVersionWatcher } from '@/components/app-version-watcher';

export default function MainLayout({ children }: { children: ReactNode }) {
  const { user, role, loading } = useAuth();
  const isMobile = useIsMobile();
  const pathname = usePathname();
  const router = useRouter();

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
      '/notes',
      '/social',
      '/donate',
      '/support',
      '/about',
      '/search',
      '/profile',
      '/hostels',
      '/booking',
      '/feed',
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

  if (loading) {
      return (
          <div className="flex h-screen items-center justify-center">
              <Loader2 className="size-8 animate-spin" />
          </div>
      )
  }

  const userHandle = user?.user_metadata?.handle;
  const profileLink = user ? (userHandle ? `/profile/${userHandle}` : '/profile') : '/login';

  return (
    <>
      {versionWatcher}
      <SidebarProvider>
        <Sidebar className="hidden md:flex flex-col">
          <SidebarHeader>
            <Link href="/" className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-lg">
                  <Logo className="size-6 text-white" />
              </div>
              <h1 className="text-xl font-headline font-bold">UniNest</h1>
            </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter>
            {user ? (
              <div className="flex items-center justify-between">
                  <Link href={profileLink} className="flex-1 overflow-hidden">
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="User avatar" />
                        <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-sm overflow-hidden">
                        <span className="font-semibold truncate">{user.user_metadata?.full_name || 'User'}</span>
                        <span className="text-muted-foreground truncate">{user.email}</span>
                      </div>
                    </div>
                  </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                  <Avatar className="size-9">
                    <AvatarFallback>G</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col text-sm">
                    <span className="font-semibold">Guest</span>
                    <Link href="/login" className="text-sm primary-gradient bg-clip-text text-transparent font-semibold">
                      Login
                    </Link>
                  </div>
                </div>
            )}
          </SidebarFooter>
        </Sidebar>
        <SidebarInset>
          <header className="flex h-14 items-center justify-between border-b bg-background/95 px-2 md:px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex items-center gap-1 md:hidden">
                <SidebarTrigger className="-ml-1" />
                <Link href="/" className="flex items-center gap-2">
                  <Logo className="size-7 text-primary" />
                  <h1 className="text-lg font-semibold">UniNest</h1>
                </Link>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2">
                 <Button asChild variant="ghost" size="icon">
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
              "flex-1 overflow-y-auto overflow-x-hidden p-8", 
              isMobile && isHomePage && "p-0 py-4",
              isMobile && !isHomePage && "p-4",
              isMobile && "pb-24"
          )}>
            {children}
          </main>
        </SidebarInset>
        
        {/* Mobile Bottom Navigation */}
        {isMobile && <MobileBottomNav />}
      </SidebarProvider>
    </>
  );
}
