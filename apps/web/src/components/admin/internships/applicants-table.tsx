'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2 } from "lucide-react";
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
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
import { deleteInternshipApplication } from '@/app/admin/internships/[id]/applicants/actions';

type Application = {
    id: number;
    name: string;
    email: string;
    cover_letter: string | null;
    resume_url: string;
};

type InternshipApplicantsTableProps = {
    initialApplications: Application[];
    internshipId: string;
}

export default function InternshipApplicantsTable({ initialApplications, internshipId }: InternshipApplicantsTableProps) {
    const { toast } = useToast();
    const [applications, setApplications] = useState(initialApplications);
    const [itemToDelete, setItemToDelete] = useState<Application | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        if (!itemToDelete) return;
        setIsDeleting(true);
        const result = await deleteInternshipApplication(itemToDelete.id, internshipId);
        setIsDeleting(false);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success', description: 'Application deleted successfully.' });
            setApplications(applications.filter(l => l.id !== itemToDelete.id));
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
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Cover Letter</TableHead>
                                <TableHead>Resume</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {applications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        No applications received yet.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                applications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.name}</TableCell>
                                        <TableCell>{app.email}</TableCell>
                                        <TableCell className="max-w-sm truncate text-muted-foreground">{app.cover_letter || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Button variant="outline" size="sm" asChild>
                                                <Link href={app.resume_url} target="_blank">
                                                    <Download className="mr-2 size-4" />
                                                    Download
                                                </Link>
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="destructive" size="icon" onClick={() => setItemToDelete(app)}>
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
                            This will permanently delete this internship application. This action cannot be undone.
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
