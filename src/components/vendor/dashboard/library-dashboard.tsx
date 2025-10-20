
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Armchair, Book, CheckCircle, PlusCircle, Users, Settings, Clock, ThumbsUp, X, Loader2 } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from 'date-fns';
import { Badge } from "@/components/ui/badge";


type LibraryDashboardProps = {
    products: Product[];
    orders: any[];
}

export default function LibraryDashboard({ products, orders: initialOrders }: LibraryDashboardProps) {
    const { supabase, user } = useAuth();
    const { toast } = useToast();
    const router = useRouter();
    const [orders, setOrders] = useState(initialOrders);
    const [updatingOrderId, setUpdatingOrderId] = useState<number | null>(null);

    const library = products.find(p => p.category === 'Library');

    const pendingApprovals = orders.filter(o => o.status === 'pending_approval');
    const approvedBookings = orders.filter(o => o.status === 'approved');
    const totalSeats = library?.total_seats || 0;
    const availableSeats = Math.max(totalSeats - approvedBookings.length, 0);
    const openingHours = library?.opening_hours ?? [];
    const amenities = library?.amenities ?? [];
    const contactPhone = library?.phone_number;
    const contactWhatsApp = library?.whatsapp_number;
    const specialNotes = library?.special_notes;
    const libraryPrice = useMemo(() => {
        if (!library) return null;
        if (library.subscription_price) return library.subscription_price;
        return library.price;
    }, [library]);

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

    if (!library) {
        return (
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold">No Library Found</h2>
                <p className="text-muted-foreground mt-2">You haven't created a library listing yet.</p>
                <Button asChild className="mt-4">
                    <Link href="/vendor/products/new?category=Library"><PlusCircle className="mr-2"/> Create Library Listing</Link>
                </Button>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold tracking-tight">{library.name} - Dashboard</h2>
                 <Button variant="outline" asChild>
                    <Link href={`/vendor/products/${library.id}/edit`}>
                        <Settings className="mr-2"/> Configure Library
                    </Link>
                </Button>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Armchair className="text-primary"/> Seat Status</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                        <div className="flex justify-between"><span>Total Seats</span><span className="font-bold">{totalSeats}</span></div>
                        <div className="flex justify-between"><span>Booked</span><span className="font-bold text-green-500">{approvedBookings.length}</span></div>
                        <div className="flex justify-between"><span>Available</span><span className="font-bold">{availableSeats}</span></div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><Users className="text-primary"/> Memberships</CardTitle></CardHeader>
                    <CardContent className="text-center text-muted-foreground pt-4">
                        <p>Membership feature coming soon!</p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Clock className="text-primary"/> Opening Hours</CardTitle>
                        <CardDescription>Shifts currently available for students.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {openingHours.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                                {openingHours.map(slot => (
                                    <Badge key={slot} variant="outline">{slot}</Badge>
                                ))}
                            </div>
                        ) : (
                            <p className="text-muted-foreground">No shifts configured yet. Update your listing to add them.</p>
                        )}
                        {libraryPrice != null && (
                            <div className="rounded-lg bg-muted/50 p-3 text-sm">
                                <span className="font-semibold text-foreground">Standard fee:</span> ₹{libraryPrice.toLocaleString('en-IN')}{library.subscription_price ? '/mo' : ''}
                            </div>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Book className="text-primary"/> Amenities & Contact</CardTitle>
                        <CardDescription>Keep students informed about facilities and support channels.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm">
                        <div>
                            <p className="font-semibold mb-1">Amenities</p>
                            {amenities.length > 0 ? (
                                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                                    {amenities.map(item => (
                                        <li key={item}>{item}</li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-muted-foreground">Share the amenities you provide to improve conversions.</p>
                            )}
                        </div>
                        <div className="grid gap-1">
                            {contactPhone && <span><span className="font-semibold">Phone:</span> {contactPhone}</span>}
                            {contactWhatsApp && <span><span className="font-semibold">WhatsApp:</span> {contactWhatsApp}</span>}
                            {!contactPhone && !contactWhatsApp && <span className="text-muted-foreground">Add a phone or WhatsApp number so students can reach you quickly.</span>}
                        </div>
                        {specialNotes && (
                            <div className="rounded-lg border p-3 text-muted-foreground">
                                <p className="font-semibold text-foreground mb-1">Important notes</p>
                                <p>{specialNotes}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card>
                 <CardHeader>
                    <CardTitle>Pending Approvals ({pendingApprovals.length})</CardTitle>
                    <CardDescription>Review and approve or reject monthly seat reservation requests.</CardDescription>
                </CardHeader>
                <CardContent>
                    {pendingApprovals.length > 0 ? (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Student</TableHead>
                                    <TableHead>Seat</TableHead>
                                    <TableHead>Requested On</TableHead>
                                    <TableHead>Shift</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {pendingApprovals.map(booking => (
                                    <TableRow key={booking.id}>
                                        <TableCell className="font-medium">{booking.buyer?.full_name || 'N/A'}</TableCell>
                                        <TableCell>
                                            Seat {booking.order_items?.map((oi: any) => oi.products?.name.split(' ')[1] || 'N/A').join(', ') || 'N/A'}
                                        </TableCell>
                                        <TableCell>
                                            {booking.created_at ? format(new Date(booking.created_at), 'PPP') : 'N/A'}
                                        </TableCell>
                                         <TableCell>
                                            <Badge variant="outline">{booking.booking_slot || 'N/A'}</Badge>
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
                        <p className="text-muted-foreground text-center py-10">No pending approvals.</p>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
