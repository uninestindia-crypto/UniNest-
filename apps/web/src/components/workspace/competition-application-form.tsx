'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Trophy, ArrowRight, CheckCircle2, IndianRupee, PhoneCall, Phone, Mail, UploadCloud, User } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { saveCompetitionEntry, verifyPayment } from '@/app/workspace/competitions/[id]/apply/actions';
import Script from 'next/script';

const formSchema = z.object({
  name: z.string().min(2, 'Name is required.'),
  email: z.string().email('Invalid email address.'),
  phone_number: z.string().min(10, 'Please enter a valid phone number.'),
  whatsapp_number: z.string().min(10, 'Please enter a valid WhatsApp number.'),
  pitch: z.any().refine((file) => file instanceof File, 'Pitch deck upload is required.'),
});

type CompetitionApplicationFormProps = {
  competition: {
    id: number | string;
    title: string;
    entry_fee: number;
  };
};

export default function CompetitionApplicationForm({ competition }: CompetitionApplicationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, loading } = useAuth();
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
        pitch: undefined,
      });
    }
  }, [user, form]);

  useEffect(() => {
    if (!loading && !user) {
      router.replace(loginRedirectPath);
    }
  }, [loading, user, router, loginRedirectPath]);

  const handlePaymentSuccess = async (paymentResponse: any, invoiceId: string) => {
    setIsProcessingPayment(true);
    try {
      const result = await verifyPayment(
        paymentResponse.razorpay_order_id,
        paymentResponse.razorpay_payment_id,
        paymentResponse.razorpay_signature,
        invoiceId
      );

      if (result.error) throw new Error(result.error);

      toast({ title: 'Success!', description: 'Your entry has been confirmed.' });
      router.push(`/workspace/competitions/${competition.id}`);
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error Verifying Entry', description: e.message || 'Payment verification failed.' });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) {
      toast({ variant: 'destructive', title: 'Authentication Required', description: 'Please log in to enter.' });
      router.replace(loginRedirectPath);
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('competitionId', String(competition.id));
      formData.append('name', values.name);
      formData.append('email', values.email);
      formData.append('phone_number', values.phone_number);
      formData.append('whatsapp_number', values.whatsapp_number);
      if (values.pitch) formData.append('pitch', values.pitch);

      const saveResult = await saveCompetitionEntry(formData);

      if (saveResult.error) throw new Error(saveResult.error);
      if (!saveResult.orderId) throw new Error('Failed to initialize payment gateway.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: competition.entry_fee * 100,
        currency: 'INR',
        name: 'UniNest',
        description: `Entry fee for ${competition.title}`,
        order_id: saveResult.orderId,
        handler: (response: any) => handlePaymentSuccess(response, saveResult.invoiceId!),
        prefill: {
          name: values.name,
          email: values.email,
          contact: values.phone_number,
        },
        theme: { color: '#4f46e5' },
        modal: { ondismiss: () => setIsLoading(false) }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        setIsLoading(false);
        toast({ variant: 'destructive', title: 'Payment Failed', description: response.error.description });
      });
      rzp.open();
    } catch (e: any) {
      setIsLoading(false);
      toast({ variant: 'destructive', title: 'Error', description: e.message || 'Something went wrong.' });
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin mb-4 text-emerald-500" />
        <p className="animate-pulse">Loading challenge arena...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 relative items-start">

        {/* Left Column: Challenge Overview */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8">
          <div className="inline-flex items-center rounded-full border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-900/30 px-3 py-1 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
            <Trophy className="mr-2 h-4 w-4" />
            Competition Entry
          </div>
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
              {competition.title}
            </h1>

            <div className="flex items-center gap-4 p-5 rounded-2xl border bg-slate-50 dark:bg-slate-900/50">
              <div className="bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 p-3 rounded-xl shrink-0">
                <IndianRupee className="size-6" />
              </div>
              <div>
                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Entry Fee</p>
                <p className="text-3xl font-black tracking-tight">₹{competition.entry_fee}</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/40 dark:to-emerald-900/40 border p-8 space-y-5 shadow-sm relative overflow-hidden mt-6">
            <div className="absolute -top-4 -right-4 p-4 opacity-5 pointer-events-none">
              <Trophy className="size-48" />
            </div>
            <h3 className="font-bold text-xl flex items-center">
              <CheckCircle2 className="mr-2 h-6 w-6 text-emerald-500" />
              Entry Requirements
            </h3>
            <ul className="space-y-4 text-sm text-foreground/80 relative z-10">
              <li className="flex items-start gap-4">
                <div className="bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-full size-7 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700 font-bold">1</div>
                <div className="pt-1">Upload your pitch deck as a PDF file (max 10MB). Ensure the content directly addresses the problem statement.</div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-full size-7 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700 font-bold">2</div>
                <div className="pt-1">Fill out accurate contact details. If you win, this is how the organizers will reach you for the prize distribution.</div>
              </li>
              <li className="flex items-start gap-4">
                <div className="bg-emerald-200/50 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300 rounded-full size-7 flex items-center justify-center shrink-0 border border-emerald-300 dark:border-emerald-700 font-bold">3</div>
                <div className="pt-1">Complete the payment of ₹{competition.entry_fee} through our secure gateway.</div>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Glassmorphic Entry Form */}
        <div className="lg:col-span-7 relative group">

          {/* Decorative background glows */}
          <div className="absolute -inset-1 blur-3xl opacity-30 bg-gradient-to-tr from-emerald-400 via-teal-500 to-cyan-500 rounded-3xl -z-10 transition-opacity duration-500 group-hover:opacity-50" />

          <Card className="border shadow-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl supports-[backdrop-filter]:bg-white/50 overflow-hidden relative">
            <div className="h-2 w-full bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 absolute top-0 left-0" />

            <CardContent className="p-8 sm:p-10 space-y-8 mt-2">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Participant Details</h3>
                    <div className="grid sm:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1.5"><User className="size-3.5" /> Full Name</FormLabel><FormControl>
                          <Input className="bg-white/50 dark:bg-black/20 focus-visible:ring-emerald-500" placeholder="Jane Doe" {...field} />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1.5"><Mail className="size-3.5" /> Email</FormLabel><FormControl>
                          <Input type="email" className="bg-white/50 dark:bg-black/20 focus-visible:ring-emerald-500 opacity-70" {...field} disabled />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="phone_number" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1.5"><Phone className="size-3.5" /> Mobile Number</FormLabel><FormControl>
                          <Input type="tel" className="bg-white/50 dark:bg-black/20 focus-visible:ring-emerald-500" placeholder="+91..." {...field} />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                      <FormField control={form.control} name="whatsapp_number" render={({ field }) => (
                        <FormItem><FormLabel className="flex items-center gap-1.5"><PhoneCall className="size-3.5" /> WhatsApp</FormLabel><FormControl>
                          <Input type="tel" className="bg-white/50 dark:bg-black/20 focus-visible:ring-emerald-500" placeholder="+91..." {...field} />
                        </FormControl><FormMessage /></FormItem>
                      )} />
                    </div>
                  </div>

                  <div className="space-y-5">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground border-b pb-2">Submission Document</h3>
                    <FormField control={form.control} name="pitch" render={({ field: { onChange, value, ...rest } }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-1.5">Pitch Deck / Solution (PDF)</FormLabel>
                        <FormControl>
                          <div className="relative group/upload cursor-pointer">
                            <Input type="file" accept=".pdf" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" onChange={(e) => { const file = e.target.files?.[0]; if (file) onChange(file); }} {...rest} />
                            <div className={`p-8 border-2 border-dashed rounded-2xl transition-all duration-200 flex flex-col items-center justify-center gap-3 text-center ${value ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-500/10' : 'border-muted-foreground/25 hover:border-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-900/50'}`}>
                              <div className={`p-4 rounded-full ${value ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                <UploadCloud className="h-8 w-8" />
                              </div>
                              <div>
                                {value ? (
                                  <p className="font-semibold text-emerald-600 dark:text-emerald-400 truncate max-w-[250px] text-lg">{(value as File).name}</p>
                                ) : (
                                  <><p className="font-bold text-foreground text-base">Click to upload pitch deck</p><p className="text-sm text-muted-foreground mt-1">PDF file under 10MB</p></>
                                )}
                              </div>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>

                  <div className="pt-6 border-t">
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full text-lg font-bold h-16 shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/40 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition-all duration-300 rounded-xl"
                      disabled={isLoading || isProcessingPayment}
                    >
                      {isLoading || isProcessingPayment ? (
                        <><Loader2 className="mr-3 h-6 w-6 animate-spin" /> {isProcessingPayment ? 'Verifying Payment...' : 'Connecting to Gateway...'}</>
                      ) : (
                        <>Proceed to Pay ₹{competition.entry_fee} <ArrowRight className="ml-3 h-6 w-6" /></>
                      )}
                    </Button>
                    <p className="text-center text-xs font-medium text-muted-foreground mt-4 flex items-center justify-center gap-1.5">
                      Payments are securely processed via Razorpay <CheckCircle2 className="size-3.5 text-emerald-500" />
                    </p>
                  </div>

                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
