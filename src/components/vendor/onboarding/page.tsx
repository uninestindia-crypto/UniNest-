'use client';

import { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, FileText, ShieldCheck, UploadCloud, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const onboardingSteps = [
  {
    id: 'business-profile',
    title: 'Business Profile',
    subtitle: 'Introduce your brand to students searching on UniNest.',
    tasks: [
      {
        title: 'Business identity',
        description: 'Add your display name, tagline, and primary service categories.',
      },
      {
        title: 'Contact preferences',
        description: 'Set the point of contact and preferred communication channel.',
      },
      {
        title: 'Profile media',
        description: 'Upload logo, cover image, and a short welcome video.',
      },
    ],
  },
  {
    id: 'verification',
    title: 'Verification',
    subtitle: 'Secure trust with verified documents and compliance details.',
    tasks: [
      {
        title: 'Business documentation',
        description: 'Submit GST certificate or government registration files.',
      },
      {
        title: 'Owner verification',
        description: 'Provide ID proof and recent utility bill for address confirmation.',
      },
      {
        title: 'Safety standards',
        description: 'Confirm fire, hygiene, and security compliance checklists.',
      },
    ],
  },
  {
    id: 'catalog-setup',
    title: 'Catalog Setup',
    subtitle: 'Create listings tailored for students and parents.',
    tasks: [
      {
        title: 'Service templates',
        description: 'Start with pre-filled templates for rooms, meals, or services.',
      },
      {
        title: 'Pricing logic',
        description: 'Configure base price, deposits, and seasonal adjustments.',
      },
      {
        title: 'Media gallery',
        description: 'Upload room photos, menu snapshots, or facility walk-throughs.',
      },
    ],
  },
  {
    id: 'payouts',
    title: 'Payouts',
    subtitle: 'Connect bank accounts and review commission structures.',
    tasks: [
      {
        title: 'Settlement account',
        description: 'Add bank details and verify with micro-deposit in Razorpay.',
      },
      {
        title: 'Commission tiers',
        description: 'Review standard rates and unlock volume-based incentives.',
      },
      {
        title: 'Tax preferences',
        description: 'Download GST invoices and configure TDS certificate uploads.',
      },
    ],
  },
  {
    id: 'launch-checklist',
    title: 'Launch Checklist',
    subtitle: 'Preview your storefront and publish to the marketplace.',
    tasks: [
      {
        title: 'Profile preview',
        description: 'Review how your listing appears on desktop, tablet, and mobile.',
      },
      {
        title: 'Automation rules',
        description: 'Enable booking confirmations, reminders, and review nudges.',
      },
      {
        title: 'Go live',
        description: 'Schedule launch timing and invite team members to manage leads.',
      },
    ],
  },
] as const;

type OnboardingStep = (typeof onboardingSteps)[number];

const documentChecklist = [
  {
    title: 'Business registration',
    description: 'Upload valid GST certificate or MSME enrollment.',
    required: true,
  },
  {
    title: 'Identity proof',
    description: 'Provide Aadhaar or Passport for primary owner.',
    required: true,
  },
  {
    title: 'Address validation',
    description: 'Recent utility bill or property agreement.',
    required: false,
  },
  {
    title: 'Service licenses',
    description: 'Food safety, hostel NOC, or cyber café permit as applicable.',
    required: false,
  },
] as const;

const quickSupport = [
  {
    title: 'Chat with onboarding coach',
    description: 'Schedule a 15-minute call to review your setup.',
    action: 'Book a slot',
  },
  {
    title: 'Upload in WhatsApp',
    description: 'Share documents through our verified business channel.',
    action: 'Get WhatsApp link',
  },
  {
    title: 'Download vendor playbook',
    description: 'Best practices for boosting bookings and reviews.',
    action: 'Download PDF',
  },
] as const;

const resourceTabs = [
  {
    id: 'guides',
    title: 'Guides',
    description: 'Step-by-step checklists and walkthrough videos.',
  },
  {
    id: 'team',
    title: 'Team access',
    description: 'Invite teammates and assign permissions to modules.',
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Configure emails, reminders, and lead routing.',
  },
] as const;

export default function VendorOnboardingContent() {
  const [activeStep, setActiveStep] = useState<OnboardingStep['id']>(onboardingSteps[0].id);
  const activeIndex = useMemo(() => onboardingSteps.findIndex((step) => step.id === activeStep), [activeStep]);
  const progressValue = useMemo(() => ((activeIndex + 1) / onboardingSteps.length) * 100, [activeIndex]);

  const goToStep = (direction: 'next' | 'prev') => {
    if (direction === 'next' && activeIndex < onboardingSteps.length - 1) {
      setActiveStep(onboardingSteps[activeIndex + 1].id);
    }
    if (direction === 'prev' && activeIndex > 0) {
      setActiveStep(onboardingSteps[activeIndex - 1].id);
    }
  };

  return (
    <div className="space-y-8">
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="border-2 border-primary/10 shadow-sm">
          <CardHeader className="gap-2">
            <Badge variant="secondary" className="w-fit">Vendor onboarding</Badge>
            <CardTitle className="text-2xl md:text-3xl">Finish setup to start accepting bookings</CardTitle>
            <CardDescription>Complete each step to unlock marketplace visibility and payout access.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm font-medium">
                <span>Progress</span>
                <span>{Math.round(progressValue)}%</span>
              </div>
              <Progress value={progressValue} className="h-2" />
            </div>
            <Tabs value={activeStep} onValueChange={setActiveStep} className="space-y-4">
              <TabsList className="flex w-full justify-start overflow-x-auto rounded-lg bg-muted p-1 text-sm">
                {onboardingSteps.map((step) => (
                  <TabsTrigger
                    key={step.id}
                    value={step.id}
                    className="flex min-w-[160px] flex-col items-start gap-1 rounded-md px-4 py-3 data-[state=active]:bg-background data-[state=active]:shadow"
                  >
                    <span className="text-left text-sm font-semibold">{step.title}</span>
                    <span className="text-left text-xs text-muted-foreground">{step.tasks.length} tasks</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {onboardingSteps.map((step) => (
                <TabsContent key={step.id} value={step.id} className="space-y-4">
                  <Card className="border border-dashed">
                    <CardHeader>
                      <CardTitle className="text-xl">{step.title}</CardTitle>
                      <CardDescription>{step.subtitle}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-3">
                        {step.tasks.map((task) => (
                          <li key={task.title} className="flex items-start gap-3 rounded-lg border border-transparent bg-muted/50 p-3 transition hover:border-primary/30">
                            <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                            <div>
                              <p className="text-sm font-semibold">{task.title}</p>
                              <p className="text-sm text-muted-foreground">{task.description}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                    <CardFooter className="flex flex-col gap-3 border-t bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-muted-foreground">Need help? Tap support options on the right.</div>
                      <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
                        <Button variant="outline" onClick={() => goToStep('prev')} disabled={activeIndex === 0} className="w-full sm:w-auto">Previous</Button>
                        <Button onClick={() => goToStep('next')} disabled={activeIndex === onboardingSteps.length - 1} className="w-full sm:w-auto">
                          Continue
                          <ArrowRight className="ml-2 size-4" />
                        </Button>
                      </div>
                    </CardFooter>
                  </Card>
                  <div className="md:hidden">
                    <Accordion type="single" collapsible value={activeStep} onValueChange={(value) => value && setActiveStep(value as OnboardingStep['id'])}>
                      {onboardingSteps.map((mobileStep) => (
                        <AccordionItem key={mobileStep.id} value={mobileStep.id}>
                          <AccordionTrigger>{mobileStep.title}</AccordionTrigger>
                          <AccordionContent>
                            <ul className="space-y-3">
                              {mobileStep.tasks.map((task) => (
                                <li key={task.title} className="flex items-start gap-3 rounded-lg bg-muted/50 p-3">
                                  <CheckCircle2 className="mt-0.5 size-5 text-primary" />
                                  <div>
                                    <p className="text-sm font-semibold">{task.title}</p>
                                    <p className="text-sm text-muted-foreground">{task.description}</p>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
        <Card className="self-start border border-muted-foreground/20 shadow-sm">
          <CardHeader>
            <CardTitle>Need a fast lane?</CardTitle>
            <CardDescription>Pick the channel that suits your workflow.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quickSupport.map((item) => (
              <div key={item.title} className="rounded-lg border border-muted/40 p-4 transition hover:border-primary/50">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <Button variant="ghost" size="sm" className="shrink-0 text-primary">
                    {item.action}
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Document checklist</CardTitle>
              <CardDescription>Upload files to unlock verification in under 24 hours.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="mt-2 sm:mt-0">
              <UploadCloud className="mr-2 size-4" />
              Bulk upload
            </Button>
          </CardHeader>
          <CardContent className="grid gap-4 lg:grid-cols-2">
            {documentChecklist.map((item) => (
              <div key={item.title} className="flex flex-col gap-2 rounded-lg border border-muted/40 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <Badge variant={item.required ? 'default' : 'outline'}>{item.required ? 'Required' : 'Optional'}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{item.description}</p>
                <Button variant="outline" size="sm" className="w-full">
                  <FileText className="mr-2 size-4" />
                  Upload document
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card className="self-start shadow-sm">
          <CardHeader>
            <CardTitle>Invite your team</CardTitle>
            <CardDescription>Share access with managers, finance, or support agents.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="size-4 text-primary" />
                <p className="text-sm font-semibold">Send invitation</p>
              </div>
              <Input type="email" placeholder="team@yourbusiness.com" className="w-full" />
              <Button className="w-full">Invite teammate</Button>
              <p className="text-xs text-muted-foreground">We recommend inviting a finance owner for payout approvals.</p>
            </div>
            <Separator />
            <div className="rounded-lg bg-muted/60 p-4 text-sm text-muted-foreground">
              <div className="mb-2 flex items-center gap-2 text-primary">
                <ShieldCheck className="size-4" />
                <span className="font-semibold text-primary">Smart tips</span>
              </div>
              Share policy documents before launch and set response SLAs under 2 hours to earn the Verified badge.
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {resourceTabs.map((resource) => (
          <Card key={resource.id} className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">{resource.title}</CardTitle>
              <CardDescription>{resource.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {resource.id === 'guides' && (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>Watch a 5-minute video on perfect storefront setup.</li>
                  <li>Download the onboarding checklist in PDF.</li>
                  <li>Preview how listings adapt to mobile screens.</li>
                </ul>
              )}
              {resource.id === 'team' && (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>Assign catalog editors and payout reviewers.</li>
                  <li>Enable two-factor authentication for admins.</li>
                  <li>Download a CSV of invited teammates.</li>
                </ul>
              )}
              {resource.id === 'automation' && (
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>Turn on booking confirmations and payment reminders.</li>
                  <li>Trigger WhatsApp welcome flow after first booking.</li>
                  <li>Send review nudges 24 hours post-checkout.</li>
                </ul>
              )}
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Explore {resource.title.toLowerCase()}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </section>
    </div>
  );
}
