

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, UserCog, LogOut, Settings, Heart, LayoutGrid, Info, MessageSquare, Users, Trophy, Briefcase, User as UserIcon, LifeBuoy, Sparkles, ArrowLeft, Network, Download } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
];

const secondaryNavItems = [
  { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/support', label: 'Support', icon: LifeBuoy, roles: ['student', 'vendor', 'admin'] },
];

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: any): UserRole {
  if (!user) return 'guest';
  return user.user_metadata?.role || 'student';
}

export function SidebarNav() {
  const pathname = usePathname();
  const { user, signOut, role } = useAuth();
  const { setOpenMobile } = useSidebar();
  const userRole = role;

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  const renderNavItems = (items: typeof mainNavItems) => {
    return items
      .filter(item => item.roles.includes(userRole))
      .map(item => {
        // More specific matching for home to avoid it being active on all pages
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2 text-sm font-medium transition-all duration-200 ease-in-out",
                "hover:translate-x-1 hover:bg-accent hover:text-accent-foreground",
                isActive ? "bg-primary/10 text-primary font-semibold border-r-2 border-primary rounded-r-none" : "text-muted-foreground"
              )}
              onClick={handleLinkClick}
            >
              <Link href={item.href}>
                <item.icon className={cn("size-4 transition-transform duration-200", isActive && "scale-110")} />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      });
  };

  return (
    <SidebarMenu className="gap-1 px-2">
      {renderNavItems(mainNavItems)}

      <SidebarMenuItem>
        <Separator className="my-4 bg-border/50" />
      </SidebarMenuItem>

      {renderNavItems(secondaryNavItems)}


      <div className='flex-grow' />

      <SidebarMenuItem className="mt-auto pt-4">
        <SidebarMenuButton
          asChild
          className="group relative overflow-hidden rounded-xl border border-amber-200/50 bg-gradient-to-br from-amber-50 to-amber-100/50 p-0 text-amber-700 transition-all hover:border-amber-300 hover:shadow-md dark:border-amber-900/30 dark:from-amber-950/30 dark:to-amber-900/10 dark:text-amber-400"
          onClick={handleLinkClick}
        >
          <Link href="/donate" className="flex w-full items-center justify-center gap-2 py-2.5">
            <Heart className="size-4 transition-transform duration-300 group-hover:scale-110 group-hover:fill-current" />
            <span className="font-semibold tracking-wide">Donate</span>
            <div className="absolute inset-0 -z-10 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 group-hover:animate-shimmer" />
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {role === 'admin' && (
        <div className="mt-6 flex flex-col gap-1 rounded-xl bg-muted/30 p-2">
          <p className="px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Admin</p>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/admin') && !pathname.startsWith('/admin/marketing')}
              className={cn("text-xs", pathname.startsWith('/admin') && !pathname.startsWith('/admin/marketing') && "bg-background shadow-sm")}
              onClick={handleLinkClick}
            >
              <Link href="/admin/dashboard">
                <UserCog className="size-4" />
                <span>Panel</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith('/admin/marketing')}
              className={cn("text-xs", pathname.startsWith('/admin/marketing') && "bg-background shadow-sm")}
              onClick={handleLinkClick}
            >
              <Link href="/admin/marketing/donations">
                <Sparkles className="size-4" />
                <span>Donations</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </div>
      )}

      {user && (
        <>
          <Separator className="my-2" />
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === '/settings'} className="text-muted-foreground hover:text-foreground" onClick={handleLinkClick}>
              <Link href="/settings">
                <Settings className="size-4" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => { handleLinkClick(); signOut(); }} className="group text-muted-foreground hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30 dark:hover:text-red-400">
              <LogOut className="size-4 transition-transform group-hover:-translate-x-1" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </>
      )}
    </SidebarMenu>
  );
}


export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = getRole(user);

  const userHandle = user?.user_metadata?.handle;
  const profileLink = user ? (userHandle ? `/profile/${userHandle}` : '/profile') : '/login';

  const defaultNavItems = [
    { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/marketplace', label: 'Market', icon: ShoppingBag, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace', label: 'Work', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: profileLink, label: 'Profile', icon: 'avatar', roles: ['student', 'vendor', 'admin'] },
    { href: '/login', label: 'Login', icon: UserIcon, roles: ['guest'] },
  ];

  const workspaceNavItems = [
    { href: '/workspace', label: 'Back', icon: ArrowLeft, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/competitions', label: 'Compete', icon: Trophy, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/internships', label: 'Intern', icon: Briefcase, roles: ['student', 'vendor', 'guest', 'admin'] },
  ];

  let navItems;
  if (pathname.startsWith('/workspace/')) {
    navItems = workspaceNavItems.filter(item => item.roles.includes(role));
  } else {
    navItems = defaultNavItems.filter(item => item.roles.includes(role));
  }

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto h-16 w-full max-w-md rounded-2xl border border-white/10 bg-background/80 shadow-2xl backdrop-blur-xl dark:border-white/5 dark:bg-black/80 supports-[backdrop-filter]:bg-background/60">
        <div className="grid h-full w-full place-items-center px-2" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)` }}>
          {navItems.map(item => {
            let isActive = pathname === item.href;
            if (item.label === 'Back') isActive = false;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex h-full w-full flex-col items-center justify-center gap-1"
              >
                {/* Active Indicator */}
                {isActive && (
                  <span className="absolute -top-[1px] h-[3px] w-8 rounded-b-full bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)] transition-all" />
                )}

                {/* Background Hover Pill */}
                <span className={cn(
                  "absolute inset-x-1 inset-y-2 rounded-xl transition-colors duration-200",
                  isActive ? "bg-primary/10" : "group-hover:bg-muted/50"
                )} />

                <div className="relative z-10 flex flex-col items-center gap-0.5">
                  {item.icon === 'avatar' ? (
                    <Avatar className={cn(
                      "size-5 transition-all duration-300",
                      isActive ? "scale-110 ring-2 ring-primary ring-offset-1 ring-offset-background" : "group-hover:scale-105"
                    )}>
                      {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                      <AvatarFallback className="text-[9px] bg-muted text-muted-foreground">
                        {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-3" />}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <item.icon className={cn(
                      "size-5 transition-all duration-300",
                      isActive ? "text-primary -translate-y-0.5" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  )}
                  <span className={cn(
                    "text-[10px] font-medium transition-colors",
                    isActive ? "text-primary" : "text-muted-foreground/80 group-hover:text-foreground"
                  )}>
                    {item.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
