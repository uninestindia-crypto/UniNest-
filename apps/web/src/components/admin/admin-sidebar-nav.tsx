
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, ShoppingCart, CreditCard, ScrollText, Settings, Briefcase, Trophy, LifeBuoy, Lightbulb, Megaphone } from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from '@/components/ui/sidebar';
import Link from 'next/link';

const navGroups = [
  {
    label: "Overview",
    items: [
      { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ]
  },
  {
    label: "Management",
    items: [
      { href: '/admin/users', label: 'Users', icon: Users },
      { href: '/admin/listings', label: 'Listings', icon: ShoppingCart },
      { href: '/admin/competitions', label: 'Competitions', icon: Trophy },
      { href: '/admin/internships', label: 'Internships', icon: Briefcase },
    ]
  },
  {
    label: "Growth & Finance",
    items: [
      { href: '/admin/payments', label: 'Payments', icon: CreditCard },
      { href: '/admin/marketing', label: 'Marketing', icon: Megaphone },
    ]
  },
  {
    label: "Support & Logs",
    items: [
      { href: '/admin/suggestions', label: 'Suggestions', icon: Lightbulb },
      { href: '/admin/tickets', label: 'Support Tickets', icon: LifeBuoy },
      { href: '/admin/logs', label: 'Audit Logs', icon: ScrollText },
    ]
  },
  {
    label: "System",
    items: [
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ]
  }
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <>
      {navGroups.map((group, index) => (
        <SidebarGroup key={index}>
          <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
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
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  );
}
