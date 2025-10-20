
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Bed, Users, IndianRupee, Settings, PlusCircle, ThumbsUp, X, Loader2 } from "lucide-react";
import type { Product } from "@/lib/types";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

type HostelDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function HostelDashboard({ products, orders: initialOrders }: HostelDashboardProps) {
    const { supabase } = useAuth();
    const { toast } = useToast();
    const [orders, setOrders] = useState(initialOrders);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);
    
    const hostel = products.find(p => p.category === 'Hostels');
    const rooms = products.filter(p => p.category === 'Hostel Room');

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval');

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    const uniqueTenants = new Set(orders.map(o => o.buyer_id)).size;

    const stats = { revenue: totalRevenue, tenants: uniqueTenants };
    const utilities = hostel?.utilities_included ?? [];
    const houseRules = hostel?.house_rules;
    const contactPhone = hostel?.phone_number;
    const contactWhatsApp = hostel?.whatsapp_number;
    const specialNotes = hostel?.special_notes;
    const roomTypeSummaries = useMemo(() => {
        if (!hostel?.room_types) return null;
        return hostel.room_types.map((entry) => {
            const [label, beds, price] = entry.split(' - ').map(part => part.trim());
            return { label, beds, price };
        });
    }, [hostel?.room_types]);
    
    const handleApproval = async (orderId: number, newStatus: 'approved' | 'rejected') => {
        if (!supabase) return;
        setUpdatingOrderId(orderId);
        
        const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
        
        if (error) {
            toast({ variant: 'destructive', title: 'Error', description: `Failed to ${newStatus === 'approved' ? 'approve' : 'reject'} booking.` });
        } else {
            toast({ title: 'Success', description: `Booking has been ${newStatus}.` });
            setOrders(currentOrders => currentOrders.filter(o => o.id !== orderId));
        }
        setUpdatingOrderId(null);
    }

    if (!hostel) {
       return (
         <div className="text-center py-10">
                <h2 className="text-2xl font-bold">No Hostel Found</h2>
                <p className="text-muted-foreground mt-2">You haven't created a hostel listing yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/vendor/products/new?category=Hostels"><PlusCircle className="mr-2"/> Create Hostel Listing</Link>
                </Button>
            </div>
       )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{hostel.name} - Dashboard</h2>
                 <Button variant="outline" asChild>
                    <Link href={`/vendor/products/${hostel.id}/edit`}>
                        <Settings className="mr-2"/> Configure Hostel
                    </Link>
                </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Tenants</CardTitle>
                        <Users className="text-primary"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">{stats.tenants}</p>
                        <p className="text-sm text-muted-foreground">based on unique bookings</p>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Total Revenue</CardTitle>
                        <IndianRupee className="text-green-500"/>
                    </CardHeader>
                    <CardContent>
                        <p className="text-3xl font-bold">₹{stats.revenue.toLocaleString()}</p>
                        <p className="text-sm text-muted-foreground">from all-time bookings</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Bed className="text-primary"/> Room Mix & Occupancy</CardTitle>
                        <CardDescription>Overview of beds offered and typical pricing.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        {roomTypeSummaries && roomTypeSummaries.length > 0 ? (
                            <div className="grid gap-2">
                                {roomTypeSummaries.map((roomType, index) => (
                                    <div key={`${roomType.label ?? 'type'}-${index}`} className="rounded-lg border p-3 flex flex-col gap-1">
                                        <span className="font-semibold text-foreground">{roomType.label || 'Room Type'}</span>
                                        {roomType.beds && <span className="text-muted-foreground">Beds: {roomType.beds}</span>}
                                        {roomType.price && <span className="text-muted-foreground">Pricing: {roomType.price}</span>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">Add room type details in your listing to showcase capacity and pricing.</p>
                        )}
                        {specialNotes && (
                            <div className="rounded-lg bg-muted/50 p-3">
                                <p className="font-semibold text-foreground">Highlights</p>
                                <p className="text-muted-foreground mt-1">{specialNotes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Utilities & Rules</CardTitle>
                        <CardDescription>What residents can expect on move-in.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold mb-1">Utilities Included</p>
                            {utilities.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {utilities.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">List utilities (Wi-Fi, laundry, housekeeping) to build trust.</p>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold mb-1">House Rules</p>
                            {houseRules ? (
                                <p className="text-muted-foreground whitespace-pre-wrap">{houseRules}</p>
                            ) : (
                                <p className="text-muted-foreground">Share rules such as curfews or guest policies to set expectations.</p>
                            )}
                        </div>
                        <div className="grid gap-1">
                            {contactPhone && <span><span className="font-semibold">Phone:</span> {contactPhone}</span>}
                            {contactWhatsApp && <span><span className="font-semibold">WhatsApp:</span> {contactWhatsApp}</span>}
                            {!contactPhone && !contactWhatsApp && <span className="text-muted-foreground">Add contact details so prospects can reach you instantly.</span>}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Bed className="text-primary"/> Room Listings</CardTitle>
                        <CardDescription>Manage your available rooms.</CardDescription>
                    </div>
                    <Button asChild><Link href="/vendor/products/new?category=Hostel Room"><PlusCircle className="mr-2"/> Add Room</Link></Button>
                </CardHeader>
                 <CardContent>
                     {rooms.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Room Name/Number</TableHead>
                                    <TableHead>Price</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rooms.map(room => (
                                    <TableRow key={room.id}>
                                        <TableCell className="font-medium">{room.name}</TableCell>
                                        <TableCell>₹{room.price.toLocaleString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="sm" asChild>
                                                <Link href={`/vendor/products/${room.id}/edit`}>Edit</Link>
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    ) : (
                         <p className="text-muted-foreground text-center py-10 col-span-full">No rooms listed for this hostel. <Link href="/vendor/products/new?category=Hostel Room" className="text-primary underline">Add a room now</Link>.</p>
                    )}
                </CardContent>
            </Card>

            <Card>
                 <CardHeader>
                    <CardTitle>Pending Bookings ({pendingApprovals.length})</CardTitle>
                    <CardDescription>Approve or reject new room booking requests.</CardDescription>
                </CardHeader>
                <CardContent>
                     {pendingApprovals.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Room</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApprovals.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            {booking.order_items.map((oi: any) => oi.products?.name || 'N/A').join(', ')}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">{booking.status}</Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            {updatingOrderId === booking.id ? (
                                                <Loader2 className="size-5 animate-spin inline-flex" />
                                            ) : (
                                                <>
                                                    <Button size="icon" variant="outline" className="text-green-500" onClick={() => handleApproval(booking.id, 'approved')}><ThumbsUp /></Button>
                                                    <Button size="icon" variant="outline" className="text-red-500" onClick={() => handleApproval(booking.id, 'rejected')}><X /></Button>
                                                </>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                     ) : (
                        <p className="text-muted-foreground text-center py-10">No pending bookings.</p>
                     )}
                </CardContent>
            </Card>

        </div>
    );
}
