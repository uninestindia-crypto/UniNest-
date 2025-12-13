'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2 } from 'lucide-react';
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
import { deleteCompetitionEntry } from '@/app/admin/competitions/[id]/applicants/actions';

type Applicant = {
    id: number;
    created_at: string;
    razorpay_payment_id: string | null;
    user_id: string;
    profiles: {
        full_name: string;
        avatar_url: string | null;
    } | null;
}

type ApplicantsTableProps = {
    initialApplicants: Applicant[];
    competitionId: string;
}

export default function ApplicantsTable({ initialApplicants, competitionId }: ApplicantsTableProps) {
    const { toast } = useToast();
    const [applicants, setApplicants] = useState(initialApplicants);
    const [itemToDelete, setItemToDelete] = useState<Applicant | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const result = await deleteCompetitionEntry(itemToDelete.id, competitionId);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Entry deleted successfully.' });
            setApplicants(applicants.filter(l => l.id !== itemToDelete.id));
            setItemToDelete(null);
        }
    };

    return (
        <>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Entered On</TableHead>
                                <TableHead>Payment ID</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applicants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center h-24">
                                        No one has entered this competition yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applicants.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={entry.profiles?.avatar_url || ''} />
                                                    <AvatarFallback>{entry.profiles?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{entry.profiles?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">User ID: {entry.user_id}</p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(entry.created_at), 'PPP')}</TableCell>
                                        <TableCell className="font-mono text-xs">{entry.razorpay_payment_id || 'N/A (Free Entry)'}</TableCell>
                                        <TableCell className="text-right">
                                             <Button variant="destructive" size="icon" onClick={() => setItemToDelete(entry)}>
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this competition entry. This action cannot be undone.
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
