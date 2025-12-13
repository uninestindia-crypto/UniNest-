
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHeader from "@/components/admin/page-header";
import { Button } from "@/components/ui/button";
import { DataTable, ColumnDef } from "@/components/ui/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Pencil, PlusCircle, Trash2 } from "lucide-react";
import Link from 'next/link';
import { format } from "date-fns";
import type { Product } from '@/lib/types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { useAuth } from '@/hooks/use-auth';

type VendorProductsContentProps = {
  initialProducts: Product[];
};

export default function VendorProductsContent({ initialProducts }: VendorProductsContentProps) {
  const [products, setProducts] = useState(initialProducts);
  const [isDeleting, setIsDeleting] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const router = useRouter();
  const { supabase, vendorSubscriptionStatus } = useAuth();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!productToDelete || !supabase) return;
    setIsDeleting(true);

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productToDelete.id);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error deleting product',
        description: error.message,
      });
    } else {
      setProducts(products.filter(p => p.id !== productToDelete.id));
      toast({
        title: 'Product Deleted',
        description: `"${productToDelete.name}" has been removed from your listings.`,
      });
    }
    setIsDeleting(false);
    setProductToDelete(null);
  };

  const columns: ColumnDef<Product>[] = [
    {
      header: "Product",
      accessorKey: "name",
      sortable: true,
      cell: (product) => (
        <span className="font-medium text-foreground">{product.name}</span>
      )
    },
    {
      header: "Category",
      accessorKey: "category",
      sortable: true,
      cell: (product) => (
        <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{product.category}</Badge>
      )
    },
    {
      header: "Price",
      accessorKey: "price",
      sortable: true,
      cell: (product) => (
        <span className="font-medium">₹{product.price.toLocaleString()}</span>
      )
    },
    {
      header: "Listed On",
      accessorKey: "created_at",
      sortable: true,
      cell: (product) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(product.created_at), 'PPP')}
        </span>
      )
    },
    {
      header: "Actions",
      className: "text-right",
      cell: (product) => (
        <div className="flex justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/vendor/products/${product.id}/edit`}>
                  <Pencil className="mr-2 size-4" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onSelect={() => setProductToDelete(product)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <>
      <div className="space-y-8">
        <PageHeader title="My Products" description="Manage your marketplace listings.">
          <Button
            asChild
            disabled={!vendorSubscriptionStatus.isVendorActive}
            title={vendorSubscriptionStatus.isVendorActive ? undefined : 'Activate your subscription to add listings'}
          >
            <Link href="/marketplace/new">
              <PlusCircle className="mr-2" />
              Add New Product
            </Link>
          </Button>
        </PageHeader>
        <Card className="border-none shadow-none bg-transparent">
          <CardContent className="p-0">
            <DataTable
              data={products}
              columns={columns}
              searchKey="name"
              searchPlaceholder="Search products..."
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              "{productToDelete?.name}" from your listings.
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
  );
}
