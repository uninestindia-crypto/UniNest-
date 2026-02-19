

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
  CheckCircle2,
  LineChart,
  Megaphone,
  ShieldCheck,
  MessageSquare
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
  { href: '/vendor/products', label: 'My Products', icon: Package },
  { href: '/vendor/products/new', label: 'Add New Product', icon: PlusCircle },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
];

const businessItems = [
  { href: '/vendor/onboarding', label: 'Onboarding', icon: CheckCircle2 },
  { href: '/vendor/subscription', label: 'Subscription', icon: ShieldCheck },
  { href: '/vendor/promotions', label: 'Promotions', icon: Megaphone },
];

const categoryDashboards = [
  { id: "library", label: "Library Hub", icon: Library },
  { id: "food-mess", label: "Food Mess Hub", icon: Utensils },
  { id: "hostels", label: "Hostel Hub", icon: Bed },
  { id: "cybercafe", label: "Cybercafé Hub", icon: Laptop },
];

export function VendorSidebarNav() {
  const pathname = usePathname();
  const { vendorCategories } = useAuth();

  const vendorSpecificDashboards = categoryDashboards.filter(dash =>
    vendorCategories?.includes(dash.id.replace('-', ' '))
  );

  const NavItem = ({ item }: { item: any }) => (
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
      {overviewItems.map(item => <NavItem key={item.href} item={item} />)}

      <SidebarMenuItem>
        <Separator className="my-2" />
      </SidebarMenuItem>

      {/* Marketplace Section */}
      <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Marketplace</li>
      {marketplaceItems.map(item => <NavItem key={item.href} item={item} />)}

      {vendorSpecificDashboards.length > 0 && (
        <>
          <SidebarMenuItem>
            <Separator className="my-2" />
          </SidebarMenuItem>
          <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Service Hubs</li>
          {vendorSpecificDashboards.map(item => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                asChild
                isActive={pathname === `/vendor/dashboard/${item.id}`}
              >
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

      {/* Business Section */}
      <li className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Business</li>
      {businessItems.map(item => <NavItem key={item.href} item={item} />)}
      <SidebarMenuItem>
        <SidebarMenuButton asChild isActive={pathname.startsWith('/vendor/chat')}>
          <Link href="/vendor/chat">
            <MessageSquare className="size-4" />
            <span>Messages</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <div className='flex-grow' />

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

