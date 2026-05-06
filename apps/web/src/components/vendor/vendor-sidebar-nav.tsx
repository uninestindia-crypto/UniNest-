
'use client';

import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  Library,
  Utensils,
  Bed,
  Laptop,
  PlusCircle,
  LineChart,
  ShieldCheck,
  MessageSquare,
  Tag,
} from 'lucide-react';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { Separator } from '../ui/separator';

const overviewItems = [
  { href: '/vendor/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/vendor/analytics', label: 'Analytics', icon: LineChart },
];

const marketplaceItems = [
  { href: '/vendor/products', label: 'My Listings', icon: Package },
  { href: '/vendor/products/new', label: 'Add New Listing', icon: PlusCircle },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/promotions', label: 'Offers & Discounts', icon: Tag },
];

const categoryDashboards = [
  { id: 'library', label: 'Library Hub', icon: Library },
  { id: 'food-mess', label: 'Food Mess Hub', icon: Utensils },
  { id: 'hostels', label: 'Hostel Hub', icon: Bed },
  { id: 'cybercafe', label: 'Cybercafé Hub', icon: Laptop },
];

export function VendorSidebarNav() {
  const pathname = usePathname();
  const { vendorCategories } = useAuth();

  const vendorSpecificDashboards = categoryDashboards.filter((dash) => {
    const dashLabel = dash.id.replace('-', ' ').toLowerCase();
    return vendorCategories?.some((cat) => cat.toLowerCase() === dashLabel);
  });

  const NavItem = ({ item }: { item: { href: string; label: string; icon: React.ElementType } }) => (
    <SidebarMenuItem key={item.href}>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.href || (item.href !== '/vendor/dashboard' && pathname.startsWith(item.href))}
      >
        <Link href={item.href}>
          <item.icon className="size-4" />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <SidebarMenu>
      {/* Overview Section */}
      <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Overview</li>
      {overviewItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {/* Marketplace Section */}
      <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">My Business</li>
      {marketplaceItems.map((item) => (
        <NavItem key={item.href} item={item} />
      ))}

      {vendorSpecificDashboards.length > 0 && (
        <>
          <SidebarMenuItem>
            <Separator className="my-2" />
          </SidebarMenuItem>
          <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Service Hubs
          </li>
          {vendorSpecificDashboards.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton asChild isActive={pathname === `/vendor/dashboard/${item.id}`}>
                <Link href={`/vendor/dashboard/${item.id}`}>
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </>
      )}

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {/* Account Section */}
      <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Account</li>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/chat')}>
          <Link href="/vendor/chat">
            <MessageSquare className="size-4" />
            <span>Messages</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/subscription')}>
          <Link href="/vendor/subscription">
            <ShieldCheck className="size-4" />
            <span>Subscription</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <div className="flex-grow" />

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/settings')}>
          <Link href="/vendor/settings">
            <Settings className="size-4" />
            <span>Settings</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
