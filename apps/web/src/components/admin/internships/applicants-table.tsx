'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Trash2, Search, Eye, ExternalLink } from "lucide-react";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCoverLetter, setSelectedCoverLetter] = useState<{ name: string; content: string } | null>(null);
    const [selectedResume, setSelectedResume] = useState<string | null>(null);

    // Filter applications based on search query
    const filteredApplications = useMemo(() => {
        if (!searchQuery.trim()) return applications;
        const query = searchQuery.toLowerCase();
        return applications.filter(app =>
            app.name.toLowerCase().includes(query) ||
            app.email.toLowerCase().includes(query) ||
            app.cover_letter?.toLowerCase().includes(query)
        );
    }, [applications, searchQuery]);

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
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg">
                            Applications ({filteredApplications.length} of {applications.length})
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    </div>
                </CardHeader>
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
                            {filteredApplications.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        {applications.length === 0
                                            ? "No applications received yet."
                                            : "No applications match your search."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplications.map(app => (
                                    <TableRow key={app.id}>
                                        <TableCell className="font-medium">{app.name}</TableCell>
                                        <TableCell>
                                            <a
                                                href={`mailto:${app.email}`}
                                                className="text-primary hover:underline"
                                            >
                                                {app.email}
                                            </a>
                                        </TableCell>
                                        <TableCell>
                                            {app.cover_letter ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setSelectedCoverLetter({
                                                        name: app.name,
                                                        content: app.cover_letter!
                                                    })}
                                                    className="text-muted-foreground hover:text-foreground"
                                                >
                                                    <Eye className="mr-2 size-4" />
                                                    View
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedResume(app.resume_url)}
                                                >
                                                    <Eye className="mr-2 size-4" />
                                                    Preview
                                                </Button>
                                                <Button variant="outline" size="sm" asChild>
                                                    <Link href={app.resume_url} target="_blank">
                                                        <Download className="mr-2 size-4" />
                                                        Download
                                                    </Link>
                                                </Button>
                                            </div>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the application from <strong>{itemToDelete?.name}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Delete Application'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Cover Letter Viewer Dialog */}
            <Dialog open={!!selectedCoverLetter} onOpenChange={(open) => !open && setSelectedCoverLetter(null)}>
                <DialogContent className="max-w-2xl max-h-[80vh]">
                    <DialogHeader>
                        <DialogTitle>Cover Letter</DialogTitle>
                        <DialogDescription>
                            Submitted by {selectedCoverLetter?.name}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 max-h-[60vh] overflow-y-auto">
                        <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap bg-muted/50 p-4 rounded-lg">
                            {selectedCoverLetter?.content}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Resume Preview Dialog */}
            <Dialog open={!!selectedResume} onOpenChange={(open) => !open && setSelectedResume(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Resume Preview</DialogTitle>
                        <DialogDescription>
                            View or download the applicant's resume.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        {selectedResume && (
                            <>
                                <iframe
                                    src={selectedResume}
                                    className="w-full h-[60vh] rounded-lg border"
                                    title="Resume Viewer"
                                />
                                <Button variant="outline" asChild className="w-fit">
                                    <a href={selectedResume} target="_blank" rel="noopener noreferrer">
                                        <ExternalLink className="mr-2 size-4" />
                                        Open in New Tab
                                    </a>
                                </Button>
                            </>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}

