
'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import type { Profile } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { Users } from 'lucide-react';

type UserListCardProps = {
    users: Profile[];
    emptyMessage: string;
};

export default function UserListCard({ users, emptyMessage }: UserListCardProps) {
    const { user } = useAuth();

    if (!users || users.length === 0) {
        return (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-dashed border-border">
                <div className="inline-flex items-center justify-center size-16 rounded-full bg-muted mb-4">
                    <Users className="size-8 text-muted-foreground/50" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">No connections</h3>
                <p className="text-muted-foreground text-sm mt-1 max-w-xs mx-auto">
                    {emptyMessage}
                </p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((profile) => {
                const profileLink = profile.handle ? `/profile/${profile.handle}` : '#';
                return (
                    <Card
                        key={profile.id}
                        className="group hover:shadow-lg transition-all duration-300 hover:border-primary/30"
                    >
                        <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                                <Link href={profileLink} className="flex-shrink-0">
                                    <Avatar className="size-14 ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                                        <AvatarImage src={profile.avatar_url || undefined} />
                                        <AvatarFallback className="text-lg font-semibold bg-gradient-to-br from-primary/20 to-purple-500/20 text-primary">
                                            {profile.full_name?.[0]?.toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div className="flex-1 min-w-0">
                                    <Link href={profileLink} className="block">
                                        <p className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                            {profile.full_name}
                                        </p>
                                        <p className="text-sm text-muted-foreground truncate">
                                            @{profile.handle}
                                        </p>
                                    </Link>
                                </div>
                                {user && user.id !== profile.id && (
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="flex-shrink-0 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-colors"
                                    >
                                        Follow
                                    </Button>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
