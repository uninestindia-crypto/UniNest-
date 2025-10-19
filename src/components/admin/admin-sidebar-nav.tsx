
'use client';

import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, CreditCard, ScrollText, Settings, Briefcase, Trophy, LifeBuoy, Lightbulb, Megaphone } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/listings', label: 'Listings', icon: ShoppingCart },
  { href: '/admin/payments', label: 'Payments', icon: CreditCard },
  { href: '/admin/competitions', label: 'Competitions', icon: Trophy },
  { href: '/admin/internships', label: 'Internships', icon: Briefcase },
  { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
  { href: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
  { href: '/admin/marketing', label: 'Marketing', icon: Megaphone },
  { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(item.href)}
          >
            <Link href={item.href}>
              <item.icon className="size-4" />
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
