
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import type { User } from '@supabase/supabase-js';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  bookingSlot: z.string({ required_error: 'Please select a time slot.' }),
});

type ReservationFormProps = {
  seatId: string;
  price: number;
  user: User;
  onSubmit: (bookingSlot: string) => Promise<boolean>;
  isLoading: boolean;
  timeSlots: string[];
};

export default function ReservationForm({ seatId, price, user, onSubmit, isLoading, timeSlots }: ReservationFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.user_metadata?.full_name || '',
      email: user.email || '',
      bookingSlot: '',
    },
  });

  async function handleFormSubmit(values: z.infer<typeof formSchema>) {
    await onSubmit(values.bookingSlot);
  }

  return (
    <div className="space-y-6">
        <div className="flex justify-between items-center bg-muted p-3 rounded-lg">
            <span className="font-semibold">Seat Number: {seatId}</span>
            <span className="font-bold text-primary">₹{price}/month</span>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} disabled /></FormControl><FormMessage /></FormItem>
            )} />
             <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
            )} />
            <FormField
              control={form.control}
              name="bookingSlot"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time Slot / Shift</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Select a shift" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {timeSlots.length > 0 ? (
                          timeSlots.map(slot => (
                            <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                          ))
                      ) : (
                          <SelectItem value="default" disabled>No shifts configured by vendor</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading || timeSlots.length === 0}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Reservation
            </Button>
          </form>
        </Form>
    </div>
  );
}
