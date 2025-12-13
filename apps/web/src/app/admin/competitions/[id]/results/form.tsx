
'use client';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);

        const formData = new FormData();
        formData.append('competitionId', String(competitionId));
        formData.append('winnerId', selectedWinner);
        formData.append('resultDescription', description);

        const result = await declareWinner(formData);

        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: result.error });
        } else {
            toast({ title: 'Success!', description: result.message });
            router.refresh(); // Refreshes the page to show updated state
        }
        
        setIsLoading(false);
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Result Form</CardTitle>
                <CardDescription>If a winner is already selected, you can update it here.</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="winner-select">Select Winner</Label>
                        <Select onValueChange={setSelectedWinner} value={selectedWinner}>
                            <SelectTrigger id="winner-select">
                                <SelectValue placeholder="Choose from applicants..." />
                            </SelectTrigger>
                            <SelectContent>
                                {applicants.map(applicant => (
                                    <SelectItem key={applicant.id} value={applicant.id}>
                                        {applicant.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="result-description">Result Announcement (Optional)</Label>
                        <Textarea 
                            id="result-description"
                            placeholder="Announce the winner and provide any extra details..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <Button type="submit" disabled={isLoading || !selectedWinner}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Declare Winner
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
