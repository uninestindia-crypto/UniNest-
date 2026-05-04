import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, GraduationCap, Store, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Welcome to UniNest',
  description: 'Choose your journey on the modern campus platform.',
};

export default function WelcomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center px-6 py-12 lg:px-8 max-w-md mx-auto">
      <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="mb-10 text-center">
          <div className="mx-auto h-20 w-20 rounded-[2rem] bg-primary flex items-center justify-center shadow-xl shadow-primary/20 mb-6">
            <ShieldCheck className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-3">UniNest</h1>
          <p className="text-muted-foreground text-lg">One platform. Two journeys.</p>
        </div>

        <div className="space-y-4">
          <Link href="/student/dashboard" className="group block">
            <div className="relative overflow-hidden rounded-[2rem] bg-indigo-50 dark:bg-indigo-950/30 p-6 border border-indigo-100 dark:border-indigo-900/50 transition-all hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md">
                  <GraduationCap className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-indigo-950 dark:text-indigo-100">I&apos;m a Student</h2>
                  <p className="text-sm text-indigo-600/80 dark:text-indigo-400">Housing, jobs & campus life</p>
                </div>
                <ArrowRight className="h-5 w-5 text-indigo-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/vendor/dashboard" className="group block">
            <div className="relative overflow-hidden rounded-[2rem] bg-slate-950 p-6 border border-slate-800 transition-all hover:shadow-xl hover:shadow-slate-900/20 hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-800 text-white shadow-md">
                  <Store className="h-7 w-7" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-white">I&apos;m a Vendor</h2>
                  <p className="text-sm text-slate-400">Listings, leads & operations</p>
                </div>
                <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">Already have an account?</p>
          <Button variant="outline" className="rounded-full px-8" asChild>
            <Link href="/login">Log in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
