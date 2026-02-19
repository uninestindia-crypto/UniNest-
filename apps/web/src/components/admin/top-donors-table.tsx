
'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

type AggregatedDonor = {
  name: string;
  userId: string;
  avatar: string | null;
  total: number;
};

type TopDonorsTableProps = {
  donors: AggregatedDonor[];
};

export default function TopDonorsTable({ donors }: TopDonorsTableProps) {
  return (
    <Card className="border-border/50 shadow-sm transition-all hover:shadow-md h-full">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">Top Donors</CardTitle>
        <CardDescription className="text-muted-foreground">Highest contributors this month.</CardDescription>
      </CardHeader>
      <CardContent className="p-0 sm:p-6 min-w-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-4 sm:pl-0">User</TableHead>
              <TableHead className="text-right pr-4 sm:pr-0">Total Donated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {donors && donors.length > 0 ? (
              donors.map((donor) => (
                <TableRow key={donor.userId}>
                  <TableCell className="pl-4 sm:pl-0">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                        <AvatarImage src={donor.avatar || ''} alt="Avatar" data-ai-hint="person face" />
                        <AvatarFallback>{donor.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="grid gap-0.5 min-w-0">
                        <p className="font-medium leading-none truncate text-sm sm:text-base">{donor.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium pr-4 sm:pr-0 text-sm sm:text-base">₹{donor.total.toLocaleString()}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  No donor data available.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
