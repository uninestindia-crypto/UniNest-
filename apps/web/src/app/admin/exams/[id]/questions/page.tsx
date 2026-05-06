'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  ArrowLeft, Plus, Trash2, Share2, Copy, CheckCircle2,
  GripVertical, ChevronDown, ChevronUp, Bot, Sparkles,
} from 'lucide-react';
import Link from 'next/link';

type Question = {
  id?: string;
  question_number: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: 'A' | 'B' | 'C' | 'D';
  explanation: string;
  marks: number;
  subject_tag: string;
  topic_tag: string;
  difficulty: string;
  is_shareable: boolean;
  is_saved?: boolean;
};

const BLANK_Q = (num: number): Question => ({
  question_number: num,
  question_text: '',
  option_a: '',
  option_b: '',
  option_c: '',
  option_d: '',
  correct_option: 'A',
  explanation: '',
  marks: 4,
  subject_tag: '',
  topic_tag: '',
  difficulty: 'medium',
  is_shareable: true,
});

function ShareMenu({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const text = encodeURIComponent(
    `Q: ${q.question_text}\nA) ${q.option_a}\nB) ${q.option_b}\nC) ${q.option_c}\nD) ${q.option_d}\n\nAnswer: ${q.correct_option}`
  );

  const links = [
    {
      label: 'Ask Gemini',
      icon: '✦',
      color: 'text-blue-500',
      href: `https://gemini.google.com/app?q=${text}`,
    },
    {
      label: 'Ask ChatGPT',
      icon: '⊕',
      color: 'text-emerald-500',
      href: `https://chatgpt.com/?q=${text}`,
    },
    {
      label: 'Ask Claude',
      icon: '◎',
      color: 'text-amber-500',
      href: `https://claude.ai/new?q=${text}`,
    },
  ];

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="size-8 text-muted-foreground hover:text-primary"
        onClick={() => setOpen(!open)}
        title="Share this question with AI"
      >
        <Share2 className="size-4" />
      </Button>
      {open && (
        <div className="absolute right-0 top-9 z-50 w-44 bg-popover border rounded-xl shadow-xl p-1">
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              <span className={`font-bold text-base ${l.color}`}>{l.icon}</span>
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

function QuestionCard({
  q, idx, onChange, onDelete, onSave, saving,
}: {
  q: Question;
  idx: number;
  onChange: (idx: number, field: string, val: unknown) => void;
  onDelete: (idx: number) => void;
  onSave: (idx: number) => void;
  saving: boolean;
}) {
  const [expanded, setExpanded] = useState(!q.is_saved);

  return (
    <div className={`border rounded-xl overflow-hidden transition-all ${q.is_saved ? 'bg-card' : 'bg-card shadow-md ring-1 ring-primary/20'}`}>
      {/* Header */}
      <div
        className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/30"
        onClick={() => setExpanded(!expanded)}
      >
        <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Q{q.question_number}</span>
            {q.is_saved && <CheckCircle2 className="size-3.5 text-emerald-500" />}
            <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
              q.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700' :
              q.difficulty === 'hard' ? 'bg-red-100 text-red-700' :
              'bg-amber-100 text-amber-700'
            }`}>{q.difficulty}</span>
          </div>
          <p className="text-sm font-medium truncate mt-0.5">
            {q.question_text || <span className="text-muted-foreground italic">Empty question...</span>}
          </p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {q.is_shareable && <ShareMenu q={q} />}
          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-destructive hover:bg-destructive/10"
            onClick={e => { e.stopPropagation(); onDelete(idx); }}
          >
            <Trash2 className="size-4" />
          </Button>
          {expanded ? <ChevronUp className="size-4 text-muted-foreground" /> : <ChevronDown className="size-4 text-muted-foreground" />}
        </div>
      </div>

      {/* Body */}
      {expanded && (
        <div className="border-t p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Question Text *</Label>
            <Textarea
              placeholder="Type the question here..."
              value={q.question_text}
              onChange={e => onChange(idx, 'question_text', e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['a','b','c','d'] as const).map(opt => (
              <div key={opt} className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <span className={`size-5 flex items-center justify-center rounded-full text-xs font-bold text-white ${
                    q.correct_option === opt.toUpperCase() ? 'bg-emerald-500' : 'bg-muted text-muted-foreground'
                  }`}>
                    {opt.toUpperCase()}
                  </span>
                  {q.correct_option === opt.toUpperCase() && <span className="text-[10px] text-emerald-600 font-semibold">Correct</span>}
                </Label>
                <Input
                  placeholder={`Option ${opt.toUpperCase()}`}
                  value={q[`option_${opt}` as keyof Question] as string}
                  onChange={e => onChange(idx, `option_${opt}`, e.target.value)}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Correct Answer</Label>
              <Select value={q.correct_option} onValueChange={v => onChange(idx, 'correct_option', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['A','B','C','D'].map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Marks</Label>
              <Input type="number" value={q.marks} onChange={e => onChange(idx, 'marks', Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select value={q.difficulty} onValueChange={v => onChange(idx, 'difficulty', v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['easy','medium','hard'].map(d => <SelectItem key={d} value={d} className="capitalize">{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Subject Tag</Label>
              <Input placeholder="e.g. Biology" value={q.subject_tag} onChange={e => onChange(idx, 'subject_tag', e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>Topic Tag</Label>
              <Input placeholder="e.g. Cell Biology" value={q.topic_tag} onChange={e => onChange(idx, 'topic_tag', e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Explanation (shown after submission)</Label>
            <Textarea
              placeholder="Explain why the correct answer is right..."
              value={q.explanation}
              onChange={e => onChange(idx, 'explanation', e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id={`share-${idx}`}
                checked={q.is_shareable}
                onCheckedChange={v => onChange(idx, 'is_shareable', v)}
              />
              <Label htmlFor={`share-${idx}`} className="text-sm">
                Students can share with AI
              </Label>
            </div>
            <Button size="sm" onClick={() => onSave(idx)} disabled={saving} className="gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Save Question
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function QuestionsManagerPage() {
  const { id } = useParams<{ id: string }>();
  const supabase = createClient();
  const [bank, setBank] = useState<{ title: string; exam_type: string } | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const [{ data: bankData }, { data: qData }] = await Promise.all([
        supabase.from('exam_banks').select('title, exam_type').eq('id', id).single(),
        supabase.from('exam_questions').select('*').eq('bank_id', id).order('question_number'),
      ]);
      setBank(bankData);
      setQuestions((qData || []).map(q => ({ ...q, is_saved: true })));
      setLoading(false);
    };
    load();
  }, [id]);

  const addQuestion = () => {
    setQuestions(prev => [...prev, BLANK_Q(prev.length + 1)]);
  };

  const changeQuestion = (idx: number, field: string, val: unknown) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: val, is_saved: false } : q));
  };

  const deleteQuestion = async (idx: number) => {
    const q = questions[idx];
    if (q.id) {
      await supabase.from('exam_questions').delete().eq('id', q.id);
    }
    setQuestions(prev => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((q, i) => ({ ...q, question_number: i + 1 }));
    });
  };

  const saveQuestion = async (idx: number) => {
    const q = questions[idx];
    setSaving(true);
    if (q.id) {
      await supabase.from('exam_questions').update({ ...q, bank_id: id }).eq('id', q.id);
    } else {
      const { data } = await supabase.from('exam_questions').insert({ ...q, bank_id: id }).select('id').single();
      if (data) setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, id: data.id } : item));
    }
    setQuestions(prev => prev.map((item, i) => i === idx ? { ...item, is_saved: true } : item));
    // Update total marks on bank
    const total = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
    await supabase.from('exam_banks').update({ total_marks: total }).eq('id', id);
    toast.success('Question saved!');
    setSaving(false);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin size-8 rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/admin/exams">
          <Button variant="ghost" size="icon"><ArrowLeft className="size-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold">{bank?.title}</h1>
          <p className="text-sm text-muted-foreground">{questions.length} questions · {bank?.exam_type}</p>
        </div>
        <Button onClick={addQuestion} className="gap-2">
          <Plus className="size-4" /> Add Question
        </Button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-muted/20">
          <Sparkles className="size-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="font-medium">No questions yet</p>
          <p className="text-sm text-muted-foreground mb-4">Click "Add Question" to create your first MCQ</p>
          <Button onClick={addQuestion} className="gap-2"><Plus className="size-4" /> Add First Question</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, idx) => (
            <QuestionCard
              key={idx}
              q={q}
              idx={idx}
              onChange={changeQuestion}
              onDelete={deleteQuestion}
              onSave={saveQuestion}
              saving={saving}
            />
          ))}
        </div>
      )}

      {questions.length > 0 && (
        <div className="sticky bottom-4 flex justify-center">
          <Button onClick={addQuestion} variant="outline" className="gap-2 shadow-lg bg-background">
            <Plus className="size-4" /> Add Another Question
          </Button>
        </div>
      )}
    </div>
  );
}
