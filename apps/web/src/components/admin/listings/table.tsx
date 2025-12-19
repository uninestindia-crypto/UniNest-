
'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import type { Product, Profile } from "@/lib/types";
import Link from 'next/link';
import { MoreHorizontal, Trash2, Check, X, Loader2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { deleteProductByAdmin, approveProduct, rejectProduct } from '@/app/admin/listings/actions';

type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'handle'> | null;
};

type ListingsTableProps = {
    initialListings: ProductWithProfile[];
}

type StatusFilter = 'all' | 'pending' | 'active' | 'rejected';

const getStatusBadge = (status: string | null | undefined) => {
    switch (status) {
        case 'pending':
            return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Pending</Badge>;
        case 'active':
            return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Active</Badge>;
        case 'rejected':
            return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Rejected</Badge>;
        default:
            return <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">{status || 'Unknown'}</Badge>;
    }
};

export default function ListingsTable({ initialListings }: ListingsTableProps) {
    const { toast } = useToast();
    const [listings, setListings] = useState(initialListings);
    const [itemToDelete, setItemToDelete] = useState<ProductWithProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [processingId, setProcessingId] = useState<number | null>(null);
    const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

    // Filter listings based on selected status
    const filteredListings = useMemo(() => {
        if (statusFilter === 'all') return listings;
        return listings.filter(l => l.status === statusFilter);
    }, [listings, statusFilter]);

    // Count listings by status for tab badges
    const statusCounts = useMemo(() => ({
        all: listings.length,
        pending: listings.filter(l => l.status === 'pending').length,
        active: listings.filter(l => l.status === 'active').length,
        rejected: listings.filter(l => l.status === 'rejected').length,
    }), [listings]);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const result = await deleteProductByAdmin(itemToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Listing removed successfully.' });
            setListings(listings.filter(l => l.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    const handleApprove = async (listing: ProductWithProfile) => {
        setProcessingId(listing.id);
        const result = await approveProduct(listing.id);
        setProcessingId(null);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Approved', description: `"${listing.name}" is now live on the marketplace.` });
            setListings(listings.map(l => l.id === listing.id ? { ...l, status: 'active' } : l));
        }
    };

    const handleReject = async (listing: ProductWithProfile) => {
        setProcessingId(listing.id);
        const result = await rejectProduct(listing.id);
        setProcessingId(null);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Rejected', description: `"${listing.name}" has been rejected.` });
            setListings(listings.map(l => l.id === listing.id ? { ...l, status: 'rejected' } : l));
        }
    };

    const columns: ColumnDef<ProductWithProfile>[] = [
        {
            header: "Product",
            accessorKey: "name",
            sortable: true,
            cell: (listing) => (
                <Link href={`/marketplace/${listing.id}`} className="font-medium hover:underline text-foreground">
                    {listing.name}
                </Link>
            )
        },
        {
            header: "Seller",
            accessorKey: "profiles",
            cell: (listing) => (
                <Link href={`/profile/${listing.profiles?.handle}`} className="block hover:underline">
                    <div className="font-medium text-sm text-foreground">{listing.profiles?.full_name || 'N/A'}</div>
                    <div className="text-xs text-muted-foreground">@{listing.profiles?.handle || 'N/A'}</div>
                </Link>
            )
        },
        {
            header: "Category",
            accessorKey: "category",
            sortable: true,
            cell: (listing) => (
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{listing.category}</Badge>
            )
        },
        {
            header: "Status",
            accessorKey: "status",
            sortable: true,
            cell: (listing) => getStatusBadge(listing.status)
        },
        {
            header: "Price",
            accessorKey: "price",
            sortable: true,
            cell: (listing) => (
                <span className="font-medium">₹{listing.price.toLocaleString()}</span>
            )
        },
        {
            header: "Listed On",
            accessorKey: "created_at",
            sortable: true,
            cell: (listing) => (
                <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {format(new Date(listing.created_at), 'PPP')}
                </span>
            )
        },
        {
            header: "Actions",
            className: "text-right",
            cell: (listing) => {
                const isProcessing = processingId === listing.id;
                const isPending = listing.status === 'pending';
                const isRejected = listing.status === 'rejected';

                return (
                    <div className="flex justify-end items-center gap-2">
                        {/* Quick approve/reject for pending items */}
                        {isPending && (
                            <>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                    onClick={() => handleApprove(listing)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleReject(listing)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
                                </Button>
                            </>
                        )}
                        {/* Re-approve option for rejected items */}
                        {isRejected && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                                onClick={() => handleApprove(listing)}
                                disabled={isProcessing}
                            >
                                {isProcessing ? <Loader2 className="size-4 animate-spin" /> : <>Re-approve</>}
                            </Button>
                        )}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="size-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuItem asChild>
                                    <Link href={`/marketplace/${listing.id}`}>View Listing</Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(listing)}>
                                    <Trash2 className="mr-2 size-4" />Remove Listing
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                );
            }
        }
    ];

    return (
        <>
            {/* Status Filter Tabs */}
            <Tabs value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)} className="mb-4">
                <TabsList>
                    <TabsTrigger value="all">All ({statusCounts.all})</TabsTrigger>
                    <TabsTrigger value="pending" className="text-yellow-700">Pending ({statusCounts.pending})</TabsTrigger>
                    <TabsTrigger value="active" className="text-green-700">Active ({statusCounts.active})</TabsTrigger>
                    <TabsTrigger value="rejected" className="text-red-700">Rejected ({statusCounts.rejected})</TabsTrigger>
                </TabsList>
            </Tabs>

            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <DataTable
                        data={filteredListings}
                        columns={columns}
                        searchKey="name"
                        searchPlaceholder="Search listings..."
                    />
                </CardContent>
            </Card>
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will remove the listing from the marketplace. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Continue'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
