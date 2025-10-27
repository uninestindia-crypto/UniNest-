

'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useAuth } from '@/hooks/use-auth';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone_number: z.string().min(10, 'Please enter a valid phone number.'),
  whatsapp_number: z.string().min(10, 'Please enter a valid WhatsApp number.'),
});

type CompetitionApplicationFormProps = {
    competition: {
        id: number;
        title: string;
        entry_fee: number;
    };
};

export default function CompetitionApplicationForm({ competition }: CompetitionApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { supabase, user, loading } = useAuth();
  const { openCheckout, isLoaded } = useRazorpay();
  const loginRedirectPath = `/login?redirect=/workspace/competitions/${competition.id}/apply`;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      phone_number: '',
      whatsapp_number: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        phone_number: user.user_metadata?.phone_number || '',
        whatsapp_number: user.user_metadata?.whatsapp_number || '',
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginRedirectPath);
    }
  }, [loading, user, router, loginRedirectPath]);

  const handlePaymentSuccess = async (paymentResponse: any, accessToken: string) => {
    const values = form.getValues();
    const verificationBody = {
        orderId: paymentResponse.razorpay_order_id,
        razorpay_payment_id: paymentResponse.razorpay_payment_id,
        razorpay_signature: paymentResponse.razorpay_signature,
        type: 'competition_entry',
        competitionId: competition.id,
        phone_number: values.phone_number,
        whatsapp_number: values.whatsapp_number,
    };
    const headers: HeadersInit = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}`};

    const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(verificationBody)
    });

    const result = await verificationResponse.json();
    setIsLoading(false);

     if (!verificationResponse.ok) {
        toast({ variant: 'destructive', title: 'Error Saving Entry', description: result.error || 'Your payment was processed, but we failed to save your entry. Please contact support@uninest.co.in.' });
    } else {
        toast({ title: 'Entry Successful!', description: `You have successfully entered ${competition.title}.` });
        router.push(`/workspace/competitions/${competition.id}`);
    }
  }


  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to continue with your entry.' });
      router.replace(loginRedirectPath);
      return;
    }

    setIsLoading(true);

    if (competition.entry_fee <= 0) {
        const { data: { session } } = await supabase!.auth.getSession();
        // This is a free entry, so we don't have a razorpay payment response, but we still need the token.
        await handlePaymentSuccess({}, session!.access_token);
        return;
    }

    try {
        const response = await fetch('/api/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount: competition.entry_fee * 100, currency: 'INR' }),
        });

        if (!response.ok) {
            const orderError = await response.json();
            throw new Error(orderError.error || 'Failed to create order');
        }
        
        const order = await response.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: order.amount,
          currency: order.currency,
          name: `Entry Fee: ${competition.title}`,
          order_id: order.id,
          handler: handlePaymentSuccess,
          modal: { ondismiss: () => setIsLoading(false) },
          prefill: { name: values.name, email: values.email, contact: values.phone_number },
          notes: { type: 'competition_entry', competitionId: competition.id, userId: user.id },
          theme: { color: '#1B365D' },
        };
        openCheckout(options);
    } catch (error) {
        toast({ variant: 'destructive', title: 'Payment Error', description: error instanceof Error ? error.message : 'Could not connect to payment gateway.'});
        setIsLoading(false);
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          <span>Loading entry form...</span>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          Redirecting to login...
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirm Your Entry</CardTitle>
        <CardDescription>Your details will be shared with the competition organizer.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
                 <FormField control={form.control} name="name" render={({ field }) => (
                    <FormItem><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem><FormLabel>Email</FormLabel><FormControl><Input type="email" {...field} disabled /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="phone_number" render={({ field }) => (
                    <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                    <FormItem><FormLabel>WhatsApp Number</FormLabel><FormControl><Input type="tel" {...field} /></FormControl><FormMessage /></FormItem>
                )} />
            </div>
            
            <Button type="submit" disabled={isLoading || !isLoaded} className="w-full">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {competition.entry_fee > 0 ? `Pay ₹${competition.entry_fee} and Enter` : 'Enter for Free'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

