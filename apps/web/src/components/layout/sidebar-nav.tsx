

'use client';

import { usePathname } from 'next/navigation';
import {
  Home,
  ShoppingBag,
  LayoutGrid,
  UserCog,
  LogOut,
  Settings,
  Heart,
  Info,
  LifeBuoy,
  Sparkles,
  ArrowLeft,
  Trophy,
  Briefcase,
  Bot,
  User as UserIcon
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

// --- Configuration ---

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/ai/chat', label: 'AI Assistant', icon: Bot, roles: ['student', 'vendor', 'guest', 'admin'] },
];

const secondaryNavItems = [
  { href: '/about', label: 'About Us', icon: Info, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/support', label: 'Support', icon: LifeBuoy, roles: ['student', 'vendor', 'admin'] },
];

const donateItem = { href: '/donate', label: 'Donate', icon: Heart, roles: ['student', 'vendor', 'guest', 'admin'] };

type UserRole = 'student' | 'vendor' | 'admin' | 'guest';

function getRole(user: any): UserRole {
  if (!user) return 'guest';
  return user.user_metadata?.role || 'student';
}

// --- Sidebar Component ---

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
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              isActive={isActive}
              className={cn(
                "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-all duration-200",
                "hover:bg-muted/60 hover:text-foreground",
                isActive
                  ? "primary-gradient text-white font-semibold shadow-md active:scale-95"
                  : "text-muted-foreground"
              )}
              onClick={handleLinkClick}
            >
              <Link href={item.href}>
                <item.icon className={cn("size-4.5 transition-colors", isActive ? "text-white" : "text-muted-foreground")} />
                <span>{item.label}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )
      });
  };

  return (
    <div className="flex flex-col gap-6 px-2 py-4">

      {/* Main Platform Links */}
      <SidebarGroup className="p-0">
        <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Platform
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-2 space-y-1">
          <SidebarMenu>
            {renderNavItems(mainNavItems)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Community / Support */}
      <SidebarGroup className="p-0">
        <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
          Community
        </SidebarGroupLabel>
        <SidebarGroupContent className="mt-2 space-y-1">
          <SidebarMenu>
            {/* Donate - Clean Branding */}
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith('/donate')}
                className={cn(
                  "w-full justify-start gap-3 px-3 py-2.5 text-sm font-medium transition-colors hover:bg-muted/60",
                  pathname.startsWith('/donate') ? "bg-primary/10 text-primary" : "text-muted-foreground"
                )}
                onClick={handleLinkClick}
              >
                <Link href={donateItem.href}>
                  <Heart className={cn("size-4.5", pathname.startsWith('/donate') ? "fill-white text-white" : "")} />
                  <span>{donateItem.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            {renderNavItems(secondaryNavItems)}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className='flex-grow' />

      {/* Admin Section */}
      {role === 'admin' && (
        <SidebarGroup className="p-0 mt-auto">
          <SidebarGroupLabel className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/60">
            Admin Controls
          </SidebarGroupLabel>
          <SidebarGroupContent className="mt-2 space-y-1">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/admin') && !pathname.startsWith('/admin/marketing')}
                  className={cn("w-full justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
                  onClick={handleLinkClick}
                >
                  <Link href="/admin/dashboard">
                    <UserCog className="size-4.5" />
                    <span>Control Panel</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith('/admin/marketing')}
                  className={cn("w-full justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground")}
                  onClick={handleLinkClick}
                >
                  <Link href="/admin/marketing/donations">
                    <Sparkles className="size-4.5" />
                    <span>Marketing</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}

      {/* User Actions */}
      {user && (
        <div className="mt-2 border-t border-border/40 pt-4">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                isActive={pathname === '/settings'}
                className="w-full justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                onClick={handleLinkClick}
              >
                <Link href="/settings">
                  <Settings className="size-4.5" />
                  <span>Settings</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => { handleLinkClick(); signOut(); }}
                className="w-full justify-start gap-3 px-3 py-2 text-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-600 transition-colors"
              >
                <LogOut className="size-4.5" />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      )}
    </div>
  );
}

// --- Mobile Navigation Component ---

export function MobileBottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();
  const role = getRole(user);

  const userHandle = user?.user_metadata?.handle;
  const profileLink = user ? (userHandle ? `/profile/${userHandle}` : '/profile') : '/login';

  const defaultNavItems = [
    { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/marketplace', label: 'Market', icon: ShoppingBag, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/ai/chat', label: 'AI', icon: Bot, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace', label: 'Work', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: profileLink, label: role === 'guest' ? 'Login' : 'Profile', icon: role === 'guest' ? UserIcon : 'avatar', roles: ['student', 'vendor', 'admin', 'guest'] },
  ];

  const workspaceNavItems = [
    { href: '/workspace', label: 'Back', icon: ArrowLeft, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/competitions', label: 'Compete', icon: Trophy, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/internships', label: 'Intern', icon: Briefcase, roles: ['student', 'vendor', 'guest', 'admin'] },
  ];

  let navItems;
  // Simple logic: if deeply inside workspace (but not the root workspace page), show sub-nav
  if (pathname.startsWith('/workspace/') && pathname !== '/workspace') {
    navItems = workspaceNavItems.filter(item => item.roles.includes(role));
  } else {
    // For guest, we map 'Profile' to 'Login' behavior visually if needed, but the link handles it.
    // Ensure we filter correctly.
    navItems = defaultNavItems.filter(item => item.roles.includes(role));
  }

  // Fallback if filter leaves empty (shouldn't happen with correct roles)
  if (navItems.length === 0) return null;

  return (
    <div className="fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
      <nav className="pointer-events-auto h-16 px-6 rounded-2xl border border-white/20 bg-background/70 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-black/60 supports-[backdrop-filter]:bg-background/40">
        <div className="flex bg-transparent h-full items-center gap-1">
          {navItems.map(item => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex flex-col items-center justify-center gap-1 w-16 h-12 rounded-xl transition-all duration-300",
                  "active:scale-90 touch-none", // Tap feedback
                  isActive
                    ? "bg-primary/20 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ring-1 ring-primary/30"
                    : "hover:bg-muted/30"
                )}
              >
                <div className="relative z-10 flex flex-col items-center">
                  {item.icon === 'avatar' ? (
                    <Avatar className={cn(
                      "size-6 transition-all duration-300 border border-transparent",
                      isActive
                        ? "scale-110 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg shadow-primary/20"
                        : "opacity-80 group-hover:opacity-100"
                    )}>
                      {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                      <AvatarFallback className="text-[9px] bg-muted text-muted-foreground font-bold">
                        {user ? user.email?.[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <item.icon className={cn(
                      "size-5 transition-all duration-300",
                      isActive
                        ? "text-primary fill-primary/30 scale-110 drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                        : "text-muted-foreground group-hover:text-foreground"
                    )} />
                  )}
                  {/* Optional Label */}
                  <span className={cn(
                    "text-[9px] font-bold transition-colors mt-1",
                    isActive ? "text-primary" : "text-muted-foreground/70"
                  )}>
                    {item.label}
                  </span>
                </div>
                {/* Visual indicator bar at bottom for active tab */}
                {isActive && (
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary rounded-full animate-in fade-in zoom-in duration-300" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
