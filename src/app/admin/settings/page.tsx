
import PageHeader from "@/components/admin/page-header";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SettingsForm from "@/components/admin/settings/form";
import type { PlatformSettings } from "@/lib/types";

export const revalidate = 0;

const defaultSettings: PlatformSettings = {
    student: {
        charge_for_posts: false,
        post_price: 10,
    },
    vendor: {
        charge_for_platform_access: false,
        price_per_service_per_month: 500,
    },
    start_date: null,
    applicationVisibility: {
        showCompetitionApplicants: true,
        showInternshipApplicants: true,
    },
};

export default async function AdminSettingsPage() {
    const supabase = createClient();
    const { data } = await supabase
        .from('platform_settings')
        .select('value')
        .eq('key', 'monetization')
        .single();

    const storedSettings = (data?.value as Partial<PlatformSettings> | null) ?? null;

    const settings: PlatformSettings = {
        ...defaultSettings,
        ...storedSettings,
        student: { ...defaultSettings.student, ...(storedSettings?.student ?? {}) },
        vendor: { ...defaultSettings.vendor, ...(storedSettings?.vendor ?? {}) },
        applicationVisibility: {
            ...defaultSettings.applicationVisibility,
            ...(storedSettings?.applicationVisibility ?? {}),
        },
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Platform Settings" description="Configure global settings for the application." />
            <Card>
                <CardHeader>
                    <CardTitle>Monetization</CardTitle>
                    <CardDescription>Manage how students and vendors are charged for using the platform.</CardDescription>
                </CardHeader>
                <CardContent>
                    <SettingsForm currentSettings={settings} />
                </CardContent>
            </Card>
        </div>
    )
}
