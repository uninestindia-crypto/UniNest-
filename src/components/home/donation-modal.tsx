

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useRazorpay } from '@/hooks/use-razorpay';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, Medal, Sparkles, Target, Trophy } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '../ui/input';
import { Badge } from '@/components/ui/badge';

type DonationModalProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

type TopDonor = {
  name: string;
  amount: number;
} | null;

const suggestedAmounts = [50, 100, 250];

export default function DonationModal({ isOpen, onOpenChange }: DonationModalProps) {
  const router = useRouter();
  const { openCheckout, isLoaded } = useRazorpay();
  const { toast } = useToast();
  const { user, supabase } = useAuth();
  const [isDonating, setIsDonating] = useState(false);
  const [donationAmount, setDonationAmount] = useState('100');
  const [topDonor, setTopDonor] = useState<TopDonor>(null);
  const [totalRaised, setTotalRaised] = useState(0);
  const [supporterCount, setSupporterCount] = useState(0);

  useEffect(() => {
    if (isOpen && supabase) {
        const fetchTopDonor = async () => {
             const { data: donations } = await supabase.from('donations').select('amount, profiles(full_name, email)');

            if (!donations || donations.length === 0) return;

            const aggregatedDonors = donations.reduce((acc: any[], current) => {
                if (!current.profiles) return acc;
                const existing = acc.find(d => d.email === current.profiles!.email);
                if (existing) {
                    existing.amount += current.amount;
                } else {
                    acc.push({
                        name: current.profiles.full_name,
                        email: current.profiles.email,
                        amount: current.amount
                    });
                }
                return acc;
            }, []).sort((a: any, b: any) => b.amount - a.amount);

            if (aggregatedDonors.length > 0) {
              setTopDonor(aggregatedDonors[0]);
            }
            const total = donations.reduce((sum: number, current: any) => sum + (current.amount || 0), 0);
            setTotalRaised(total);
            setSupporterCount(aggregatedDonors.length);
        };
        fetchTopDonor();
    }
  }, [isOpen, supabase]);

  const handlePaymentSuccess = async (paymentResponse: any, accessToken: string) => {
    const amount = parseInt(donationAmount, 10);
    const verificationResponse = await fetch('/api/verify-payment', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
            orderId: paymentResponse.razorpay_order_id,
            razorpay_payment_id: paymentResponse.razorpay_payment_id,
            razorpay_signature: paymentResponse.razorpay_signature,
            type: 'donation',
            amount: amount,
        })
    });

    const result = await verificationResponse.json();
    setIsDonating(false);

    if (!verificationResponse.ok) {
         toast({ variant: 'destructive', title: 'Donation record failed', description: result.error || 'Your payment was successful but we couldn\'t record it. Please contact support.' });
    } else {
        router.push(`/donate/thank-you?amount=${amount}`);
    }
    onOpenChange(false);
  }

  const handleDonate = async () => {
    const amount = parseInt(donationAmount, 10);
    if (isNaN(amount) || amount <= 0) {
        toast({ variant: 'destructive', title: 'Invalid Amount', description: 'Please enter a valid amount to donate.'});
        return;
    }
    
    if (!user) {
        onOpenChange(false);
        toast({ 
            title: 'Login to Donate', 
            description: 'Please log in to make a donation.',
            action: <Link href="/login"><Button>Login</Button></Link>
        });
        return;
    }

    setIsDonating(true);
    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amount * 100, currency: 'INR' }),
      });
      
      const order = await response.json();
      if (!response.ok) throw new Error(order.error || 'Failed to create payment order.');

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, 
        amount: order.amount,
        currency: order.currency,
        name: 'UniNest Donation',
        description: 'Support student innovation!',
        order_id: order.id,
        handler: handlePaymentSuccess,
        modal: { ondismiss: () => setIsDonating(false) },
        prefill: { name: user?.user_metadata?.full_name || '', email: user?.email || '' },
        notes: { type: 'donation', userId: user?.id },
        theme: { color: '#4A90E2' },
      };
      openCheckout(options);

    } catch (error) {
        console.error(error);
        toast({ variant: 'destructive', title: 'Donation Failed', description: error instanceof Error ? error.message : 'Could not connect to the payment gateway.'});
        setIsDonating(false);
    }
  };

  const amountValue = Number(donationAmount) || 0;
  const monthlyGoal = 10000;
  const goalProgress = monthlyGoal ? Math.min(100, Math.round((totalRaised / monthlyGoal) * 100)) : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl overflow-hidden border-none bg-transparent p-0 shadow-2xl">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="pointer-events-none absolute -top-24 right-0 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
          <div className="pointer-events-none absolute -left-16 top-10 h-40 w-40 rounded-full bg-amber-300/30 blur-3xl" />
          <div className="relative space-y-8 px-8 pb-10 pt-12 text-center">
            <DialogHeader className="space-y-4 text-center">
              <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/90 shadow-lg">
                <div className="relative h-20 w-14">
                  <div className="absolute inset-0">
                    <svg viewBox="0 0 100 120" className="h-full w-full text-muted-foreground">
                      <path d="M10 110 C 10 120, 90 120, 90 110 L 90 20 C 90 10, 70 0, 50 0 C 30 0, 10 10, 10 20 Z" fill="#F5F6FA" stroke="#2C3E50" strokeWidth="4" />
                      <path d="M8 20 L 92 20" stroke="#2C3E50" strokeWidth="4" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 px-1.5">
                    <div className="absolute inset-x-0 bottom-0 h-[85%] overflow-hidden rounded-b-[32px]">
                      <div className="absolute inset-x-0 bottom-0 h-full primary-gradient animate-fill-jar" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge className="flex items-center gap-1 bg-primary/90 text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                  Quick gift
                </Badge>
              </div>
              <DialogTitle className="text-3xl font-bold font-headline">Keep UniNest Alive</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                Chip in and help students run bold ideas with ease.
              </DialogDescription>
            </DialogHeader>

            {topDonor && (
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-medium text-amber-700 shadow-inner dark:bg-amber-500/20 dark:text-amber-100">
                <Trophy className="h-4 w-4" />
                Top donor: <span className="font-semibold">{topDonor.name}</span> at ₹{topDonor.amount.toLocaleString()}
              </div>
            )}

            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-3 text-left sm:grid-cols-4">
                <div className="rounded-2xl border border-primary/20 bg-white/60 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <Medal className="h-4 w-4" />
                    Supporters
                  </div>
                  <div className="mt-2 text-2xl font-bold">{supporterCount || '—'}</div>
                  <div className="text-xs text-muted-foreground">Friends already in</div>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-white/60 p-4 shadow-sm backdrop-blur">
                  <div className="flex items-center gap-2 text-xs font-medium text-primary">
                    <Target className="h-4 w-4" />
                    Raised this month
                  </div>
                  <div className="mt-2 text-2xl font-bold">₹{totalRaised.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">{goalProgress}% of ₹{monthlyGoal.toLocaleString()}</div>
                </div>
                <div className="rounded-2xl border border-primary/20 bg-white/60 p-4 shadow-sm backdrop-blur sm:col-span-2">
                  <div className="text-xs font-medium text-primary">Why it matters</div>
                  <div className="mt-2 text-lg font-semibold text-foreground">
                    Each donation keeps events open, kits stocked, and mentors on call.
                  </div>
                  <div className="text-xs text-muted-foreground">Share the buzz with a friend if you can.</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {suggestedAmounts.map((amount) => (
                    <Button
                      key={amount}
                      variant="outline"
                      className={cn(
                        'group relative overflow-hidden rounded-2xl border-2 py-6 text-lg font-bold transition-all',
                        donationAmount === amount.toString() && 'primary-gradient border-transparent text-primary-foreground shadow-lg shadow-primary/40'
                      )}
                      onClick={() => setDonationAmount(amount.toString())}
                    >
                      <span className="relative z-10">₹{amount}</span>
                    </Button>
                  ))}
                </div>
                <div className="rounded-2xl border border-primary/20 bg-white/70 p-4 text-left shadow-sm backdrop-blur">
                  <div className="flex items-center justify-between text-sm font-medium text-primary">
                    <span>Choose your amount</span>
                    <span>Minimum ₹10</span>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    <Input
                      type="number"
                      min="10"
                      step="10"
                      value={donationAmount}
                      onChange={(event) => setDonationAmount(event.target.value)}
                      className="h-12 rounded-xl border-primary/30 bg-white/90 text-lg"
                      placeholder="₹250"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button size="lg" className="w-full rounded-xl bg-primary text-lg font-semibold shadow-lg shadow-primary/30 transition hover:shadow-primary/50" onClick={handleDonate} disabled={isLoaded === false || isDonating}>
                {isDonating ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Sparkles className="mr-2 h-5 w-5" />}
                {isDonating ? 'Processing...' : `Donate ₹${amountValue || 0}`}
              </Button>
              <Button variant="ghost" className="text-muted-foreground" onClick={() => onOpenChange(false)}>
                Not now
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

