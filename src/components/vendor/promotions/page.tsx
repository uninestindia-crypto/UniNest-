'use client';

import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CalendarRange, Info, Megaphone, Percent, Sparkles, Timer, Users, Wand2 } from 'lucide-react';

const promotionStatuses = [
  { id: 'active', title: 'Active', description: 'Campaigns running right now' },
  { id: 'scheduled', title: 'Scheduled', description: 'Upcoming promotions ready to launch' },
  { id: 'completed', title: 'Completed', description: 'Past performance to review' },
] as const;

const samplePromotions = {
  active: [
    { id: 'PR-2310', name: 'Festive stay offer', audience: 'Hostel leads · City-wide', uplift: '+28% bookings', dates: '10–24 Oct', budget: '₹5,000' },
    { id: 'PR-2308', name: 'Meal plan happy hours', audience: 'Food mess subscribers', uplift: '+18% renewals', dates: 'Daily 5–8pm', budget: '₹1,800' },
  ],
  scheduled: [
    { id: 'PR-2312', name: 'Exam focus bundle', audience: 'Library waitlist', uplift: 'Projected +22%', dates: '1–15 Nov', budget: '₹3,200' },
  ],
  completed: [
    { id: 'PR-2289', name: 'Welcome week flash sale', audience: 'New campus entrants', uplift: '+32% ARR', dates: '01–07 Aug', budget: '₹4,500' },
  ],
} as const;

const creationSteps = [
  { id: 'audience', title: 'Audience & goal', description: 'Choose who sees the campaign and define success.' },
  { id: 'offer', title: 'Offer details', description: 'Set incentive, price rules, and messaging.' },
  { id: 'schedule', title: 'Schedule & budget', description: 'Pick launch window, frequency, and spend caps.' },
  { id: 'review', title: 'Review & publish', description: 'Double-check summary before activating.' },
] as const;

const discountMarks = [5, 10, 15, 20, 25, 30];

type StepId = (typeof creationSteps)[number]['id'];

type PromotionTab = (typeof promotionStatuses)[number]['id'];

export default function VendorPromotionsContent() {
  const [activeTab, setActiveTab] = useState<PromotionTab>('active');
  const [step, setStep] = useState<StepId>('audience');
  const [discount, setDiscount] = useState<number[]>([15]);
  const [budget, setBudget] = useState('5000');
  const [useCountdown, setUseCountdown] = useState(true);
  const [showQuickStart, setShowQuickStart] = useState(true);

  const stepIndex = useMemo(() => creationSteps.findIndex((item) => item.id === step), [step]);
  const progress = useMemo(() => ((stepIndex + 1) / creationSteps.length) * 100, [stepIndex]);

  const goStep = (direction: 'next' | 'prev') => {
    if (direction === 'next' && stepIndex < creationSteps.length - 1) {
      setStep(creationSteps[stepIndex + 1].id);
    }
    if (direction === 'prev' && stepIndex > 0) {
      setStep(creationSteps[stepIndex - 1].id);
    }
  };

  return (
    <div className="space-y-8">
      {showQuickStart && (
        <Alert className="flex flex-col gap-2 border-primary/40 bg-primary/5 text-foreground md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <Info className="size-5 text-primary" />
            <div>
              <AlertTitle>Quick start tip</AlertTitle>
              <AlertDescription>
                Review existing campaigns before launching new ones so budgets and audiences dont overlap.
              </AlertDescription>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setShowQuickStart(false)} className="self-end md:self-center">
            Got it
          </Button>
        </Alert>
      )}
      <section className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold md:text-3xl">Promotions hub</h1>
          <p className="mt-1 text-sm text-muted-foreground">Plan, launch, and measure campaigns that drive qualified bookings.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button variant="outline" className="w-full sm:w-auto">Use blueprint</Button>
          <Button className="w-full sm:w-auto">Create promotion</Button>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Campaign overview</CardTitle>
                <CardDescription>Switch tabs to review active, scheduled, or completed campaigns.</CardDescription>
              </div>
              <Badge variant="secondary">Smart recommendations on</Badge>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as PromotionTab)}>
              <TabsList className="grid w-full grid-cols-3">
                {promotionStatuses.map((status) => (
                  <TabsTrigger key={status.id} value={status.id} className="flex flex-col gap-1 py-3 text-xs">
                    <span className="text-sm font-semibold">{status.title}</span>
                    <span className="text-muted-foreground">{status.description}</span>
                  </TabsTrigger>
                ))}
              </TabsList>
              {promotionStatuses.map((status) => (
                <TabsContent key={status.id} value={status.id}>
                  <div className="grid gap-4 md:grid-cols-2">
                    {samplePromotions[status.id as keyof typeof samplePromotions].map((promo) => (
                      <Card key={promo.id} className="border border-muted/40">
                        <CardHeader className="space-y-1">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{promo.name}</CardTitle>
                            <Badge variant="outline">{promo.id}</Badge>
                          </div>
                          <CardDescription>{promo.audience}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-2 text-sm">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Performance</span>
                            <span className="font-medium text-foreground">{promo.uplift}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Run window</span>
                            <span className="font-medium text-foreground">{promo.dates}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Budget</span>
                            <span className="font-medium text-foreground">{promo.budget}</span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 border-t bg-muted/40 p-4 sm:flex-row sm:justify-between">
                          <Button variant="outline" size="sm" className="w-full sm:w-auto">View insights</Button>
                          <Button size="sm" className="w-full sm:w-auto">Boost</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardHeader>
        </Card>
        <Card className="self-start border border-muted-foreground/20 shadow-sm">
          <CardHeader>
            <CardTitle>Playbook ideas</CardTitle>
            <CardDescription>Use proven templates to launch faster.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <PlaybookCard icon={Megaphone} title="Launch flash sale" description="Drive urgency with limited slots and countdown timers for hostels." />
            <PlaybookCard icon={Sparkles} title="Promote add-ons" description="Bundle meal plans with laundry to grow average order value." />
            <PlaybookCard icon={Timer} title="Re-engage leads" description="Send timed WhatsApp nudges to students who saved your listing." />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-2">
            <div>
              <CardTitle>Build a promotion</CardTitle>
              <CardDescription>Complete the guided wizard to launch confidently.</CardDescription>
            </div>
            <Progress value={progress} className="h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={step} onValueChange={(value) => setStep(value as StepId)} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-4">
                {creationSteps.map((item, index) => (
                  <Button
                    key={item.id}
                    variant={step === item.id ? 'default' : 'outline'}
                    className="flex flex-col items-start gap-1 py-3 text-left"
                    onClick={() => setStep(item.id)}
                  >
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Step {index + 1}</span>
                    <span className="text-sm font-semibold">{item.title}</span>
                    <span className="text-xs text-muted-foreground">{item.description}</span>
                  </Button>
                ))}
              </div>
