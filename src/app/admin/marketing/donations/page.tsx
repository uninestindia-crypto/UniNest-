import type { Metadata } from 'next';
import DonationSettingsForm from '@/components/admin/marketing/donation-settings-form';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Donation Settings | UniNest Admin',
};

const fallbackImpact = {
  studentsHelped: 4521,
  notesShared: 12300,
  librariesDigitized: 2,
};

const parseNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  return fallback;
};

const parseMilestones = (raw: unknown) => {
  if (!raw) return [];
  const source = typeof raw === 'string' ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
  if (!Array.isArray(source)) return [];
  return source
    .map((item) => ({
      goal: parseNumber(item?.goal, 0),
      title: typeof item?.title === 'string' ? item.title : '',
      description: typeof item?.description === 'string' ? item.description : undefined,
    }))
    .filter((item) => item.goal > 0 && item.title.length > 0)
    .sort((a, b) => a.goal - b.goal);
};

export default async function DonationSettingsPage() {
  const supabase = createClient();

  const [configResult, authResult] = await Promise.all([
    supabase
      .from('app_config')
      .select('key, value')
      .in('key', [
        'donation_goal',
        'impact_students_helped',
        'impact_notes_shared',
        'impact_libraries_digitized',
        'donation_milestones',
      ]),
    supabase.auth.getUser(),
  ]);

  const configEntries = configResult.data ?? [];
  const configMap = configEntries.reduce<Record<string, any>>((acc, entry) => {
    acc[entry.key] = entry.value;
    return acc;
  }, {});

  const donationGoal = parseNumber(configMap['donation_goal'], 50000);
  const impactStudentsHelped = parseNumber(configMap['impact_students_helped'], fallbackImpact.studentsHelped);
  const impactNotesShared = parseNumber(configMap['impact_notes_shared'], fallbackImpact.notesShared);
  const impactLibrariesDigitized = parseNumber(
    configMap['impact_libraries_digitized'],
    fallbackImpact.librariesDigitized,
  );

  const milestones = parseMilestones(configMap['donation_milestones']);

  const userRole = authResult.data.user?.user_metadata?.role;
  if (userRole !== 'admin') {
    return (
      <div className="p-6 text-destructive">
        <h1 className="text-2xl font-bold">Access restricted</h1>
        <p className="mt-2">You need administrator permissions to manage donation settings.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Donation settings</h1>
        <p className="text-muted-foreground">
          Tune the goals and milestones that power the UniNest donation campaign.
        </p>
      </div>
      <DonationSettingsForm
        initialGoal={donationGoal}
        initialImpact={{
          studentsHelped: impactStudentsHelped,
          notesShared: impactNotesShared,
          librariesDigitized: impactLibrariesDigitized,
        }}
        initialMilestones={milestones}
      />
    </div>
  );
}
