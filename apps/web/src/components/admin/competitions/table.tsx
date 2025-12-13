
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Trash2, Pencil, Users, Trophy } from "lucide-react";
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
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
import { deleteCompetition } from '@/app/admin/competitions/actions';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

type Competition = {
    id: number;
    title: string;
    prize: number;
    entry_fee: number;
    deadline: string;
    competition_entries: { count: number }[];
};

type CompetitionsTableProps = {
    competitions: Competition[];
    error?: string;
}

export default function CompetitionsTable({ competitions: initialCompetitions, error }: CompetitionsTableProps) {
    const { toast } = useToast();
    const [competitions, setCompetitions] = useState(initialCompetitions);
    const [productToDelete, setProductToDelete] = useState<Competition | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!productToDelete) return;
        setIsDeleting(true);
        const result = await deleteCompetition(productToDelete.id);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Competition deleted successfully.' });
            setCompetitions(competitions.filter(c => c.id !== productToDelete.id));
            setProductToDelete(null);
        }
    };

    if (error) {
        return (
             <Alert variant="destructive">
                <AlertTitle>Error loading competitions</AlertTitle>
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
                                <TableHead>Title</TableHead>
                                <TableHead>Prize</TableHead>
                                <TableHead>Entry Fee</TableHead>
                                <TableHead>Deadline</TableHead>
                                <TableHead>Entries</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {competitions && competitions.length > 0 ? (
                                competitions.map(comp => (
                                    <TableRow key={comp.id}>
                                        <TableCell className="font-medium">{comp.title}</TableCell>
                                        <TableCell>₹{comp.prize.toLocaleString()}</TableCell>
                                        <TableCell>₹{comp.entry_fee.toLocaleString()}</TableCell>
                                        <TableCell>{format(new Date(comp.deadline), 'PPP')}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="size-4 text-muted-foreground" />
                                                {comp.competition_entries[0]?.count || 0}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                           <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon"><MoreHorizontal /></Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/competitions/${comp.id}/edit`}>
                                                            <Pencil className="mr-2 size-4" />Edit
                                                        </Link>
                                                    </DropdownMenuItem>
                                                     <DropdownMenuItem asChild>
                                                        <Link href={`/admin/competitions/${comp.id}/results`}>
                                                            <Trophy className="mr-2 size-4" />Declare Winner
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem asChild>
                                                        <Link href={`/admin/competitions/${comp.id}/applicants`}>
                                                            <Users className="mr-2 size-4" />View Entrants
                                                        </Link>
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive" onClick={() => setProductToDelete(comp)}>
                                                        <Trash2 className="mr-2 size-4" />Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">No competitions found.</TableCell>
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
                        This action cannot be undone. This will permanently delete the competition and all associated entry data.
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
