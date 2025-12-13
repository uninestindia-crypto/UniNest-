
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Pencil, Users } from "lucide-react";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
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
import { deleteInternship } from '@/app/admin/internships/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Internship = {
    id: number;
    role: string;
    company: string;
    stipend: number;
    location: string;
    deadline: string;
    internship_applications: { count: number }[];
};

type InternshipsTableProps = {
    internships: Internship[];
    error?: string;
}

export default function InternshipsTable({ internships: initialInternships, error }: InternshipsTableProps) {
    const { toast } = useToast();
    const [internships, setInternships] = useState(initialInternships);
    const [productToDelete, setProductToDelete] = useState<Internship | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        const result = await deleteInternship(productToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Internship deleted successfully.' });
            setInternships(internships.filter(c => c.id !== productToDelete.id));
            setProductToDelete(null);
        }
    };
    
    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error loading internships</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )
    }

    return (
        <>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Role</TableHead>
                                <TableHead>Company</TableHead>
                                <TableHead>Stipend</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Applicants</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {internships && internships.length > 0 ? (
                                internships.map(item => (
                                    <TableRow key={item.id}>
                                        <TableCell className="font-medium">{item.role}</TableCell>
                                        <TableCell>{item.company}</TableCell>
                                        <TableCell>
                                            {item.stipend > 0 ? `₹${item.stipend.toLocaleString()}` : <Badge variant="secondary">Unpaid</Badge>}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">{item.location}</Badge></TableCell>
                                        <TableCell>{format(new Date(item.deadline), 'PPP')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="size-4 text-muted-foreground" />
                                                {item.internship_applications[0]?.count || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                      <Link href={`/admin/internships/${item.id}/edit`}>
                                                        <Pencil className="mr-2 size-4" />Edit
                                                      </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/internships/${item.id}/applicants`}>
                                                            <Users className="mr-2 size-4" />View Applicants
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(item)}>
                                                        <Trash2 className="mr-2 size-4" />Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center h-24">No internships found.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone. This will permanently delete the internship listing.
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
