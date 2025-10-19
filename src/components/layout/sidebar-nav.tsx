

'use client';

import { usePathname } from 'next/navigation';
import { Home, Newspaper, ShoppingBag, BookOpen, UserCog, LogOut, Settings, Heart, LayoutGrid, Info, MessageSquare, Users, Trophy, Briefcase, User as UserIcon, LifeBuoy, Sparkles, ArrowLeft, Network } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Separator } from '../ui/separator';

const mainNavItems = [
  { href: '/', label: 'Home', icon: Home, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/social', label: 'Social', icon: Users, roles: ['student', 'guest', 'admin'] },
  { href: '/marketplace', label: 'Marketplace', icon: ShoppingBag, roles: ['student', 'guest', 'vendor', 'admin'] },
  { href: '/workspace', label: 'Workspace', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
  { href: '/notes', label: 'Study Hub', icon: BookOpen, roles: ['student', 'vendor', 'guest', 'admin'] },
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
        const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
            <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
                asChild
                isActive={isActive}
                className="font-headline"
                onClick={handleLinkClick}
            >
                <Link href={item.href}>
                <item.icon className="size-5" />
                <span>{item.label}</span>
                </Link>
            </SidebarMenuButton>
            </SidebarMenuItem>
        )
      });
  };
  
  return (
    <SidebarMenu>
      {renderNavItems(mainNavItems)}
      
      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {renderNavItems(secondaryNavItems)}


        <div className='flex-grow' />

         <SidebarMenuItem>
            <SidebarMenuButton asChild variant="secondary" className="bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-900 font-bold border-amber-200 dark:border-amber-800 border-2" onClick={handleLinkClick}>
                <Link href="/donate">
                    <Heart className="size-5" />
                    <span>Donate</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>

        {role === 'admin' && (
             <SidebarMenuItem>
                <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith('/admin')}
                    className="font-headline"
                    onClick={handleLinkClick}
                >
                    <Link href="/admin/dashboard">
                    <UserCog className="size-5" />
                    <span>Admin Panel</span>
                    </Link>
                </SidebarMenuButton>
             </SidebarMenuItem>
        )}
        
        {user && (
            <>
                <SidebarMenuItem>
                    <SidebarMenuButton asChild isActive={pathname === '/settings'} className="font-headline" onClick={handleLinkClick}>
                         <Link href="/settings">
                            <Settings className="size-5" />
                            <span>Settings</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={() => { handleLinkClick(); signOut(); }} className="font-headline text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-400">
                        <LogOut className="size-5" />
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
    { href: '/social', label: 'Social', icon: Users, roles: ['student', 'guest', 'admin'] },
    { href: '/workspace', label: 'Work', icon: LayoutGrid, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: profileLink, label: 'Profile', icon: 'avatar', roles: ['student', 'vendor', 'admin'] },
    { href: '/login', label: 'Login', icon: UserIcon, roles: ['guest'] },
  ];

  const socialNavItems = [
    { href: '/social', label: 'Back', icon: ArrowLeft, roles: ['student', 'guest', 'admin'] },
    { href: '/feed', label: 'Feed', icon: Newspaper, roles: ['student', 'guest', 'admin'] },
    { href: '/social/connections', label: 'Connect', icon: Network, roles: ['student', 'guest', 'admin'] },
    { href: '/chat', label: 'Messages', icon: MessageSquare, roles: ['student', 'guest', 'admin'] },
  ];

  const workspaceNavItems = [
    { href: '/workspace', label: 'Back', icon: ArrowLeft, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/competitions', label: 'Compete', icon: Trophy, roles: ['student', 'vendor', 'guest', 'admin'] },
    { href: '/workspace/internships', label: 'Intern', icon: Briefcase, roles: ['student', 'vendor', 'guest', 'admin'] },
  ];

  let navItems;
  if (pathname.startsWith('/social/') || pathname.startsWith('/feed') || pathname.startsWith('/chat')) {
    navItems = socialNavItems.filter(item => item.roles.includes(role));
  } else if (pathname.startsWith('/workspace/')) {
    navItems = workspaceNavItems.filter(item => item.roles.includes(role));
  } else {
    navItems = defaultNavItems.filter(item => item.roles.includes(role));
  }
  
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-card border-t shadow-t-lg z-50">
      <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${navItems.length}, 1fr)`}}>
        {navItems.map(item => {
          let isActive = pathname === item.href;
          // Special case for 'Back' button to not be active
          if (item.label === 'Back') isActive = false;
          if (item.href === '/feed' && pathname.startsWith('/social')) isActive = false;


          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => {}}
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-1 transition-colors",
                isActive ? "text-primary font-bold" : "text-muted-foreground hover:text-primary"
              )}
            >
              {item.icon === 'avatar' ? (
                <Avatar className="size-6">
                  {user && <AvatarImage src={user.user_metadata?.avatar_url} />}
                  <AvatarFallback className="text-xs">
                    {user ? user.email?.[0].toUpperCase() : <UserIcon className="size-4" />}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <item.icon className="size-5" />
              )}
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
