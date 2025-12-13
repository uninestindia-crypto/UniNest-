
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';

type UserListCardProps = {
  users: Profile[];
  emptyMessage: string;
};

export default function UserListCard({ users, emptyMessage }: UserListCardProps) {
    const { user } = useAuth();
    
    if (!users || users.length === 0) {
        return (
             <Card>
                <CardContent className="p-8 text-center text-muted-foreground">
                    {emptyMessage}
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardContent className="p-4 space-y-4">
                {users.map(profile => {
                    const profileLink = profile.handle ? `/profile/${profile.handle}` : '#';
                    return (
                    <div key={profile.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted">
                        <Link href={profileLink} className="flex items-center gap-3">
                             <Avatar>
                                <AvatarImage src={profile.avatar_url || undefined} />
                                <AvatarFallback>{profile.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-semibold">{profile.full_name}</p>
                                <p className="text-sm text-muted-foreground">@{profile.handle}</p>
                            </div>
                        </Link>
                        {user && user.id !== profile.id && (
                            <Button variant="outline" size="sm">Follow</Button>
                        )}
                    </div>
                )})}
            </CardContent>
        </Card>
    );
}
