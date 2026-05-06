'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

export default function NewExamBankPage() {
  const router = useRouter();
  const supabase = createClient();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    exam_type: 'NEET',
    subject: '',
    difficulty: 'medium',
    duration_minutes: 180,
    total_marks: 720,
    negative_marking: true,
    negative_marks_per_wrong: 1,
    is_free: true,
    tags: '',
  });

  const set = (key: string, value: unknown) => setForm(prev => ({ ...prev, [key]: value }));

  const handleSave = async () => {
    if (!form.title || !form.subject) {
      toast.error('Title and subject are required');
      return;
    }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase.from('exam_banks').insert({
      ...form,
      tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      created_by: user?.id,
      is_published: false,
    }).select('id').single();

    if (error) {
      toast.error('Failed to create exam bank');
      setSaving(false);
      return;
    }
    toast.success('Exam bank created! Now add questions.');
    router.push(`/admin/exams/${data.id}/questions`);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/exams">
          <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold">New Exam Bank</h1>
          <p className="text-sm text-muted-foreground">Configure the exam metadata</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="title">Exam Title *</Label>
            <Input id="title" placeholder="e.g. NEET 2025 Full Mock Test" value={form.title} onChange={e => set('title', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Exam Type *</Label>
            <Select value={form.exam_type} onValueChange={v => set('exam_type', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['NEET','JEE','UPSC','CUET','CAT','GATE','CLAT','NDA','OTHER'].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" placeholder="e.g. Biology, Physics, Chemistry" value={form.subject} onChange={e => set('subject', e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Difficulty</Label>
            <Select value={form.difficulty} onValueChange={v => set('difficulty', v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {['easy','medium','hard','mixed'].map(d => (
                  <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input id="duration" type="number" value={form.duration_minutes} onChange={e => set('duration_minutes', Number(e.target.value))} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="marks">Total Marks</Label>
            <Input id="marks" type="number" value={form.total_marks} onChange={e => set('total_marks', Number(e.target.value))} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="neg">Negative Marks Per Wrong</Label>
            <Input id="neg" type="number" step="0.25" value={form.negative_marks_per_wrong} onChange={e => set('negative_marks_per_wrong', Number(e.target.value))} />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="desc">Description</Label>
            <Textarea id="desc" placeholder="What this exam covers..." value={form.description} onChange={e => set('description', e.target.value)} />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input id="tags" placeholder="biology, physics, chemistry" value={form.tags} onChange={e => set('tags', e.target.value)} />
          </div>

          <div className="flex items-center gap-3">
            <Switch id="neg_marking" checked={form.negative_marking} onCheckedChange={v => set('negative_marking', v)} />
            <Label htmlFor="neg_marking">Negative Marking</Label>
          </div>
          <div className="flex items-center gap-3">
            <Switch id="free" checked={form.is_free} onCheckedChange={v => set('is_free', v)} />
            <Label htmlFor="free">Free for students</Label>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <Link href="/admin/exams"><Button variant="outline">Cancel</Button></Link>
        <Button onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="size-4" />
          {saving ? 'Saving...' : 'Save & Add Questions'}
        </Button>
      </div>
    </div>
  );
}
