
'use client';

import PageHeader from "@/components/admin/page-header";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import type { Order } from "@/lib/types";

type VendorOrdersContentProps = {
  initialOrders: Order[];
}

export default function VendorOrdersContent({ initialOrders }: VendorOrdersContentProps) {

  const columns: ColumnDef<Order>[] = [
    {
      header: "Customer",
      accessorKey: "buyer",
      cell: (order) => (
        <div className="flex items-center gap-3">
          <Avatar className="size-9 border border-border">
            <AvatarImage src={order.buyer.avatar_url || undefined} alt={order.buyer.full_name || 'Customer'} />
            <AvatarFallback>{order.buyer.full_name?.[0] || 'C'}</AvatarFallback>
          </Avatar>
          <div className="font-medium text-sm text-foreground">{order.buyer.full_name || 'Anonymous'}</div>
        </div>
      )
    },
    {
      header: "Items",
      accessorKey: "order_items", // Accessor not strictly needed for custom cell, but good practice
      cell: (order) => (
        <span className="text-sm text-muted-foreground">
          {order.order_items.map(item => item.products.name).join(', ')}
        </span>
      )
    },
    {
      header: "Amount",
      accessorKey: "total_amount",
      sortable: true,
      cell: (order) => (
        <span className="font-medium">₹{order.total_amount.toLocaleString()}</span>
      )
    },
    {
      header: "Date",
      accessorKey: "created_at",
      sortable: true,
      cell: (order) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(order.created_at), 'PPP')}
        </span>
      )
    },
    {
      header: "Status",
      accessorKey: "status",
      sortable: true,
      cell: (order) => (
        <Badge variant="secondary" className="uppercase text-[10px] tracking-wider">
          {order.status || 'Completed'}
        </Badge>
      )
    }
  ];

  return (
    <div className="space-y-8">
      <PageHeader title="Customer Orders" description="View and manage all your sales." />
      <Card className="border-none shadow-none bg-transparent">
        <CardContent className="p-0">
          <DataTable
            data={initialOrders}
            columns={columns}
            searchKey="status" // Using status as a simple filter for now, ideally would filter by customer name but searchKey only supports top-level string keys currently
            searchPlaceholder="Search by status..."
          />
        </CardContent>
      </Card>
    </div>
  );
}
