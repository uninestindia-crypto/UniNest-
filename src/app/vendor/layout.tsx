
'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VendorSidebarNav } from '@/components/vendor/vendor-sidebar-nav';
import { Logo } from '@/components/icons';
import { LogOut, Settings, User as UserIcon, Instagram } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function VendorLayout({ children }: { children: ReactNode }) {
  const { user, signOut, role, loading } = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (role === 'vendor' || role === 'admin') { // Also allow admins to see vendor dashboard
        setIsAuthorized(true);
      } else {
        // If not a vendor or admin, redirect away. This is the final safeguard.
        router.push('/');
      }
    }
  }, [role, loading, router]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="size-8 animate-spin" />
        <p className="ml-2">Verifying vendor access...</p>
      </div>
    )
  }

  return (
    <VendorLayoutShell user={user} signOut={signOut}>
      {children}
    </VendorLayoutShell>
  );
}

type VendorLayoutShellProps = {
  children: ReactNode;
  user: User | null;
  signOut: () => Promise<void>;
};

import { DashboardShell } from '@/components/ui/dashboard-shell';
import { VendorSidebarNav } from '@/components/vendor/vendor-sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Instagram, LogOut, Settings, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

function VendorLayoutShell({ children, user, signOut }: VendorLayoutShellProps) {
  const sidebarFooter = (
    <div className="flex items-center gap-3 w-full">
      <Avatar className="size-8 border border-border">
        <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Vendor avatar" />
        <AvatarFallback className="bg-secondary/10 text-secondary">{user?.email?.[0].toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-sm overflow-hidden">
        <span className="font-semibold truncate">{user?.user_metadata?.full_name || 'Vendor'}</span>
        <span className="text-muted-foreground text-xs truncate">{user?.email}</span>
      </div>
    </div>
  );

  const headerContent = (
    <>
      <div className="ml-auto flex items-center gap-2">
        <Button asChild variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
          <Link href="https://www.instagram.com/uninest_x?igsh=MXhyaXhybmFndzY0NQ==" target="_blank" rel="noopener noreferrer">
            <Instagram className="size-5" />
            <span className="sr-only">Instagram</span>
          </Link>
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="rounded-full ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
              <Avatar className="size-8 border border-border">
                {user && <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="Admin avatar" />}
                <AvatarFallback className="bg-secondary/10 text-secondary">
                  {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-5" />}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <>
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <Settings className="mr-2 size-4" />
                  Profile Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={signOut} className="text-destructive focus:text-destructive cursor-pointer">
                <LogOut className="mr-2 size-4" />
                Logout
              </DropdownMenuItem>
            </>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </>
  );

  return (
    <DashboardShell
      title="Vendor Hub"
      sidebarContent={<VendorSidebarNav />}
      sidebarFooter={sidebarFooter}
      headerContent={headerContent}
    >
      {children}
    </DashboardShell>
  );
}
