'use client';

import { useState, useMemo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { updateDonationSettings } from '@/app/admin/marketing/actions';
import { cn } from '@/lib/utils';
import { Plus, Trash2, Loader2 } from 'lucide-react';

const MAX_MILESTONES = 12;

export type DonationSettingsFormProps = {
  initialGoal: number;
  initialImpact: {
    studentsHelped: number;
    notesShared: number;
    librariesDigitized: number;
  };
  initialMilestones: {
    goal: number;
    title: string;
    description?: string | null;
  }[];
};

type MilestoneState = {
  id: string;
  goal: string;
  title: string;
  description: string;
};

type FormState = {
  donationGoal: string;
  impactStudentsHelped: string;
  impactNotesShared: string;
  impactLibrariesDigitized: string;
  milestones: MilestoneState[];
};

const normalizeMilestones = (milestones: DonationSettingsFormProps['initialMilestones']): MilestoneState[] =>
  milestones.map((milestone, index) => ({
    id: `milestone-${index}-${milestone.goal}`,
    goal: String(milestone.goal ?? ''),
    title: milestone.title ?? '',
    description: milestone.description ?? '',
  }));

const createEmptyMilestone = (count: number): MilestoneState => ({
  id: `milestone-new-${Date.now()}-${count}`,
  goal: '',
  title: '',
  description: '',
});

export default function DonationSettingsForm({ initialGoal, initialImpact, initialMilestones }: DonationSettingsFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [formState, setFormState] = useState<FormState>(() => ({
    donationGoal: String(initialGoal ?? ''),
    impactStudentsHelped: String(initialImpact.studentsHelped ?? ''),
    impactNotesShared: String(initialImpact.notesShared ?? ''),
    impactLibrariesDigitized: String(initialImpact.librariesDigitized ?? ''),
    milestones: normalizeMilestones(initialMilestones),
  }));

  const milestoneIssues = useMemo(() => {
    return formState.milestones.map((milestone) => {
      const issues: string[] = [];
      if (!milestone.goal || Number.isNaN(Number(milestone.goal))) {
        issues.push('Goal missing');
      }
      if (!milestone.title.trim()) {
        issues.push('Title missing');
      }
      return issues;
    });
  }, [formState.milestones]);

  const handleFieldChange = (key: keyof FormState, value: string) => {
    setFormState((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleMilestoneChange = (index: number, patch: Partial<MilestoneState>) => {
    setFormState((prev) => ({
      ...prev,
      milestones: prev.milestones.map((milestone, idx) =>
        idx === index
          ? {
              ...milestone,
              ...patch,
            }
          : milestone,
      ),
    }));
  };

  const handleAddMilestone = () => {
    setFormState((prev) => {
      if (prev.milestones.length >= MAX_MILESTONES) {
        toast({
          variant: 'destructive',
          title: 'Milestone limit reached',
          description: `Only ${MAX_MILESTONES} milestones are allowed.`,
        });
        return prev;
      }
      return {
        ...prev,
        milestones: [...prev.milestones, createEmptyMilestone(prev.milestones.length)],
      };
    });
  };

  const handleRemoveMilestone = (index: number) => {
    setFormState((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const donationGoal = Number(formState.donationGoal);
    const impactStudentsHelped = Number(formState.impactStudentsHelped);
    const impactNotesShared = Number(formState.impactNotesShared);
    const impactLibrariesDigitized = Number(formState.impactLibrariesDigitized);

    if ([donationGoal, impactStudentsHelped, impactNotesShared, impactLibrariesDigitized].some((value) => Number.isNaN(value))) {
      toast({ variant: 'destructive', title: 'Please enter valid numeric values.' });
      return;
    }

    const normalizedMilestones = formState.milestones
      .map((milestone) => ({
        goal: Number(milestone.goal),
        title: milestone.title.trim(),
        description: milestone.description.trim() || undefined,
      }))
      .filter((milestone) => !Number.isNaN(milestone.goal) && milestone.title.length > 0)
      .sort((a, b) => a.goal - b.goal);

    startTransition(async () => {
      const payload = {
        donationGoal,
        impactStudentsHelped,
        impactNotesShared,
        impactLibrariesDigitized,
        milestones: normalizedMilestones,
      };

      const formData = new FormData();
      formData.append('settings', JSON.stringify(payload));

      const result = await updateDonationSettings(formData);

      if (!result.success) {
        toast({ variant: 'destructive', title: 'Failed to save donation settings', description: result.error ?? undefined });
        return;
      }

      toast({ title: 'Donation settings updated successfully.' });
      router.refresh();
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardHeader>
          <CardTitle>Donation campaign</CardTitle>
          <CardDescription>Configure the monthly donation goal, impact counters, and milestone rewards.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <section className="space-y-4">
            <div>
              <Label htmlFor="donation-goal">Monthly goal (₹)</Label>
              <Input
                id="donation-goal"
                type="number"
                min={100}
                step={100}
                value={formState.donationGoal}
                onChange={(event) => handleFieldChange('donationGoal', event.target.value)}
                required
              />
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label htmlFor="impact-students">Students helped</Label>
                <Input
                  id="impact-students"
                  type="number"
                  min={0}
                  value={formState.impactStudentsHelped}
                  onChange={(event) => handleFieldChange('impactStudentsHelped', event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="impact-notes">Notes shared</Label>
                <Input
                  id="impact-notes"
                  type="number"
                  min={0}
                  value={formState.impactNotesShared}
                  onChange={(event) => handleFieldChange('impactNotesShared', event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="impact-libraries">Libraries digitized</Label>
                <Input
                  id="impact-libraries"
                  type="number"
                  min={0}
                  value={formState.impactLibrariesDigitized}
                  onChange={(event) => handleFieldChange('impactLibrariesDigitized', event.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">Milestone rewards</h3>
                <p className="text-sm text-muted-foreground">Celebrate major checkpoints as the community raises funds.</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddMilestone} disabled={formState.milestones.length >= MAX_MILESTONES}>
                <Plus className="mr-2 size-4" /> Add milestone
              </Button>
            </div>

            <div className="space-y-4">
              {formState.milestones.length === 0 && (
                <p className="text-sm text-muted-foreground">No milestones configured yet. Add one to get started.</p>
              )}
              {formState.milestones.map((milestone, index) => {
                const issues = milestoneIssues[index];
                return (
                  <div key={milestone.id} className={cn('rounded-lg border p-4', issues.length > 0 && 'border-destructive/50')}> 
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="flex-1 space-y-3">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <Label htmlFor={`milestone-${milestone.id}-goal`}>Goal (₹)</Label>
                            <Input
                              id={`milestone-${milestone.id}-goal`}
                              type="number"
                              min={0}
                              step={100}
                              value={milestone.goal}
                              onChange={(event) => handleMilestoneChange(index, { goal: event.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor={`milestone-${milestone.id}-title`}>Title</Label>
                            <Input
                              id={`milestone-${milestone.id}-title`}
                              value={milestone.title}
                              onChange={(event) => handleMilestoneChange(index, { title: event.target.value })}
                              placeholder="Server Shield unlocked"
                              required
                            />
                          </div>
                          <div className="md:col-span-2">
                            <Label htmlFor={`milestone-${milestone.id}-description`}>Description</Label>
                            <Textarea
                              id={`milestone-${milestone.id}-description`}
                              rows={2}
                              value={milestone.description}
                              onChange={(event) => handleMilestoneChange(index, { description: event.target.value })}
                              placeholder="Extend mentor office hours for the campus community."
                            />
                          </div>
                        </div>
                        {issues.length > 0 && (
                          <p className="text-xs text-destructive">{issues.join(' • ')}</p>
                        )}
                      </div>
                      <Button type="button" variant="ghost" className="text-destructive" onClick={() => handleRemoveMilestone(index)}>
                        <Trash2 className="mr-2 size-4" /> Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </CardContent>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save donation settings
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
