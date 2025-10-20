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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertCircle, Armchair, Clock, Loader2, MapPin, MessageSquare, QrCode, Star, StarOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import type { Product } from '@/lib/types';
import type { User } from '@supabase/supabase-js';
import { cn } from '@/lib/utils';

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

type Filters = {
    floor: 'All' | Seat['floor'];
    section: 'All' | Seat['section'];
    seatType: 'All' | Seat['seatType'];
    sort: 'best' | 'closest' | 'favorites';
};

type ConfirmationState = {
    seatLabel: string;
    orderId: number;
    bookingSlot: string | null;
} | null;

const seatSections: Seat['section'][] = ['Quiet Zone', 'Window Wing', 'Group Pods'];
const seatTypes: Seat['seatType'][] = ['quiet', 'window', 'group'];
const floors: Seat['floor'][] = ['Ground Floor', 'First Floor', 'Second Floor'];

export default function LibraryDetailClient({ library, initialSeatProducts, initialOrders, currentUser }: LibraryDetailClientProps) {
    const { supabase } = useAuth();
    const router = useRouter();
    const { toast } = useToast();

    const [filters, setFilters] = useState<Filters>({ floor: 'All', section: 'All', seatType: 'All', sort: 'best' });
    const [seats, setSeats] = useState<Seat[]>([]);
    const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isBooking, setIsBooking] = useState(false);
    const [confirmation, setConfirmation] = useState<ConfirmationState>(null);
    const [currentOrders, setCurrentOrders] = useState(initialOrders);

    const previousStatusRef = useRef<Map<number, SeatStatus>>(new Map());

    const timeSlots = useMemo(() => {
        const slots = library.seller?.user_metadata?.opening_hours?.split('\n').filter((s: string) => s.trim() !== '') || [];
        return slots.length > 0 ? slots : ['08:00 - 10:00', '10:00 - 12:00', '12:00 - 14:00', '14:00 - 16:00'];
    }, [library.seller?.user_metadata?.opening_hours]);

    const selectedSeat = useMemo(() => seats.find(seat => seat.id === selectedSeatId) || null, [seats, selectedSeatId]);

    const generateSeatMetadata = useCallback((seatProducts: { id: number; name: string }[]) => {
        return seatProducts.map((product, index) => {
            const numericId = parseInt(product.name.replace(/[^0-9]/g, ''), 10) || index + 1;
            const floor = numericId <= 40 ? 'Ground Floor' : numericId <= 80 ? 'First Floor' : 'Second Floor';
            const section = seatSections[(numericId - 1) % seatSections.length];
            const seatType = seatTypes[(numericId - 1) % seatTypes.length];
            const row = Math.floor((numericId - 1) / 12) + 1;
            const column = ((numericId - 1) % 12) + 1;
            return {
                id: product.name.split(' ')[1] || product.id.toString(),
                productId: product.id,
                label: `Seat ${numericId}`,
                floor,
                section,
                seatType,
                row,
                column,
                status: 'available' as SeatStatus,
            } satisfies Seat;
        });
    }, []);

    const generateSeatStatus = useCallback((orders: any[], seatProducts: { id: number; name: string }[]) => {
        const baseSeats = generateSeatMetadata(seatProducts);
        const statusMap = new Map<number, Seat>();

        baseSeats.forEach(seat => statusMap.set(seat.productId, seat));

        const now = Date.now();

        orders.forEach(order => {
            const item = order.order_items?.[0];
            if (!item?.product_id) return;
            const seat = statusMap.get(item.product_id);
            if (!seat) return;

            const createdAt = order.created_at ? new Date(order.created_at).getTime() : null;
            const reservationWindow = createdAt ? createdAt + 2 * 60 * 1000 : null;

            if (order.status === 'pending_approval' && reservationWindow && reservationWindow <= now) {
                return;
            }

            statusMap.set(item.product_id, {
                ...seat,
                status: order.status === 'pending_approval' ? 'pending' : 'booked',
                bookingSlot: order.booking_slot ?? null,
                orderId: order.id,
                reservedUntil: order.status === 'pending_approval' && reservationWindow ? reservationWindow : undefined,
            });
        });

        return Array.from(statusMap.values()).sort((a, b) => Number(a.id) - Number(b.id));
    }, [generateSeatMetadata]);

    useEffect(() => {
        setSeats(generateSeatStatus(currentOrders, initialSeatProducts));
    }, [currentOrders, initialSeatProducts, generateSeatStatus]);

    useEffect(() => {
        const id = setInterval(() => {
            setSeats(seats => [...seats]);
        }, 1000);
        return () => clearInterval(id);
    }, []);

    useEffect(() => {
        const currentMap = new Map<number, SeatStatus>();
        seats.forEach(seat => currentMap.set(seat.productId, seat.status));
        const previousMap = previousStatusRef.current;

        seats.forEach(seat => {
            const previousStatus = previousMap.get(seat.productId);
            if (previousStatus && previousStatus !== seat.status) {
                const message = seat.status === 'available'
                    ? `${seat.label} is available again.`
                    : seat.status === 'booked'
                        ? `${seat.label} was just booked.`
                        : `${seat.label} is now reserved.`;
                toast({ description: message });
            }
        });

        previousStatusRef.current = currentMap;
    }, [seats, toast]);

    useEffect(() => {
        if (!supabase) return;
        const seatProductIds = initialSeatProducts.map(p => p.id);

        const fetchOrders = async () => {
            const { data } = seatProductIds.length > 0
                ? await supabase
                    .from('orders')
                    .select('id, status, created_at, booking_slot, order_items!inner(product_id)')
                    .eq('vendor_id', library.seller_id)
                    .in('order_items.product_id', seatProductIds)
                    .in('status', ['pending_approval', 'approved'])
                : { data: [] };
            if (data) setCurrentOrders(data);
        };

        fetchOrders();

        const channel = supabase
            .channel(`library_${library.id}_orders`)
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `vendor_id=eq.${library.seller_id}` }, fetchOrders)
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [supabase, library.id, library.seller_id, initialSeatProducts]);

    const handleChat = useCallback(async () => {
        if (!currentUser || !supabase) {
            toast({ variant: 'destructive', title: 'Login required', description: 'Log in to start a conversation.' });
            return;
        }
        if (currentUser.id === library.seller_id) {
            toast({ variant: 'destructive', title: 'Unavailable', description: 'You already manage this library.' });
            return;
        }
        const { error } = await supabase.rpc('create_private_chat', { p_user1_id: currentUser.id, p_user2_id: library.seller_id });
        if (error) {
            toast({ variant: 'destructive', title: 'Could not initiate chat', description: 'Please try again in a moment.' });
            return;
        }
        router.push('/chat');
    }, [currentUser, supabase, toast, router, library.seller_id]);

    const handleSelectSeat = (seat: Seat) => {
        if (seat.status !== 'available') {
            toast({ variant: 'destructive', description: `${seat.label} is currently ${seat.status}.` });
            return;
        }
        setSelectedSeatId(seat.id);
        setSelectedSlot(selectedSlot ?? timeSlots[0]);
    };

    const toggleFavorite = (seatId: string) => {
        setFavorites(prev => prev.includes(seatId) ? prev.filter(id => id !== seatId) : [...prev, seatId]);
    };

    const availableCount = useMemo(() => seats.filter(seat => seat.status === 'available').length, [seats]);

    const filteredSeats = useMemo(() => {
        let filtered = seats;
        if (filters.floor !== 'All') filtered = filtered.filter(seat => seat.floor === filters.floor);
        if (filters.section !== 'All') filtered = filtered.filter(seat => seat.section === filters.section);
        if (filters.seatType !== 'All') filtered = filtered.filter(seat => seat.seatType === filters.seatType);

        if (filters.sort === 'favorites') {
            filtered = [...filtered].sort((a, b) => {
                const aFav = favorites.includes(a.id) ? 0 : 1;
                const bFav = favorites.includes(b.id) ? 0 : 1;
                return aFav - bFav || Number(a.id) - Number(b.id);
            });
        } else if (filters.sort === 'closest') {
            filtered = [...filtered].sort((a, b) => a.row - b.row || a.column - b.column);
        } else {
            filtered = [...filtered].sort((a, b) => {
                const priority = (seat: Seat) => {
                    if (seat.status === 'available') return 0;
                    if (seat.status === 'pending') return 1;
                    return 2;
                };
                return priority(a) - priority(b) || Number(a.id) - Number(b.id);
            });
        }

        return filtered;
    }, [seats, filters, favorites]);

    const countdownForSeat = useCallback((seat: Seat) => {
        if (!seat.reservedUntil) return null;
        const remaining = Math.max(0, seat.reservedUntil - Date.now());
        if (remaining <= 0) return null;
        const minutes = Math.floor(remaining / 60000);
        const seconds = Math.floor((remaining % 60000) / 1000);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    const seatStatuses = useMemo(() => ({
        available: seats.filter(seat => seat.status === 'available').length,
        booked: seats.filter(seat => seat.status === 'booked').length,
        pending: seats.filter(seat => seat.status === 'pending').length,
    }), [seats]);

    const handleBooking = async () => {
        if (!selectedSeat || !selectedSlot || !currentUser || !supabase) {
            toast({ variant: 'destructive', description: 'Pick a seat and time slot before continuing.' });
            return;
        }
        setIsBooking(true);
        const { data: newOrder, error } = await supabase.from('orders').insert({
            buyer_id: currentUser.id,
            vendor_id: library.seller_id,
            total_amount: library.price,
            status: 'pending_approval',
            booking_slot: selectedSlot,
            booking_date: new Date().toISOString(),
        }).select('id').single();
        if (error || !newOrder) {
            toast({ variant: 'destructive', description: 'Booking could not be created. Try again.' });
            setIsBooking(false);
            return;
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
            toast({ variant: 'destructive', description: 'We could not lock the seat. Please retry.' });
            setIsBooking(false);
            return;
        }
        setConfirmation({ seatLabel: selectedSeat.label, orderId: newOrder.id, bookingSlot: selectedSlot });
        setSelectedSeatId(null);
        setIsBooking(false);
        toast({ description: `${selectedSeat.label} is now reserved for you. Complete payment to confirm.` });
    };

    const confirmationCopy = useMemo(() => {
        if (!confirmation) return null;
        return {
            heading: 'Seat reserved successfully',
            subheading: 'Show this QR at the entry desk to check in.',
            orderLine: `Reservation ID: #${confirmation.orderId}`,
            slotLine: confirmation.bookingSlot ? `Slot: ${confirmation.bookingSlot}` : null,
        };
    }, [confirmation]);

    const badgeTone = (status: SeatStatus) => {
        if (status === 'available') return 'bg-emerald-100 text-emerald-700';
        if (status === 'pending') return 'bg-amber-100 text-amber-700';
        return 'bg-rose-100 text-rose-700';
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
            <div className="grid gap-8 lg:grid-cols-[3fr,2fr]">
                <div className="space-y-6">
                    <Card className="overflow-hidden">
                        <div className="relative aspect-[5/3]">
                            <Image src={library.image_url || 'https://picsum.photos/seed/library-detail/960/640'} alt={library.name} fill className="object-cover" priority />
                        </div>
                    </Card>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <div className="flex flex-wrap items-center justify-between gap-3">
                                <h1 className="text-3xl lg:text-4xl font-bold">{library.name}</h1>
                                <Badge variant="secondary" className="text-base font-semibold">
                                    {`${availableCount} of ${seats.length} seats available`}
                                </Badge>
                            </div>
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <MapPin className="h-5 w-5" />
                                <span className="font-medium text-foreground">{library.location || 'Location coming soon'}</span>
                            </div>
                        </div>
                        <p className="text-muted-foreground leading-relaxed">{library.description}</p>
                        <div className="flex flex-col sm:flex-row gap-3">
                            <Button size="lg" variant="outline" className="flex-1" onClick={handleChat}>
                                <MessageSquare className="mr-2 h-5 w-5" />
                                Chat with manager
                            </Button>
                            <Link href={`/profile/${library.seller.handle}`} className="flex-1">
                                <Button size="lg" variant="ghost" className="w-full border">
                                    Meet the team
                                </Button>
                            </Link>
                        </div>
                    </div>
                    <Card>
                        <CardHeader className="space-y-2">
                            <CardTitle className="text-2xl">Seat map</CardTitle>
                            <CardDescription>Tap a seat to claim it instantly. Updates arrive in real time.</CardDescription>
                            <div className="flex flex-wrap items-center gap-3 pt-2 text-sm">
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">Available {seatStatuses.available}</span>
                                <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700">Reserved {seatStatuses.pending}</span>
                                <span className="px-3 py-1 rounded-full bg-rose-100 text-rose-700">Booked {seatStatuses.booked}</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-3 md:grid-cols-4 sm:grid-cols-2">
                                <Select value={filters.floor} onValueChange={value => setFilters(current => ({ ...current, floor: value as Filters['floor'] }))}>
                                    <SelectTrigger><SelectValue placeholder="Floor" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All floors</SelectItem>
                                        {floors.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.section} onValueChange={value => setFilters(current => ({ ...current, section: value as Filters['section'] }))}>
                                    <SelectTrigger><SelectValue placeholder="Section" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All sections</SelectItem>
                                        {seatSections.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.seatType} onValueChange={value => setFilters(current => ({ ...current, seatType: value as Filters['seatType'] }))}>
                                    <SelectTrigger><SelectValue placeholder="Seat type" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="All">All seat types</SelectItem>
                                        {seatTypes.map(option => (
                                            <SelectItem key={option} value={option}>
                                                {option === 'quiet' ? 'Quiet zone' : option === 'group' ? 'Group study' : 'Window seat'}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select value={filters.sort} onValueChange={value => setFilters(current => ({ ...current, sort: value as Filters['sort'] }))}>
                                    <SelectTrigger><SelectValue placeholder="Sort" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="best">Best availability</SelectItem>
                                        <SelectItem value="closest">Front rows first</SelectItem>
                                        <SelectItem value="favorites">My favourites</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <ScrollArea className="h-[420px] rounded-xl border bg-muted/30 p-4">
                                <div className="grid grid-cols-12 gap-2">
                                    <TooltipProvider>
                                        {filteredSeats.map(seat => {
                                            const countdown = countdownForSeat(seat);
                                            const isSelected = seat.id === selectedSeatId;
                                            const tone = seat.status === 'available'
                                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:border-emerald-400'
                                                : seat.status === 'pending'
                                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                                    : 'bg-rose-50 text-rose-700 border border-rose-200';
                                            return (
                                                <Tooltip key={seat.productId} delayDuration={150}>
                                                    <TooltipTrigger asChild>
                                                        <button
                                                            onClick={() => handleSelectSeat(seat)}
                                                            className={cn(
                                                                'relative flex h-14 items-center justify-center rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
                                                                tone,
                                                                isSelected && 'ring-2 ring-primary ring-offset-2 shadow-md',
                                                                favorites.includes(seat.id) && 'border-emerald-400'
                                                            )}
                                                            disabled={seat.status !== 'available'}
                                                        >
                                                            <Armchair className={cn('h-5 w-5', seat.status === 'booked' && 'text-rose-600', seat.status === 'pending' && 'text-amber-600', seat.status === 'available' && 'text-emerald-600')} />
                                                            <span className="absolute bottom-1 text-xs font-semibold">{seat.id}</span>
                                                            {countdown && (
                                                                <span className="absolute -top-1 right-1 flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                                                                    <Clock className="h-3 w-3" />
                                                                    {countdown}
                                                                </span>
                                                            )}
                                                            <button
                                                                type="button"
                                                                onClick={event => {
                                                                    event.stopPropagation();
                                                                    toggleFavorite(seat.id);
                                                                }}
                                                                className="absolute top-1 left-1 text-foreground/70 transition-colors hover:text-primary"
                                                            >
                                                                {favorites.includes(seat.id) ? <Star className="h-4 w-4 fill-current" /> : <StarOff className="h-4 w-4" />}
                                                            </button>
                                                        </button>
                                                    </TooltipTrigger>
                                                    <TooltipContent side="top" className="space-y-1 text-left">
                                                        <p className="font-semibold">{seat.label}</p>
                                                        <p className="text-sm text-muted-foreground">{seat.section} • {seat.floor}</p>
                                                        <p className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px]', badgeTone(seat.status))}>
                                                            {seat.status === 'available' ? 'Available now' : seat.status === 'pending' ? 'Reserved, awaiting payment' : 'Booked'}
                                                        </p>
                                                        {seat.bookingSlot ? <p className="text-xs text-muted-foreground">Slot: {seat.bookingSlot}</p> : null}
                                                    </TooltipContent>
                                                </Tooltip>
                                            );
                                        })}
                                    </TooltipProvider>
                                </div>
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="sticky top-24">
                        <CardHeader>
                            <CardTitle className="text-2xl">Booking summary</CardTitle>
                            <CardDescription>Review your seat, slot, and fee before confirming.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            <div className="grid gap-4">
                                <div className="rounded-xl border bg-muted/50 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-muted-foreground">Seat selected</p>
                                            <p className="text-xl font-semibold">{selectedSeat ? selectedSeat.label : 'Choose a seat'}</p>
                                        </div>
                                        <Badge variant="outline" className={cn('text-sm font-medium', selectedSeat ? badgeTone('available') : 'bg-slate-100 text-slate-600')}>
                                            {selectedSeat ? selectedSeat.section : 'Pending'}
                                        </Badge>
                                    </div>
                                </div>
                                <div className="grid gap-3">
                                    <span className="text-sm font-medium text-muted-foreground">Time slot</span>
                                    <div className="grid grid-cols-1 gap-2">
                                        {timeSlots.map(slot => (
                                            <button
                                                key={slot}
                                                onClick={() => setSelectedSlot(slot)}
                                                className={cn('rounded-xl border px-4 py-3 text-left transition hover:border-primary hover:bg-primary/5', selectedSlot === slot ? 'border-primary bg-primary/10 text-primary' : 'border-muted')}
                                            >
                                                <span className="text-sm font-semibold">{slot}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <Separator />
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Seat fee</span>
                                        <span>₹{library.price}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                        <span>Platform charge</span>
                                        <span>₹0</span>
                                    </div>
                                    <div className="flex items-center justify-between text-base font-semibold">
                                        <span>Total due today</span>
                                        <span>₹{library.price}</span>
                                    </div>
                                </div>
                                <Button size="lg" className="w-full" onClick={handleBooking} disabled={isBooking || !selectedSeat || !selectedSlot || !currentUser}>
                                    {isBooking && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Book now
                                </Button>
                                {!currentUser && (
                                    <div className="flex items-center gap-2 rounded-xl border border-dashed p-3 text-sm text-muted-foreground">
                                        <AlertCircle className="h-4 w-4 text-amber-500" />
                                        Log in to finish booking instantly.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center gap-3">
                            <Avatar className="h-12 w-12">
                                <AvatarImage src={library.seller.avatar_url || undefined} />
                                <AvatarFallback>{library.seller.full_name?.[0]}</AvatarFallback>
                            </Avatar>
                            <div>
                                <CardTitle className="text-lg">Managed by {library.seller.full_name}</CardTitle>
                                <CardDescription>{library.seller.handle ? `@${library.seller.handle}` : 'Campus concierge'}</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-3 text-sm text-muted-foreground">
                            <div className="flex justify-between"><span>Response time</span><span className="font-semibold text-foreground">&lt; 5 min</span></div>
                            <div className="flex justify-between"><span>Quiet zone seats</span><span className="font-semibold text-foreground">{seats.filter(seat => seat.seatType === 'quiet').length}</span></div>
                            <div className="flex justify-between"><span>Window seats</span><span className="font-semibold text-foreground">{seats.filter(seat => seat.seatType === 'window').length}</span></div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            <Dialog open={!!confirmation} onOpenChange={open => { if (!open) setConfirmation(null); }}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>{confirmationCopy?.heading}</DialogTitle>
                        <DialogDescription>{confirmationCopy?.subheading}</DialogDescription>
                    </DialogHeader>
                    {confirmation && (
                        <div className="space-y-6">
                            <div className="flex flex-col items-center gap-3 rounded-2xl border bg-muted/40 p-6">
                                <div className="flex h-32 w-32 items-center justify-center rounded-xl bg-white shadow">
                                    <QrCode className="h-20 w-20 text-primary" />
                                </div>
                                <p className="text-lg font-semibold">{confirmation.seatLabel}</p>
                                <p className="text-sm text-muted-foreground">{confirmationCopy?.orderLine}</p>
                                {confirmationCopy?.slotLine ? <p className="text-sm text-muted-foreground">{confirmationCopy.slotLine}</p> : null}
                            </div>
                            <Button variant="outline" className="w-full" onClick={() => setConfirmation(null)}>
                                Close
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
