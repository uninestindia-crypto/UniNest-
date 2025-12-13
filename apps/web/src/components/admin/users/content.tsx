
'use client';

import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from 'date-fns';
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, UserCog, UserX, Ban, UserCheck } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { updateUserRole, suspendUser } from "@/app/admin/users/actions";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";

export type UserProfile = {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string;
    role: string;
    created_at: string;
    is_suspended: boolean;
};

type AdminUsersContentProps = {
    initialUsers: UserProfile[];
    initialError: string | null;
}

export default function AdminUsersContent({ initialUsers, initialError }: AdminUsersContentProps) {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<UserProfile[]>(initialUsers);
    const { toast } = useToast();
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const handleRoleChange = async (userId: string, newRole: 'co-admin' | 'student') => {
        setUpdatingUserId(userId);
        const result = await updateUserRole(userId, newRole);
        setUpdatingUserId(null);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.success) {
            toast({ title: 'Success', description: result.message });
            setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
        }
    }

    const handleSuspendToggle = async (userId: string, isCurrentlySuspended: boolean) => {
        setUpdatingUserId(userId);
        const result = await suspendUser(userId, !isCurrentlySuspended);
        setUpdatingUserId(null);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else if (result.success) {
            toast({ title: 'Success', description: result.message });
            setUsers(users.map(u => u.id === userId ? { ...u, is_suspended: !isCurrentlySuspended } : u));
        }
    }

    const getRoleBadgeVariant = (role: string) => {
        switch (role) {
            case 'admin': return 'destructive';
            case 'co-admin': return 'default';
            case 'vendor': return 'secondary';
            default: return 'outline';
        }
    }

    if (initialError) {
        return (
            <Alert variant="destructive">
                <AlertTitle>Error Fetching Users</AlertTitle>
                <AlertDescription>{initialError}</AlertDescription>
            </Alert>
        )
    }

    const columns: ColumnDef<UserProfile>[] = [
        {
            header: "User",
            accessorKey: "full_name",
            sortable: true,
            cell: (user) => (
                <div className="flex items-center gap-3">
                    <Avatar className="size-9 border border-border">
                        <AvatarImage src={user.avatar_url} alt={user.full_name} />
                        <AvatarFallback>{user.full_name?.charAt(0) || user.email?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-medium text-sm text-foreground">{user.full_name || 'N/A'}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                </div>
            )
        },
        {
            header: "Role",
            accessorKey: "role",
            sortable: true,
            cell: (user) => (
                <Badge variant={getRoleBadgeVariant(user.role)} className="uppercase text-[10px]">
                    {user.role}
                </Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "is_suspended",
            sortable: true,
            cell: (user) => (
                user.is_suspended
                    ? <Badge variant="destructive" className="text-[10px]">Suspended</Badge>
                    : <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200 text-[10px]">Active</Badge>
            )
        },
        {
            header: "Joined",
            accessorKey: "created_at",
            sortable: true,
            cell: (user) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(user.created_at), 'PPP')}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (user) => (
                <div className="flex justify-end">
                    {updatingUserId === user.id ? (
                        <Loader2 className="animate-spin size-4 text-muted-foreground" />
                    ) : currentUser?.id === user.id ? (
                        <span className="text-xs text-muted-foreground italic">You</span>
                    ) : user.role === 'admin' ? (
                        <span className="text-xs text-muted-foreground italic">Super Admin</span>
                    ) : (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Manage User</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'co-admin')} disabled={user.role === 'co-admin'}>
                                    <UserCog className="mr-2 size-4" />
                                    Make Co-Admin
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student')} disabled={user.role === 'student'}>
                                    <UserX className="mr-2 size-4" />
                                    Demote to Student
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                {user.is_suspended ? (
                                    <DropdownMenuItem onClick={() => handleSuspendToggle(user.id, user.is_suspended)}>
                                        <UserCheck className="mr-2 size-4" />
                                        Unsuspend User
                                    </DropdownMenuItem>
                                ) : (
                                    <DropdownMenuItem className="text-destructive" onClick={() => handleSuspendToggle(user.id, user.is_suspended)}>
                                        <Ban className="mr-2 size-4" />
                                        Suspend User
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>
            )
        }
    ];

    return (
        <Card className="border-none shadow-none bg-transparent">
            <CardContent className="p-0">
                <DataTable
                    data={users}
                    columns={columns}
                    searchKey="full_name"
                    searchPlaceholder="Search users..."
                />
            </CardContent>
        </Card>
    )
}
