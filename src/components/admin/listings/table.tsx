
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import type { Product, Profile } from "@/lib/types";
import Link from 'next/link';
import { MoreHorizontal, Trash2 } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { deleteProductByAdmin } from '@/app/admin/listings/actions';

type ProductWithProfile = Product & {
    profiles: Pick<Profile, 'full_name' | 'handle'> | null;
};

type ListingsTableProps = {
    initialListings: ProductWithProfile[];
}

export default function ListingsTable({ initialListings }: ListingsTableProps) {
    const { toast } = useToast();
    const [listings, setListings] = useState(initialListings);
    const [itemToDelete, setItemToDelete] = useState<ProductWithProfile | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

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
            accessorKey: "profiles", // Accessor for sorting might need refinement or custom sort logic, but 'profiles' is the object
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
            cell: (listing) => (
                <div className="flex justify-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="size-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-destructive" onClick={() => setItemToDelete(listing)}>
                                <Trash2 className="mr-2 size-4" />Delete Listing
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )
        }
    ];

    return (
        <>
            <Card className="border-none shadow-none bg-transparent">
                <CardContent className="p-0">
                    <DataTable
                        data={listings}
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
