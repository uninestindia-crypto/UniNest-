
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

type RecentOrdersTableProps = {
    orders: Order[];
    loading: boolean;
}

export default function RecentOrdersTable({ orders, loading }: RecentOrdersTableProps) {
  return (
    <Card className="shadow-sm h-full">
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
        <CardDescription>
            {loading ? 'Loading...' : orders.length > 0 ? `You have ${orders.length} recent orders.` : 'You have no sales yet.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
            {loading ? (
                <div className="text-center text-muted-foreground py-10">Loading orders...</div>
            ) : orders.length > 0 ? orders.map(order => {
                 const buyerName = order.buyer?.full_name || 'N/A';
                 const buyerInitials = buyerName.split(' ').map(n => n[0]).join('') || 'U';

                return (
                 <div key={order.id} className="flex items-center">
                    <Avatar className="h-9 w-9">
                    <AvatarImage src={order.buyer?.avatar_url || ''} alt="Avatar" data-ai-hint="person face" />
                    <AvatarFallback>{buyerInitials}</AvatarFallback>
                    </Avatar>
                    <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{buyerName}</p>
                    <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(order.created_at), { addSuffix: true })}
                    </p>
                    </div>
                    <div className="ml-auto font-medium">+₹{order.total_amount.toLocaleString()}</div>
                </div>
            )}) : (
              <div className="text-center text-muted-foreground py-10">
                <p>No recent orders to display.</p>
              </div>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
