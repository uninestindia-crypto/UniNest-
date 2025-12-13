
'use client';

import React, { type ReactNode, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
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
import { Loader2, Instagram, LogOut, Settings, User as UserIcon } from 'lucide-react';
import { DashboardShell } from '@/components/ui/dashboard-shell';
import { AdminSidebarNav } from '@/components/admin/admin-sidebar-nav';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

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
  const sidebarFooter = (
    <div className="flex items-center gap-3 w-full">
      <Avatar className="size-8 border border-border">
        <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt="Admin avatar" />
        <AvatarFallback>A</AvatarFallback>
      </Avatar>
      <div className="flex flex-col text-sm overflow-hidden">
        <span className="font-semibold truncate">{user?.user_metadata?.full_name || 'Admin User'}</span>
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
                <AvatarFallback className="bg-primary/10 text-primary">
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
      title="UniNest Admin"
      sidebarContent={<AdminSidebarNav />}
      sidebarFooter={sidebarFooter}
      headerContent={headerContent}
    >
      {children}
    </DashboardShell>
  );
}
