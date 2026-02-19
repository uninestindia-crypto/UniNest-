'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { UploadCloud, Mail, MessageSquare, MoreHorizontal, Loader2, Users, CheckCircle, Clock, Search, RefreshCw, Instagram } from 'lucide-react';
import * as XLSX from 'xlsx';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type LeadStatus = 'new' | 'contacted' | 'interested' | 'onboarded' | 'rejected';
type LeadSource = 'google_maps' | 'excel_upload' | 'instagram' | 'manual';

interface Lead {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    category: string | null;
    city: string | null;
    status: LeadStatus;
    source: LeadSource;
    created_at: string;
}

const STATUS_COLORS: Record<LeadStatus, string> = {
    new: 'bg-blue-500/15 text-blue-600 border-blue-200',
    contacted: 'bg-amber-500/15 text-amber-600 border-amber-200',
    interested: 'bg-purple-500/15 text-purple-600 border-purple-200',
    onboarded: 'bg-green-500/15 text-green-600 border-green-200',
    rejected: 'bg-red-500/15 text-red-600 border-red-200',
};

const SOURCE_LABELS: Record<LeadSource, string> = {
    google_maps: 'Google Maps',
    excel_upload: 'Excel Upload',
    instagram: 'Instagram',
    manual: 'Manual',
};

export default function LeadsPage() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(false);
    const [uploadLoading, setUploadLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const fetchLeads = useCallback(async () => {
        setLoading(true);
        let query = supabase.from('leads').select('*').order('created_at', { ascending: false });
        if (statusFilter !== 'all') query = query.eq('status', statusFilter);
        if (search) query = query.ilike('name', `%${search}%`);
        const { data, error } = await query.limit(200);
        if (error) { toast.error('Failed to fetch leads: ' + error.message); }
        else { setLeads(data || []); }
        setLoading(false);
    }, [search, statusFilter]);

    React.useEffect(() => { fetchLeads(); }, [fetchLeads]);

    const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadLoading(true);
        try {
            const buffer = await file.arrayBuffer();
            const workbook = XLSX.read(buffer);
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const rows: Record<string, string>[] = XLSX.utils.sheet_to_json(sheet);

            const leadsToInsert = rows.map(row => ({
                name: row['Name'] || row['name'] || 'Unknown',
                email: row['Email'] || row['email'] || null,
                phone: row['Phone'] || row['phone'] || row['Mobile'] || null,
                category: row['Category'] || row['category'] || null,
                city: row['City'] || row['city'] || null,
                source: 'excel_upload' as LeadSource,
            })).filter(l => l.name !== 'Unknown');

            const { error } = await supabase.from('leads').insert(leadsToInsert);
            if (error) throw error;
            toast.success(`✅ Uploaded ${leadsToInsert.length} leads successfully!`);
            fetchLeads();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : 'Upload failed';
            toast.error('Upload error: ' + msg);
        } finally {
            setUploadLoading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const updateLeadStatus = async (id: string, status: LeadStatus) => {
        const { error } = await supabase.from('leads').update({ status }).eq('id', id);
        if (error) { toast.error('Update failed'); return; }
        setLeads(prev => prev.map(l => l.id === id ? { ...l, status } : l));
        toast.success('Status updated');
    };

    const openWhatsApp = (phone: string, name: string) => {
        const msg = encodeURIComponent(
            `Hi ${name}! 👋 We're UniNest, a student housing platform. We'd love to help you get more bookings. Would you be interested in listing your property with us? Here's our platform: https://uninest.in`
        );
        window.open(`https://wa.me/${phone.replace(/\D/g, '')}?text=${msg}`, '_blank');
    };

    const openEmail = (email: string, name: string) => {
        const subject = encodeURIComponent('Partner with UniNest - Student Housing Platform');
        const body = encodeURIComponent(`Hi ${name},\n\nWe are UniNest, a growing student housing platform. We'd love to have you list your property with us and connect you with thousands of students.\n\nVisit us at https://uninest.in to learn more.\n\nBest regards,\nThe UniNest Team`);
        window.open(`mailto:${email}?subject=${subject}&body=${body}`, '_blank');
    };

    const stats = {
        total: leads.length,
        new: leads.filter(l => l.status === 'new').length,
        onboarded: leads.filter(l => l.status === 'onboarded').length,
        contacted: leads.filter(l => l.status === 'contacted').length,
    };

    return (
        <div className="flex flex-col gap-6 p-6">
            {/* Header */}
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Lead Management</h1>
                <p className="text-muted-foreground text-sm">Manage vendor and partner leads from all sources.</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total Leads', value: stats.total, icon: Users, color: 'text-blue-600' },
                    { label: 'New', value: stats.new, icon: Clock, color: 'text-amber-600' },
                    { label: 'Contacted', value: stats.contacted, icon: MessageSquare, color: 'text-purple-600' },
                    { label: 'Onboarded', value: stats.onboarded, icon: CheckCircle, color: 'text-green-600' },
                ].map(stat => (
                    <Card key={stat.label}>
                        <CardContent className="pt-4 pb-3 px-4 flex items-center gap-3">
                            <stat.icon className={`size-8 ${stat.color} shrink-0`} />
                            <div>
                                <p className="text-2xl font-bold">{stat.value}</p>
                                <p className="text-xs text-muted-foreground">{stat.label}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Actions Bar */}
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                        <div>
                            <CardTitle className="text-base">All Leads</CardTitle>
                            <CardDescription>Import from Excel or add manually. Click actions to contact.</CardDescription>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                            <input type="file" ref={fileInputRef} accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelUpload} />
                            <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploadLoading}>
                                {uploadLoading ? <Loader2 className="size-4 mr-2 animate-spin" /> : <UploadCloud className="size-4 mr-2" />}
                                Import Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={fetchLeads} disabled={loading}>
                                <RefreshCw className={`size-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                                Refresh
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Filters */}
                    <div className="flex gap-3 mb-4 flex-col sm:flex-row">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                            <Input placeholder="Search by name..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-40">
                                <SelectValue placeholder="Status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="new">New</SelectItem>
                                <SelectItem value="contacted">Contacted</SelectItem>
                                <SelectItem value="interested">Interested</SelectItem>
                                <SelectItem value="onboarded">Onboarded</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Table */}
                    <div className="rounded-md border overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead>Name</TableHead>
                                    <TableHead className="hidden md:table-cell">Contact</TableHead>
                                    <TableHead className="hidden lg:table-cell">Category</TableHead>
                                    <TableHead className="hidden lg:table-cell">Source</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                                            <Loader2 className="size-5 animate-spin mx-auto mb-2" />
                                            Loading leads...
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && leads.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="py-12 text-center">
                                            <UploadCloud className="size-10 mx-auto mb-3 text-muted-foreground/50" />
                                            <p className="text-muted-foreground font-medium">No leads yet</p>
                                            <p className="text-sm text-muted-foreground">Import an Excel file to get started.</p>
                                        </TableCell>
                                    </TableRow>
                                )}
                                {!loading && leads.map(lead => (
                                    <TableRow key={lead.id}>
                                        <TableCell className="font-medium">{lead.name}</TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <div className="flex flex-col gap-0.5">
                                                {lead.email && <span className="text-xs text-muted-foreground">{lead.email}</span>}
                                                {lead.phone && <span className="text-xs text-muted-foreground">{lead.phone}</span>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">{lead.category || '—'}</TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            <div className="flex items-center gap-1.5">
                                                {lead.source === 'instagram' && <Instagram className="size-3 text-pink-500" />}
                                                <span className="text-xs text-muted-foreground">{SOURCE_LABELS[lead.source]}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`text-xs font-medium border ${STATUS_COLORS[lead.status]}`}>
                                                {lead.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-1">
                                                {lead.phone && (
                                                    <Button variant="ghost" size="icon" className="size-8 text-green-600 hover:text-green-700 hover:bg-green-50" title="Send WhatsApp" onClick={() => openWhatsApp(lead.phone!, lead.name)}>
                                                        <MessageSquare className="size-4" />
                                                    </Button>
                                                )}
                                                {lead.email && (
                                                    <Button variant="ghost" size="icon" className="size-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50" title="Send Email" onClick={() => openEmail(lead.email!, lead.name)}>
                                                        <Mail className="size-4" />
                                                    </Button>
                                                )}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="size-8">
                                                            <MoreHorizontal className="size-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        {(['new', 'contacted', 'interested', 'onboarded', 'rejected'] as LeadStatus[]).map(s => (
                                                            <DropdownMenuItem key={s} onClick={() => updateLeadStatus(lead.id, s)} className="capitalize">
                                                                Mark as {s}
                                                            </DropdownMenuItem>
                                                        ))}
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">Showing {leads.length} lead{leads.length !== 1 ? 's' : ''}</p>
                </CardContent>
            </Card>

            {/* Excel Template Hint */}
            <Card className="border-dashed">
                <CardContent className="pt-4 pb-3 px-4">
                    <p className="text-sm font-medium mb-1">📄 Excel Template Columns</p>
                    <p className="text-xs text-muted-foreground">Your Excel file should have these columns (case-sensitive):</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {['Name', 'Email', 'Phone', 'Category', 'City'].map(col => (
                            <Badge key={col} variant="secondary" className="text-xs font-mono">{col}</Badge>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
