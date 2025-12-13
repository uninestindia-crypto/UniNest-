
'use client';

import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { updateTicketStatus } from '@/app/admin/tickets/actions';
import { Loader2 } from 'lucide-react';

type TicketStatusChangerProps = {
    ticketId: number;
    currentStatus: string;
};

const statusColors: { [key: string]: string } = {
    'Open': 'bg-blue-500',
    'In Progress': 'bg-yellow-500',
    'Closed': 'bg-green-500',
    'Archived': 'bg-gray-500',
};

export default function TicketStatusChanger({ ticketId, currentStatus }: TicketStatusChangerProps) {
    const [status, setStatus] = useState(currentStatus);
    const [isUpdating, setIsUpdating] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleStatusChange = async (newStatus: string) => {
        setIsUpdating(true);
        setStatus(newStatus);
        
        const result = await updateTicketStatus(ticketId, newStatus);

        setIsUpdating(false);
        
        if (result.error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not update ticket status.' });
            setStatus(currentStatus); // Revert on error
        } else {
            toast({ title: 'Status Updated', description: `Ticket #${ticketId} is now "${newStatus}".` });
            router.refresh();
        }
    };

    return (
        <Select onValueChange={handleStatusChange} value={status} disabled={isUpdating}>
            <SelectTrigger className={cn(
                "w-36 text-white border-0",
                statusColors[status] || 'bg-gray-500'
            )}>
                 {isUpdating ? <Loader2 className="animate-spin mr-2" /> : <SelectValue placeholder="Set status" />}
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
                <SelectItem value="Archived">Archived</SelectItem>
            </SelectContent>
        </Select>
    );
}
