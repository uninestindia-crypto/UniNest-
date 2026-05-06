'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, Circle, User, Image as ImageIcon, Tag, Package, ShieldCheck, ChevronRight } from 'lucide-react';

type ChecklistStatus = {
  hasProfile: boolean;
  hasAvatar: boolean;
  hasCategories: boolean;
  hasListing: boolean;
  hasActiveSubscription: boolean;
};

type VendorOnboardingContentProps = {
  userName: string;
  checklistStatus: ChecklistStatus;
};

const steps = [
  {
    key: 'hasProfile' as const,
    icon: User,
    title: 'Complete your profile',
    description: 'Add your full name and contact number so students can reach you.',
    actionLabel: 'Update Profile',
    actionHref: '/vendor/settings',
  },
  {
    key: 'hasAvatar' as const,
    icon: ImageIcon,
    title: 'Upload a profile photo',
    description: 'Listings with a photo get 3× more inquiries. Upload your shop logo or photo.',
    actionLabel: 'Upload Photo',
    actionHref: '/vendor/settings',
  },
  {
    key: 'hasCategories' as const,
    icon: Tag,
    title: 'Select your services',
    description: 'Tell us if you run a hostel, food mess, library, or cybercafé.',
    actionLabel: 'Choose Services',
    actionHref: '/vendor/settings',
  },
  {
    key: 'hasListing' as const,
    icon: Package,
    title: 'Create your first listing',
    description: 'Add your room, meal plan, or product for students to discover.',
    actionLabel: 'Add Listing',
    actionHref: '/vendor/products/new',
  },
  {
    key: 'hasActiveSubscription' as const,
    icon: ShieldCheck,
    title: 'Activate your account',
    description: 'Start your free trial to go live and appear in student searches.',
    actionLabel: 'Activate Now',
    actionHref: '/vendor/subscription',
  },
];

export default function VendorOnboardingContent({
  userName,
  checklistStatus,
}: VendorOnboardingContentProps) {
  const completedCount = steps.filter((s) => checklistStatus[s.key]).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);
  const isComplete = completedCount === steps.length;

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-12 px-2 sm:px-4">
      {/* Header */}
      <div className="rounded-2xl bg-card border shadow-sm p-6">
        <h1 className="text-2xl font-bold">
          {isComplete ? `You're all set, ${userName}! 🎉` : `Get started, ${userName}`}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {isComplete
            ? 'Your vendor profile is complete. Students can now find and contact you.'
            : 'Complete these steps to start receiving enquiries from students.'}
        </p>

        {/* Progress bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>{completedCount} of {steps.length} steps done</span>
            <span className="font-semibold text-foreground">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Checklist */}
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <CardTitle className="text-base">Setup Checklist</CardTitle>
          <CardDescription>Complete each step to unlock full vendor access.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border">
            {steps.map((step, index) => {
              const isDone = checklistStatus[step.key];
              const Icon = step.icon;

              return (
                <li key={step.key} className={`flex items-center gap-4 px-6 py-5 ${isDone ? 'opacity-70' : ''}`}>
                  {/* Step number / check */}
                  <div className="shrink-0">
                    {isDone ? (
                      <CheckCircle2 className="size-6 text-green-500" />
                    ) : (
                      <div className="flex items-center justify-center size-6 rounded-full border-2 border-muted-foreground/30 text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`rounded-lg p-2 shrink-0 ${isDone ? 'bg-green-50' : 'bg-muted/60'}`}>
                    <Icon className={`size-4 ${isDone ? 'text-green-600' : 'text-muted-foreground'}`} />
                  </div>

                  {/* Text */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isDone ? 'line-through text-muted-foreground' : ''}`}>
                      {step.title}
                    </p>
                    {!isDone && (
                      <p className="text-xs text-muted-foreground mt-0.5">{step.description}</p>
                    )}
                  </div>

                  {/* Action */}
                  {!isDone && (
                    <Button variant="outline" size="sm" asChild className="shrink-0">
                      <Link href={step.actionHref}>
                        {step.actionLabel}
                        <ChevronRight className="ml-1 size-3" />
                      </Link>
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>

      {isComplete && (
        <Card className="rounded-2xl border-green-200 bg-green-50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <CheckCircle2 className="size-10 text-green-500" />
            <div>
              <p className="font-semibold text-green-900">Profile Complete!</p>
              <p className="text-sm text-green-700 mt-1">
                Your listings are live. Students searching on UniNest can now discover your business.
              </p>
            </div>
            <Button asChild variant="default">
              <Link href="/vendor/dashboard">Go to Dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Help */}
      <Card className="rounded-2xl border bg-muted/30">
        <CardContent className="p-5">
          <p className="text-sm font-semibold mb-1">Need help?</p>
          <p className="text-sm text-muted-foreground">
            WhatsApp us at{' '}
            <a
              href="https://wa.me/919999999999"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2"
            >
              +91 99999 99999
            </a>{' '}
            or email{' '}
            <a href="mailto:support@uninest.in" className="text-primary underline underline-offset-2">
              support@uninest.in
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
