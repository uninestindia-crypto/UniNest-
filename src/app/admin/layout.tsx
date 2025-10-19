
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
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
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
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, signOut, role, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);

  // The /admin/setup page should be accessible without being an admin
  if (pathname === '/admin/setup') {
    return <>{children}</>;
  }
  
  useEffect(() => {
    if (!loading) {
      if (role === 'admin') {
        setIsAuthorized(true);
      } else {
        router.push('/');
      }
    }
  }, [role, loading, router]);
  
  if (loading || !isAuthorized) {
    return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="size-8 animate-spin" />
            <p className="ml-2">Verifying administrative access...</p>
        </div>
    )
  }

  return (
    <AdminLayoutShell user={user} signOut={signOut}>
      {children}
    </AdminLayoutShell>
  );
}

type AdminLayoutShellProps = {
  children: ReactNode;
  user: User | null;
  signOut: () => Promise<void>;
};

function AdminLayoutShell({ children, user, signOut }: AdminLayoutShellProps) {
  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <Logo className="size-8 text-primary" />
            <h1 className="text-xl font-semibold">UniNest Admin</h1>
          </div>
        </SidebarHeader>
        <SidebarContent>
          <AdminSidebarNav />
        </SidebarContent>
        <SidebarFooter>
            <div className="flex items-center gap-3">
              <Avatar className="size-8">
                <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Admin avatar" />
                <AvatarFallback>A</AvatarFallback>
              </Avatar>
              <div className="flex flex-col text-sm">
                <span className="font-semibold">{user?.user_metadata?.full_name || 'Admin User'}</span>
                <span className="text-muted-foreground">{user?.email}</span>
              </div>
            </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-14 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 lg:px-6">
            <div className="flex items-center gap-2 md:hidden">
              <SidebarTrigger className="-ml-2" />
               <div className="flex items-center gap-2">
                 <Logo className="size-7 text-primary" />
                 <h1 className="text-lg font-semibold">UniNest Admin</h1>
              </div>
            </div>
          <div className="flex flex-1 items-center justify-end gap-2">
              <Button asChild variant="ghost" size="icon">
                <Link href="https://www.instagram.com/uninest_x?igsh=MXhyaXhybmFndzY0NQ==" target="_blank" rel="noopener noreferrer">
                    <Instagram className="size-5" />
                    <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="size-8">
                       {user && <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="Admin avatar" />}
                      <AvatarFallback>
                        {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-5" />}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <>
                      <DropdownMenuLabel>My Account</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                         <Link href="/settings">
                            <Settings className="mr-2 size-4" />
                            Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="mr-2 size-4" />
                        Logout
                      </DropdownMenuItem>
                    </>
                </DropdownMenuContent>
              </DropdownMenu>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-muted/40">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
