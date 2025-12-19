'use client';

import { useState, useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Search, ArrowUpDown, Download, Heart, Trophy } from "lucide-react";

type Payment = {
    id: string;
    amount: number;
    currency: string;
    type: 'Donation' | 'Competition Entry';
    created_at: string;
    status: 'success' | 'pending' | 'failed';
    user: {
        full_name: string | null;
        email: string | null;
    } | null;
}

type PaymentsTableProps = {
    initialPayments: Payment[];
}

type SortField = 'date' | 'amount' | 'name';
type SortOrder = 'asc' | 'desc';

export default function PaymentsTable({ initialPayments }: PaymentsTableProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState<'all' | 'Donation' | 'Competition Entry'>('all');
    const [sortField, setSortField] = useState<SortField>('date');
    const [sortOrder, setSortOrder] = useState<SortOrder>('desc');

    // Calculate stats
    const stats = useMemo(() => {
        const donations = initialPayments.filter(p => p.type === 'Donation');
        const competitions = initialPayments.filter(p => p.type === 'Competition Entry');
        return {
            totalDonations: donations.reduce((sum, p) => sum + p.amount, 0),
            donationCount: donations.length,
            totalCompetitions: competitions.reduce((sum, p) => sum + p.amount, 0),
            competitionCount: competitions.length,
        };
    }, [initialPayments]);

    // Filter and sort payments
    const filteredPayments = useMemo(() => {
        let result = initialPayments;

        // Apply type filter
        if (typeFilter !== 'all') {
            result = result.filter(p => p.type === typeFilter);
        }

        // Apply search filter
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            result = result.filter(p =>
                p.id.toLowerCase().includes(query) ||
                p.user?.full_name?.toLowerCase().includes(query) ||
                p.user?.email?.toLowerCase().includes(query)
            );
        }

        // Apply sorting
        result = [...result].sort((a, b) => {
            let comparison = 0;
            switch (sortField) {
                case 'date':
                    comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                    break;
                case 'amount':
                    comparison = a.amount - b.amount;
                    break;
                case 'name':
                    comparison = (a.user?.full_name || '').localeCompare(b.user?.full_name || '');
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

        return result;
    }, [initialPayments, searchQuery, typeFilter, sortField, sortOrder]);

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const getStatusBadge = (status: Payment['status']) => {
        switch (status) {
            case 'success':
                return <Badge className="bg-green-600 hover:bg-green-700">Success</Badge>;
            case 'pending':
                return <Badge variant="outline" className="text-amber-600 border-amber-600">Pending</Badge>;
            case 'failed':
                return <Badge variant="destructive">Failed</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
                        <Heart className="size-4 text-pink-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalDonations.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{stats.donationCount} transactions</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Competition Fees</CardTitle>
                        <Trophy className="size-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">₹{stats.totalCompetitions.toLocaleString()}</div>
                        <p className="text-xs text-muted-foreground">{stats.competitionCount} entries</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader className="pb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <CardTitle className="text-lg">
                            Transactions ({filteredPayments.length} of {initialPayments.length})
                        </CardTitle>
                        <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:ml-auto">
                            <div className="relative flex-1 sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search by name, email, or ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9"
                                />
                            </div>
                            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as any)}>
                                <SelectTrigger className="w-full sm:w-44">
                                    <SelectValue placeholder="Filter by type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    <SelectItem value="Donation">Donations Only</SelectItem>
                                    <SelectItem value="Competition Entry">Competitions Only</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Transaction ID</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('name')}
                                        className="-ml-4"
                                    >
                                        User
                                        <ArrowUpDown className="ml-2 size-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('amount')}
                                        className="-ml-4"
                                    >
                                        Amount
                                        <ArrowUpDown className="ml-2 size-3" />
                                    </Button>
                                </TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSort('date')}
                                        className="-ml-4"
                                    >
                                        Date
                                        <ArrowUpDown className="ml-2 size-3" />
                                    </Button>
                                </TableHead>
                                <TableHead className="text-right">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredPayments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center h-24">
                                        {initialPayments.length === 0
                                            ? "No payments found."
                                            : "No payments match your filters."}
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredPayments.map(payment => (
                                    <TableRow key={payment.id}>
                                        <TableCell>
                                            <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                                {payment.id.length > 20 ? `${payment.id.slice(0, 20)}...` : payment.id}
                                            </code>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{payment.user?.full_name || 'Anonymous'}</div>
                                            {payment.user?.email && (
                                                <a
                                                    href={`mailto:${payment.user.email}`}
                                                    className="text-sm text-muted-foreground hover:text-primary hover:underline"
                                                >
                                                    {payment.user.email}
                                                </a>
                                            )}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            ₹{payment.amount.toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={payment.type === 'Donation' ? 'default' : 'secondary'}
                                                className={payment.type === 'Donation' ? 'bg-pink-600 hover:bg-pink-700' : ''}
                                            >
                                                {payment.type === 'Donation' && <Heart className="mr-1 size-3" />}
                                                {payment.type === 'Competition Entry' && <Trophy className="mr-1 size-3" />}
                                                {payment.type}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{format(new Date(payment.created_at), 'PPp')}</TableCell>
                                        <TableCell className="text-right">
                                            {getStatusBadge(payment.status)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
