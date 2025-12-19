'use client';

import { useState, useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Trash2, Search, FileText, ExternalLink } from 'lucide-react';
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
import { useToast } from '@/hooks/use-toast';
import { deleteCompetitionEntry } from '@/app/admin/competitions/[id]/applicants/actions';
import { Badge } from "@/components/ui/badge";

type Applicant = {
    id: number;
    created_at: string;
    razorpay_payment_id: string | null;
    user_id: string;
    pitch_deck_url?: string | null;
    profiles: {
        full_name: string;
        avatar_url: string | null;
        email?: string | null;
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
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedPitchDeck, setSelectedPitchDeck] = useState<string | null>(null);

    // Filter applicants based on search query
    const filteredApplicants = useMemo(() => {
        if (!searchQuery.trim()) return applicants;
        const query = searchQuery.toLowerCase();
        return applicants.filter(applicant =>
            applicant.profiles?.full_name?.toLowerCase().includes(query) ||
            applicant.profiles?.email?.toLowerCase().includes(query) ||
            applicant.user_id.toLowerCase().includes(query) ||
            applicant.razorpay_payment_id?.toLowerCase().includes(query)
        );
    }, [applicants, searchQuery]);

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
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <CardTitle className="text-lg">
                            Applicants ({filteredApplicants.length} of {applicants.length})
                        </CardTitle>
                        <div className="relative w-full sm:w-72">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input
                                placeholder="Search by name, email, or ID..."
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
                                <TableHead>User</TableHead>
                                <TableHead>Entered On</TableHead>
                                <TableHead>Payment ID</TableHead>
                                <TableHead>Pitch Deck</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredApplicants.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center h-24">
                                        {applicants.length === 0
                                            ? "No one has entered this competition yet."
                                            : "No applicants match your search."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredApplicants.map(entry => (
                                    <TableRow key={entry.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="size-9">
                                                    <AvatarImage src={entry.profiles?.avatar_url || ''} />
                                                    <AvatarFallback>{entry.profiles?.full_name?.[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <p className="font-medium">{entry.profiles?.full_name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {entry.profiles?.email || `ID: ${entry.user_id.slice(0, 8)}...`}
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>{format(new Date(entry.created_at), 'PPP')}</TableCell>
                                        <TableCell>
                                            {entry.razorpay_payment_id ? (
                                                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                    {entry.razorpay_payment_id}
                                                </code>
                                            ) : (
                                                <Badge variant="secondary">Free Entry</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {entry.pitch_deck_url ? (
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setSelectedPitchDeck(entry.pitch_deck_url!)}
                                                >
                                                    <FileText className="mr-2 size-4" />
                                                    View
                                                </Button>
                                            ) : (
                                                <span className="text-muted-foreground text-sm">N/A</span>
                                            )}
                                        </TableCell>
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

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete this competition entry for{' '}
                            <strong>{itemToDelete?.profiles?.full_name}</strong>. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                            {isDeleting ? 'Deleting...' : 'Delete Entry'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Pitch Deck Viewer Dialog */}
            <Dialog open={!!selectedPitchDeck} onOpenChange={(open) => !open && setSelectedPitchDeck(null)}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Pitch Deck</DialogTitle>
                        <DialogDescription>
                            Review the submitted pitch deck below.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        {selectedPitchDeck && (
                            <>
                                <iframe
                                    src={selectedPitchDeck}
                                    className="w-full h-[60vh] rounded-lg border"
                                    title="Pitch Deck Viewer"
                                />
                                <Button variant="outline" asChild className="w-fit">
                                    <a href={selectedPitchDeck} target="_blank" rel="noopener noreferrer">
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

