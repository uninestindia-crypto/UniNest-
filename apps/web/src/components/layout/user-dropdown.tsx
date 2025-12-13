
'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, User as UserIcon, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

export default function UserDropdown() {
  const { user, signOut, role } = useAuth();

  if (!user) {
    return (
        <Button asChild>
            <Link href="/login">Login</Link>
        </Button>
    )
  }

  const isAdminOrVendor = role === 'admin' || role === 'vendor';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={user.user_metadata?.avatar_url || ''} alt="User avatar" />
            <AvatarFallback>
              {user.email?.[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
          <>
            <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.user_metadata?.full_name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
                <Link href={user.user_metadata?.handle ? `/profile/${user.user_metadata.handle}` : '/profile'}>
                    <UserIcon className="mr-2 size-4" />
                    My Profile
                </Link>
            </DropdownMenuItem>
            {isAdminOrVendor && (
                <DropdownMenuItem asChild>
                    <Link href={role === 'admin' ? '/admin/dashboard' : '/vendor/dashboard'}>
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                    </Link>
                </DropdownMenuItem>
            )}
            <DropdownMenuItem asChild>
                <Link href="/settings">
                <Settings className="mr-2 size-4" />
                Settings
                </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
