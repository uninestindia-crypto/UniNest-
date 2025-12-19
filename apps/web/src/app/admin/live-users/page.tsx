
import PageHeader from "@/components/admin/page-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format, formatDistanceToNow } from "date-fns";
import { Users, Eye, Activity, Clock } from "lucide-react";
import { getLiveUsersStats } from "./actions";

export const revalidate = 0;

function StatCard({ title, value, description, icon: Icon, variant = 'default' }: {
    title: string;
    value: number | string;
    description: string;
    icon: any;
    variant?: 'default' | 'success' | 'warning';
}) {
    const bgClass = variant === 'success' ? 'bg-green-500/10 text-green-600' :
        variant === 'warning' ? 'bg-amber-500/10 text-amber-600' :
            'bg-primary/10 text-primary';

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                <div className={`rounded-full p-2 ${bgClass}`}>
                    <Icon className="size-4" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}

export default async function AdminLiveUsersPage() {
    const { data: stats, error } = await getLiveUsersStats();

    if (error) {
        return (
            <div className="space-y-8">
                <PageHeader title="Live Users & Visitors" description="Real-time tracking of user and visitor activity." />
                <Card>
                    <CardContent className="text-destructive py-8">
                        Error loading live users data: {error}
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="space-y-8">
                <PageHeader title="Live Users & Visitors" description="Real-time tracking of user and visitor activity." />
                <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                        No data available.
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <PageHeader
                title="Live Users & Visitors"
                description="Real-time tracking of user and visitor activity for CRM insights."
            />

            {/* Stats Overview */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toLocaleString()}
                    description="Registered platform users"
                    icon={Users}
                />
                <StatCard
                    title="Active Users"
                    value={stats.activeUsers}
                    description="Active in last 30 minutes"
                    icon={Activity}
                    variant="success"
                />
                <StatCard
                    title="Total Visitors"
                    value={stats.totalVisitors.toLocaleString()}
                    description="Estimated unique visitors"
                    icon={Eye}
                />
                <StatCard
                    title="Active Visitors"
                    value={stats.activeVisitors}
                    description="Currently browsing"
                    icon={Clock}
                    variant="warning"
                />
            </div>

            {/* Recent Activity */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent User Activity</CardTitle>
                    <CardDescription>Latest user sessions and activity on the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Last Activity</TableHead>
                                <TableHead>Current Page</TableHead>
                                <TableHead>Device</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {stats.recentSessions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                        No recent activity to display.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                stats.recentSessions.map((session) => (
                                    <TableRow key={session.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-8">
                                                    <AvatarImage src={session.profiles?.avatar_url || ''} />
                                                    <AvatarFallback>
                                                        {session.profiles?.full_name?.[0] || 'U'}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">
                                                        {session.profiles?.full_name || 'Anonymous Visitor'}
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {session.profiles?.email || session.session_id}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={session.is_authenticated ? 'default' : 'secondary'}>
                                                {session.is_authenticated ? 'Logged In' : 'Visitor'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">
                                                {session.last_activity
                                                    ? formatDistanceToNow(new Date(session.last_activity), { addSuffix: true })
                                                    : 'Unknown'}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <code className="text-xs bg-muted px-2 py-1 rounded">
                                                {session.current_page || '/'}
                                            </code>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {session.device_info || 'Unknown'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20">
                <CardContent className="pt-6">
                    <div className="flex gap-4">
                        <div className="rounded-full bg-blue-500/20 p-3 h-fit">
                            <Activity className="size-5 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-blue-900 dark:text-blue-100">Real-time Tracking</h3>
                            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                                This page shows an overview of user activity. For full real-time tracking with page-level
                                analytics and visitor geolocation, consider integrating with analytics services like
                                Plausible, PostHog, or implementing Supabase Realtime subscriptions.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
