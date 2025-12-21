import type { Metadata } from 'next';
import DonationSettingsForm from '@/components/admin/marketing/donation-settings-form';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'Donation Settings | UniNest Admin',
};

const fallbackImpact = {
  studentsHelped: 0,
  notesShared: 0,
  librariesDigitized: 0,
};

const isMissingTableError = (error: unknown) =>
  typeof error === 'object' && error !== null && 'code' in error && (error as { code?: string }).code === 'PGRST205';

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
  // Use admin client - the admin layout already handles authorization
  const supabase = createAdminClient();

  const configResult = await supabase
    .from('app_config')
    .select('key, value')
    .in('key', [
      'donation_goal',
      'impact_students_helped',
      'impact_notes_shared',
      'impact_libraries_digitized',
      'donation_milestones',
    ]);

  const configEntries = (() => {
    if (!configResult.error) {
      return configResult.data ?? [];
    }
    if (isMissingTableError(configResult.error)) {
      console.warn('[admin/donations] app_config table missing. Using default configuration.');
      return [];
    }
    throw configResult.error;
  })();
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
