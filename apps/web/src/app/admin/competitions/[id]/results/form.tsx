
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trophy, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { declareWinner } from "./actions";

type Applicant = {
    id: string;
    name: string;
}

type ResultsFormProps = {
    competitionId: number;
    applicants: Applicant[];
    currentWinnerId: string | null | undefined;
    currentDescription: string | null | undefined;
}

export default function ResultsForm({ competitionId, applicants, currentWinnerId, currentDescription }: ResultsFormProps) {
    const { toast } = useToast();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedWinner, setSelectedWinner] = useState(currentWinnerId || '');
    const [description, setDescription] = useState(currentDescription || '');
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);

    const selectedApplicant = applicants.find(a => a.id === selectedWinner);
    const currentWinnerName = currentWinnerId
        ? applicants.find(a => a.id === currentWinnerId)?.name
        : null;

    const handleSubmitClick = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!selectedWinner) {
            toast({ variant: 'destructive', title: 'Error', description: 'Please select a winner first.' });
            return;
        }
        setShowConfirmDialog(true);
    };

    const handleConfirmWinner = async () => {
        setShowConfirmDialog(false);
        setIsLoading(true);

        const formData = new FormData();
        formData.append('competitionId', String(competitionId));
        formData.append('winnerId', selectedWinner);
        formData.append('resultDescription', description);

        const result = await declareWinner(formData);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({
                title: '🎉 Winner Declared!',
                description: `${selectedApplicant?.name} has been declared as the winner.`
            });
            router.refresh();
        }

        setIsLoading(false);
    };

    // Check if there are no applicants
    if (applicants.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Result Form</CardTitle>
                    <CardDescription>Select the winner of this competition.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        <Trophy className="mx-auto size-12 mb-4 opacity-50" />
                        <p>No applicants have entered this competition yet.</p>
                        <p className="text-sm">Winners can only be declared from the list of entrants.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2">
                                <Trophy className="size-5 text-amber-500" />
                                Result Form
                            </CardTitle>
                            <CardDescription>
                                {currentWinnerId
                                    ? "Update the winner or announcement details."
                                    : "Select and announce the competition winner."}
                            </CardDescription>
                        </div>
                        {currentWinnerName && (
                            <Badge className="bg-amber-500 hover:bg-amber-600">
                                <CheckCircle2 className="mr-1 size-3" />
                                Current: {currentWinnerName}
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmitClick} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="winner-select">Select Winner *</Label>
                            <Select onValueChange={setSelectedWinner} value={selectedWinner}>
                                <SelectTrigger id="winner-select" className="w-full">
                                    <SelectValue placeholder="Choose from applicants..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {applicants.map(applicant => (
                                        <SelectItem key={applicant.id} value={applicant.id}>
                                            <div className="flex items-center gap-2">
                                                {applicant.id === currentWinnerId && (
                                                    <Trophy className="size-3 text-amber-500" />
                                                )}
                                                {applicant.name}
                                                {applicant.id === currentWinnerId && (
                                                    <span className="text-xs text-muted-foreground">(Current Winner)</span>
                                                )}
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {applicants.length} eligible applicant{applicants.length !== 1 ? 's' : ''}
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="result-description">Result Announcement (Optional)</Label>
                            <Textarea
                                id="result-description"
                                placeholder="Write an announcement for the winner. This may be displayed publicly..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                            />
                        </div>

                        <div className="flex gap-3">
                            <Button
                                type="submit"
                                disabled={isLoading || !selectedWinner}
                                className="bg-amber-500 hover:bg-amber-600"
                            >
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                <Trophy className="mr-2 size-4" />
                                {currentWinnerId ? 'Update Winner' : 'Declare Winner'}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>

            {/* Confirmation Dialog */}
            <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                            <Trophy className="size-5 text-amber-500" />
                            Confirm Winner Declaration
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to declare <strong>{selectedApplicant?.name}</strong> as the winner
                            of this competition.
                            {currentWinnerId && currentWinnerId !== selectedWinner && (
                                <span className="block mt-2 text-amber-600">
                                    This will replace the current winner: <strong>{currentWinnerName}</strong>
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmWinner}
                            className="bg-amber-500 hover:bg-amber-600"
                        >
                            <Trophy className="mr-2 size-4" />
                            Confirm Winner
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}

