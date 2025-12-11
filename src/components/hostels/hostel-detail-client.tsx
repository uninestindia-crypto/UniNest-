'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { IndianRupee, Loader2, MapPin, BedDouble } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

type Room = Product & {
    status: 'available' | 'booked' | 'pending';
}

type HostelDetailClientProps = {
    hostel: Product;
    initialRooms: Product[];
    initialOrders: any[];
    currentUser: User | null;
}

export default function HostelDetailClient({ hostel, initialRooms, initialOrders, currentUser }: HostelDetailClientProps) {
    const { supabase } = useAuth();
    const { toast } = useToast();

    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [currentOrders, setCurrentOrders] = useState(initialOrders);

    const generateRoomsWithStatus = useCallback((orders: any[]) => {
        const roomStatusMap = new Map<number, 'booked' | 'pending'>();
        orders.forEach(order => {
            const roomItem = order.order_items[0];
            if (roomItem?.product_id) {
                 if (order.status === 'approved') {
                    roomStatusMap.set(roomItem.product_id, 'booked');
                } else if (order.status === 'pending_approval') {
                    roomStatusMap.set(roomItem.product_id, 'pending');
                }
            }
        });

        const newRooms: Room[] = initialRooms.map(room => ({
            ...room,
            status: roomStatusMap.get(room.id) || 'available',
        }));
        setRooms(newRooms);
    }, [initialRooms]);

    useEffect(() => {
        generateRoomsWithStatus(currentOrders);
    }, [currentOrders, generateRoomsWithStatus]);

    useEffect(() => {
        if (!supabase) return;

        const roomIds = initialRooms.map(r => r.id);
        const channel = supabase
          .channel(`hostel_${hostel.id}_orders`)
          .on(
            'postgres_changes',
            { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${hostel.seller_id}` },
            async (payload) => {
                 const { data: newOrdersData } = await supabase
                    .from('orders')
                    .select('id, status, order_items!inner(product_id)')
                    .eq('vendor_id', hostel.seller_id)
                    .in('order_items.product_id', roomIds)
                    .in('status', ['pending_approval', 'approved']);
                if (newOrdersData) setCurrentOrders(newOrdersData);
            }
          )
          .subscribe();
    
        return () => {
          supabase.removeChannel(channel);
        };
    }, [supabase, hostel.id, hostel.seller_id, initialRooms]);


    const handleRoomClick = (room: Room) => {
        if (room.status !== 'available') {
            toast({
                variant: 'destructive',
                description: `This room is already ${room.status}.`,
            });
            return;
        }
        setSelectedRoom((prev) => (prev?.id === room.id ? null : room));
    };

    const handleBookingRequest = async () => {
        if (!selectedRoom || !currentUser || !supabase) {
             toast({ variant: 'destructive', description: 'Please select a room and log in to continue.' });
            return;
        }
        setIsBooking(true);

        const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
            buyer_id: currentUser.id,
            vendor_id: hostel.seller_id,
            total_amount: selectedRoom.price,
            status: 'pending_approval'
        }).select('id').single();

        if (orderError || !newOrder) {
            toast({ variant: 'destructive', description: 'Failed to create reservation request.'});
            setIsBooking(false);
            return;
        }

        const { error: itemError } = await supabase.from('order_items').insert({
            order_id: newOrder.id,
            product_id: selectedRoom.id,
            quantity: 1,
            price: selectedRoom.price,
        });
        
        if (itemError) {
            await supabase.from('orders').delete().eq('id', newOrder.id);
            toast({ variant: 'destructive', description: 'Failed to complete reservation details.'});
        } else {
            toast({
                title: 'Reservation Requested!',
                description: `Your request for room ${selectedRoom.name} has been sent for approval.`,
            });
            setSelectedRoom(null);
        }
        setIsBooking(false);
    }
    
    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="grid md:grid-cols-5 gap-8">
                <div className="md:col-span-2 space-y-6">
                     <Card className="overflow-hidden">
                        <div className="relative aspect-[4/3]">
                            <Image
                                src={hostel.image_url || 'https://picsum.photos/seed/hostel-detail/800/600'}
                                alt={hostel.name}
                                fill
                                className="object-cover"
                                priority
                                data-ai-hint="hostel building exterior"
                            />
                        </div>
                    </Card>
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{hostel.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-5" />
                        <span className="font-semibold text-foreground">{hostel.location || 'Location not specified'}</span>
                    </div>
                    <p className="text-muted-foreground">{hostel.description}</p>

                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                             <Link href={`/profile/${hostel.seller.handle}`} className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={hostel.seller.avatar_url || undefined} />
                                    <AvatarFallback>{hostel.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-muted-foreground">Managed by</p>
                                    <p className="font-bold text-lg">{hostel.seller.full_name}</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book a Room</CardTitle>
                            <CardDescription>Select an available room to request a booking.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col items-center space-y-6">
                             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                                {rooms.map((room) => (
                                    <button
                                        key={room.id}
                                        onClick={() => handleRoomClick(room)}
                                        disabled={room.status !== 'available'}
                                        className={cn(
                                            'p-4 rounded-lg border-2 text-left space-y-2 transition-all',
                                            room.status === 'available' && 'hover:border-primary',
                                            selectedRoom?.id === room.id && 'bg-accent text-accent-foreground border-accent-foreground',
                                            room.status === 'booked' && 'bg-red-100 dark:bg-red-900/50 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
                                            room.status === 'pending' && 'bg-yellow-100 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300'
                                        )}
                                    >
                                        <div className="flex items-center gap-2">
                                            <BedDouble className="size-5"/>
                                            <span className="font-bold truncate">{room.name}</span>
                                        </div>
                                        <div className="text-sm">₹{room.price.toLocaleString()}/mo</div>
                                        <Badge variant="secondary" className="capitalize">{room.status}</Badge>
                                    </button>
                                ))}
                            </div>
                            {rooms.length === 0 && <p className="text-muted-foreground text-center py-8">No rooms have been listed for this hostel yet.</p>}
                        </CardContent>
                        <CardFooter className="flex-col items-stretch space-y-4">
                            <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Selected Room:</span>
                                <span className="font-bold">{selectedRoom?.name || 'None'}</span>
                            </div>
                             <div className="flex justify-between items-center text-lg">
                                <span className="text-muted-foreground">Price:</span>
                                <span className="font-bold">{selectedRoom ? `₹${selectedRoom.price.toLocaleString()}/mo (Pay at hostel)` : '₹0'}</span>
                            </div>
                            <Button size="lg" className="w-full" disabled={!selectedRoom || !currentUser || isBooking} onClick={handleBookingRequest}>
                                {isBooking && <Loader2 className="animate-spin mr-2" />}
                                Request Reservation
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
