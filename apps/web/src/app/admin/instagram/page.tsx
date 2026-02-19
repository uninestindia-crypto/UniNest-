'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Instagram, Webhook, Bot, AlertCircle } from 'lucide-react';

export default function InstagramBotPage() {
    return (
        <div className="flex flex-col gap-6 p-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight">Instagram Bot</h1>
                <p className="text-muted-foreground text-sm">Automate student onboarding via Instagram DMs.</p>
            </div>

            <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
                <CardContent className="pt-4 flex items-start gap-3">
                    <AlertCircle className="size-5 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                        <p className="font-medium text-amber-800 dark:text-amber-400">Setup Required</p>
                        <p className="text-sm text-amber-700 dark:text-amber-500 mt-1">
                            You need to register a Meta Business App and connect your Instagram account to use this feature. Follow the steps below.
                        </p>
                    </div>
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-4">
                {[
                    {
                        step: '01',
                        title: 'Register Meta App',
                        description: 'Go to developers.facebook.com and create a Business App with Instagram and Webhooks permissions.',
                        icon: Bot,
                        color: 'text-blue-600',
                    },
                    {
                        step: '02',
                        title: 'Connect Webhooks',
                        description: 'Set the Webhook URL to your Supabase Edge Function endpoint to receive comment and DM events.',
                        icon: Webhook,
                        color: 'text-purple-600',
                    },
                    {
                        step: '03',
                        title: 'Automated Replies',
                        description: 'When a student comments your keyword (e.g. "HOSTEL"), the bot DMs them with the registration link instantly.',
                        icon: Instagram,
                        color: 'text-pink-600',
                    },
                ].map(item => (
                    <Card key={item.step}>
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-muted-foreground/30">{item.step}</span>
                                <item.icon className={`size-6 ${item.color}`} />
                            </div>
                            <CardTitle className="text-base mt-2">{item.title}</CardTitle>
                            <CardDescription>{item.description}</CardDescription>
                        </CardHeader>
                    </Card>
                ))}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">How It Works (Zero Cost Flow)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                    {[
                        { trigger: 'Student comments "HOSTEL" on post', action: 'Bot sends registration link via DM', status: 'Automated' },
                        { trigger: 'Student replies to Story', action: 'Bot asks for university & budget, saves to Leads table', status: 'Automated' },
                        { trigger: 'Student clicks link', action: 'Lead is marked "Interested" in Lead Management', status: 'Automated' },
                        { trigger: 'Lead stale for 3 days', action: 'Bot sends follow-up WhatsApp to team', status: 'Planned' },
                    ].map((flow, i) => (
                        <div key={i} className="flex items-start justify-between gap-4 py-2 border-b last:border-0">
                            <div className="flex-1">
                                <p className="text-sm font-medium">{flow.trigger}</p>
                                <p className="text-xs text-muted-foreground mt-0.5">→ {flow.action}</p>
                            </div>
                            <Badge variant={flow.status === 'Automated' ? 'default' : 'secondary'} className="text-xs shrink-0">
                                {flow.status}
                            </Badge>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    );
}
