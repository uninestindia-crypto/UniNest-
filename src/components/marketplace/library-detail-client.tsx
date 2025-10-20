'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { MessageSquare, MapPin, Loader2, Armchair, Star, StarOff, AlertCircle, Clock, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';
import ReservationForm from '@/components/booking/reservation-form';

type SeatStatus = 'available' | 'booked' | 'pending';

type Seat = {
    id: string;
    productId: number;
    status: SeatStatus;
    floor: 'Ground Floor' | 'First Floor' | 'Second Floor';
    section: 'Quiet Zone' | 'Window Wing' | 'Group Pods';
    seatType: 'quiet' | 'window' | 'group';
    reservedUntil?: number;
    bookingSlot?: string | null;
    orderId?: number;
    label: string;
    row: number;
    column: number;
};

type LibraryDetailClientProps = {
    library: Product;
    initialSeatProducts: { id: number; name: string }[];
    initialOrders: any[];
    currentUser: User | null;
}

export default function LibraryDetailClient({ library, initialSeatProducts, initialOrders, currentUser }: LibraryDetailClientProps) {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
    const [isBooking, setIsBooking] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [currentOrders, setCurrentOrders] = useState(initialOrders);

    const generateSeatStatus = useCallback((orders: any[], seatProducts: {id: number, name: string}[]) => {
        const seatStatusMap = new Map<number, 'booked' | 'pending'>();
        orders.forEach(order => {
            const seatItem = order.order_items[0];
            if (seatItem?.product_id) {
                if (order.status === 'approved') {
                    seatStatusMap.set(seatItem.product_id, 'booked');
                } else if (order.status === 'pending_approval') {
                    seatStatusMap.set(seatItem.product_id, 'pending');
                }
            }
        });

        const newSeats: Seat[] = seatProducts.map(product => {
            const statusInfo = seatStatusMap.get(product.id);
            const status: Seat['status'] = statusInfo ?? 'available';
            return {
                id: product.name.split(' ')[1] || product.id.toString(), // e.g., "Seat 24" -> "24"
                productId: product.id,
                status,
                floor: 'Ground Floor',
                section: 'Quiet Zone',
                seatType: 'quiet',
            }
        }).sort((a, b) => parseInt(a.id) - parseInt(b.id));

        setSeats(newSeats);
    }, []);

    useEffect(() => {
        generateSeatStatus(currentOrders, initialSeatProducts);
    }, [currentOrders, initialSeatProducts, generateSeatStatus]);
    
    useEffect(() => {
        if (!supabase) return;
        
        const seatProductIds = initialSeatProducts.map(p => p.id);
        
        const fetchAndSetOrders = async () => {
             const { data: newOrdersData } = seatProductIds.length > 0
                ? await supabase
                    .from('orders')
                    .select('id, status, order_items!inner(product_id)')
                    .eq('vendor_id', library.seller_id)
                    .in('order_items.product_id', seatProductIds)
                    .in('status', ['pending_approval', 'approved'])
                : { data: [] };
            if (newOrdersData) setCurrentOrders(newOrdersData);
        }

        const channel = supabase
            .channel(`library_${library.id}_orders`)
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${library.seller_id}` },
                fetchAndSetOrders
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, library.id, library.seller_id, initialSeatProducts]);


     const handleChat = useCallback(async () => {
        if (!currentUser || !supabase) {
            toast({ variant: 'destructive', title: 'Login Required', description: 'Please log in to chat.' });
            return;
        }
        if (currentUser.id === library.seller_id) {
            toast({ variant: 'destructive', title: 'Error', description: 'You cannot start a chat with yourself.' });
            return;
        }

        try {
            const { error } = await supabase.rpc('create_private_chat', {
                p_user1_id: currentUser.id,
                p_user2_id: library.seller_id,
            });

            if (error) throw error;
            
            router.push('/chat');
        } catch (error) {
            console.error('Error starting chat session:', error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not start chat session.' });
        }
    }, [currentUser, supabase, toast, router, library.seller_id, library.name]);

     const handleSeatClick = (seat: Seat) => {
        if (seat.status !== 'available') {
            toast({
                variant: 'destructive',
                description: `This seat is already ${seat.status}.`,
            });
            return;
        }
        setSelectedSeat(seat);
        setIsFormOpen(true);
    };

    const handleBookingRequest = async (bookingSlot: string) => {
        if (!selectedSeat || !currentUser || !supabase) {
             toast({ variant: 'destructive', description: 'Please select a seat and log in to continue.' });
            return false;
        }
        setIsBooking(true);

        const { data: newOrder, error: orderError } = await supabase.from('orders').insert({
            buyer_id: currentUser.id,
            vendor_id: library.seller_id,
            total_amount: library.price,
            status: 'pending_approval',
            booking_slot: bookingSlot,
            booking_date: new Date().toISOString(),
        }).select('id').single();

        if (orderError || !newOrder) {
            toast({ variant: 'destructive', description: 'Failed to create reservation request.'});
            setIsBooking(false);
            return false;
        }

        const { error: itemError } = await supabase.from('order_items').insert({
            order_id: newOrder.id,
            product_id: selectedSeat.productId,
            quantity: 1,
            price: library.price,
            library_id: library.id,
        });
        
        if (itemError) {
            await supabase.from('orders').delete().eq('id', newOrder.id);
            toast({ variant: 'destructive', description: 'Failed to complete reservation details.'});
            setIsBooking(false);
            return false;
        } else {
            toast({ title: 'Reservation Requested!', description: `Your request for seat ${selectedSeat.id} has been sent for approval.` });
            setSelectedSeat(null);
            setIsBooking(false);
            setIsFormOpen(false);
            return true;
        }
    }
    
    const timeSlots = library.seller?.user_metadata?.opening_hours?.split('\n').filter((s: string) => s.trim() !== '') || [];


    return (
        <div className="max-w-6xl mx-auto p-4 space-y-8">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="relative aspect-[4/3]">
                            <Image
                                src={library.image_url || 'https://picsum.photos/seed/library-detail/800/600'}
                                alt={library.name}
                                fill
                                className="object-cover"
                                priority
                                data-ai-hint="library interior books"
                            />
                        </div>
                    </Card>
                    <h1 className="text-3xl lg:text-4xl font-bold font-headline">{library.name}</h1>
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="size-5" />
                        <span className="font-semibold text-foreground">{library.location || 'Location not specified'}</span>
                    </div>
                    <p className="text-muted-foreground">{library.description}</p>
                    
                    <div className="flex flex-col sm:flex-row gap-4">
                        <Button size="lg" variant="outline" className="flex-1 text-lg" onClick={handleChat}>
                            <MessageSquare className="mr-2" />
                            Chat with Manager
                        </Button>
                    </div>

                    <Card className="bg-muted/50">
                        <CardContent className="p-4">
                            <Link href={`/profile/${library.seller.handle}`} className="flex items-center gap-4">
                                <Avatar className="size-12">
                                    <AvatarImage src={library.seller.avatar_url || undefined} />
                                    <AvatarFallback>{library.seller.full_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm text-muted-foreground">Managed by</p>
                                    <p className="font-bold text-lg">{library.seller.full_name}</p>
                                </div>
                            </Link>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Book a Seat (Monthly)</CardTitle>
                            <CardDescription>Select an available seat to request a monthly reservation.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-4 flex flex-col items-center space-y-6">
                            {seats.length > 0 ? (
                                <>
                                    <div className="grid grid-cols-10 gap-2">
                                        {seats.map((seat) => (
                                            <button
                                                key={seat.id}
                                                onClick={() => handleSeatClick(seat)}
                                                disabled={seat.status !== 'available'}
                                                className={cn(
                                                    'p-1 rounded-md transition-colors relative',
                                                    seat.status === 'available' && 'hover:bg-primary/20',
                                                    selectedSeat?.id === seat.id && 'bg-primary text-primary-foreground'
                                                )}
                                            >
                                                <Armchair
                                                    className={cn('size-6',
                                                        seat.status === 'available' && 'text-primary',
                                                        seat.status === 'booked' && 'text-red-500',
                                                        seat.status === 'pending' && 'text-yellow-500',
                                                        selectedSeat?.id === seat.id && 'text-white'
                                                    )}
                                                />
                                                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 text-[8px] font-mono">{seat.id}</span>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="flex flex-wrap justify-center items-center gap-x-6 pt-4 text-sm">
                                        <div className="flex items-center gap-2"><Armchair className="size-5 text-primary" /><span className="text-muted-foreground">Available</span></div>
                                        <div className="flex items-center gap-2"><Armchair className="size-5 text-yellow-500" /><span className="text-muted-foreground">Pending</span></div>
                                        <div className="flex items-center gap-2"><Armchair className="size-5 text-red-500" /><span className="text-muted-foreground">Booked</span></div>
                                    </div>
                                </>
                            ) : (
                                <p className="text-muted-foreground text-center py-10">This library has not listed any seats for booking yet.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Your Monthly Reservation</DialogTitle>
                        <DialogDescription>
                            Select your preferred shift and confirm your details for Seat {selectedSeat?.id}.
                        </DialogDescription>
                    </DialogHeader>
                    {currentUser && selectedSeat && (
                        <ReservationForm
                            seatId={selectedSeat.id}
                            price={library.price}
                            user={currentUser}
                            onSubmit={handleBookingRequest}
                            isLoading={isBooking}
                            timeSlots={timeSlots}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
