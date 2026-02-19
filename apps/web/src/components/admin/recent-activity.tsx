import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export type RecentActivityItem = {
    id: string; // or some unique identifier
    user: {
        name: string;
        email: string;
        avatar?: string | null;
    };
    amount: number;
    type: 'donation' | 'competition' | 'order';
    status: 'completed' | 'pending' | 'failed';
    created_at: string;
};

type RecentActivityProps = {
    activities: RecentActivityItem[];
}

export function RecentActivity({ activities }: RecentActivityProps) {
    return (
        <Card className="col-span-1 lg:col-span-3 border-border/50 shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg font-semibold text-foreground">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 min-w-0">
                <div className="space-y-6 sm:space-y-8">
                    {activities.length === 0 && <p className="text-sm text-muted-foreground">No recent activity.</p>}
                    {activities.map((activity, index) => (
                        <div key={index} className="flex items-center min-w-0">
                            <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                                <AvatarImage src={activity.user.avatar || undefined} alt={activity.user.name} />
                                <AvatarFallback>{activity.user.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="ml-3 sm:ml-4 space-y-1 min-w-0 flex-1">
                                <p className="text-sm font-medium leading-none truncate">{activity.user.name}</p>
                                <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                    {activity.type === 'donation' ? 'Donated' : activity.type === 'competition' ? 'Competition Entry' : 'New Order'}
                                </p>
                            </div>
                            <div className="ml-2 flex flex-col items-end shrink-0">
                                <div className="font-medium text-sm sm:text-base">+{activity.amount.toLocaleString()}</div>
                                <div className="text-[10px] sm:text-xs text-muted-foreground">
                                    {activity.created_at && formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
