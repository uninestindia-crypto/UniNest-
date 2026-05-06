'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle2,
  Share2, BookOpen, AlertTriangle,
} from 'lucide-react';

type Question = {
  id: string;
  question_number: number;
  question_text: string;
  option_a: string; option_b: string; option_c: string; option_d: string;
  correct_option: string;
  explanation: string;
  marks: number;
  difficulty: string;
  is_shareable: boolean;
};

type Bank = {
  id: string; title: string; exam_type: string; duration_minutes: number;
  total_marks: number; negative_marking: boolean; negative_marks_per_wrong: number;
};

type Answer = { option: string | null; flagged: boolean; time: number };

const OPTIONS = ['A','B','C','D'] as const;
const OPT_LABELS: Record<string, string> = { A: 'option_a', B: 'option_b', C: 'option_c', D: 'option_d' };

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`;
}

function ShareQuestion({ q }: { q: Question }) {
  const [open, setOpen] = useState(false);
  const text = encodeURIComponent(
    `Explain this exam question:\n\nQ: ${q.question_text}\nA) ${q.option_a}\nB) ${q.option_b}\nC) ${q.option_c}\nD) ${q.option_d}\n\nCorrect: ${q.correct_option}`
  );

  if (!q.is_shareable) return null;

  return (
    <div className="relative inline-block">
      <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground" onClick={() => setOpen(!open)}>
        <Share2 className="size-4" /> Ask AI
      </Button>
      {open && (
        <div className="absolute top-9 right-0 z-50 w-48 bg-popover border rounded-xl shadow-2xl p-1.5 space-y-1">
          {[
            { label: 'Ask Gemini', emoji: '✦', color: 'text-blue-500', url: `https://gemini.google.com/app?q=${text}` },
            { label: 'Ask ChatGPT', emoji: '⊕', color: 'text-emerald-500', url: `https://chatgpt.com/?q=${text}` },
            { label: 'Ask Claude', emoji: '◎', color: 'text-amber-500', url: `https://claude.ai/new?q=${text}` },
          ].map(l => (
            <a key={l.label} href={l.url} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-muted transition-colors"
              onClick={() => setOpen(false)}
            >
              <span className={`font-bold ${l.color}`}>{l.emoji}</span>{l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ExamAttemptPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [bank, setBank] = useState<Bank | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<number, Answer>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'test' | 'result'>('loading');
  const [result, setResult] = useState<{ score: number; correct: number; wrong: number; skipped: number; pct: number } | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const startRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const load = async () => {
      const [{ data: bankData }, { data: qData }] = await Promise.all([
        supabase.from('exam_banks').select('*').eq('id', id).single(),
        supabase.from('exam_questions').select('*').eq('bank_id', id).order('question_number'),
      ]);
      if (!bankData) { router.push('/exams'); return; }
      setBank(bankData);
      setQuestions(qData || []);
      setTimeLeft((bankData.duration_minutes || 60) * 60);
      setPhase('intro');
    };
    load();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [id]);

  const startExam = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error('Please log in to start a test'); return; }
    const { data } = await supabase.from('exam_attempts').insert({
      bank_id: id, user_id: user.id, status: 'in_progress',
    }).select('id').single();
    setAttemptId(data?.id || null);
    startRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { clearInterval(timerRef.current!); handleSubmit(true); return 0; }
        return prev - 1;
      });
    }, 1000);
    setPhase('test');
  };

  const handleSubmit = useCallback(async (auto = false) => {
    if (!auto && !confirm('Submit exam now?')) return;
    if (timerRef.current) clearInterval(timerRef.current);

    let score = 0, correct = 0, wrong = 0, skipped = 0;
    const answerRows: object[] = [];

    questions.forEach((q, i) => {
      const ans = answers[i];
      const selected = ans?.option || null;
      const isSkipped = !selected;
      const isCorrect = selected === q.correct_option;

      if (isSkipped) { skipped++; }
      else if (isCorrect) { correct++; score += q.marks; }
      else { wrong++; if (bank?.negative_marking) score -= (bank.negative_marks_per_wrong || 1); }

      if (attemptId) {
        answerRows.push({
          attempt_id: attemptId,
          question_id: q.id,
          selected_option: selected,
          is_correct: isSkipped ? null : isCorrect,
          is_skipped: isSkipped,
        });
      }
    });

    const pct = bank ? Math.max(0, (score / bank.total_marks) * 100) : 0;

    if (attemptId) {
      await Promise.all([
        supabase.from('exam_attempts').update({
          status: 'submitted',
          submitted_at: new Date().toISOString(),
          time_taken_seconds: Math.floor((Date.now() - startRef.current) / 1000),
          score, correct_count: correct, wrong_count: wrong, skipped_count: skipped,
          total_attempted: correct + wrong, percentage: pct,
        }).eq('id', attemptId),
        supabase.from('exam_answers').insert(answerRows),
      ]);
    }

    setResult({ score, correct, wrong, skipped, pct });
    setPhase('result');
  }, [answers, questions, bank, attemptId]);

  const q = questions[current];
  const ans = answers[current];
  const answered = Object.values(answers).filter(a => a.option).length;
  const flagged = Object.values(answers).filter(a => a.flagged).length;

  if (phase === 'loading') return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin size-10 rounded-full border-2 border-primary border-t-transparent" />
    </div>
  );

  if (phase === 'intro' && bank) return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <div className="max-w-md w-full bg-card border rounded-2xl p-8 space-y-6 shadow-xl">
        <div className="text-center">
          <div className="text-5xl mb-3">📝</div>
          <h1 className="text-2xl font-bold">{bank.title}</h1>
          <p className="text-muted-foreground mt-1">{bank.exam_type}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Duration', value: `${bank.duration_minutes} min` },
            { label: 'Total Marks', value: bank.total_marks },
            { label: 'Questions', value: questions.length },
            { label: 'Negative Marks', value: bank.negative_marking ? `-${bank.negative_marks_per_wrong}` : 'None' },
          ].map(item => (
            <div key={item.label} className="bg-muted/40 rounded-xl p-3 text-center">
              <p className="text-lg font-bold">{item.value}</p>
              <p className="text-xs text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 flex gap-2 text-sm text-amber-700 dark:text-amber-400">
          <AlertTriangle className="size-4 shrink-0 mt-0.5" />
          <span>Once started, the timer cannot be paused. Ensure a stable internet connection.</span>
        </div>
        <Button className="w-full h-12 text-base" onClick={startExam}>
          Start Exam
        </Button>
        <Button variant="outline" className="w-full" asChild>
          <a href={`/exams/${id}/pdf`} target="_blank">📄 Download as PDF instead</a>
        </Button>
      </div>
    </div>
  );

  if (phase === 'result' && result && bank) return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center">
      <div className="max-w-xl w-full space-y-6">
        <div className="bg-card border rounded-2xl p-8 text-center shadow-xl">
          <div className="text-6xl mb-4">{result.pct >= 70 ? '🎉' : result.pct >= 40 ? '👍' : '💪'}</div>
          <h1 className="text-3xl font-bold">{result.score.toFixed(1)} / {bank.total_marks}</h1>
          <p className="text-muted-foreground mt-1">{result.pct.toFixed(1)}% Score</p>
          <div className="w-full bg-muted rounded-full h-3 mt-4">
            <div
              className={`h-3 rounded-full transition-all ${result.pct >= 70 ? 'bg-emerald-500' : result.pct >= 40 ? 'bg-amber-500' : 'bg-rose-500'}`}
              style={{ width: `${Math.min(result.pct, 100)}%` }}
            />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Correct', value: result.correct, color: 'text-emerald-600' },
            { label: 'Wrong', value: result.wrong, color: 'text-rose-600' },
            { label: 'Skipped', value: result.skipped, color: 'text-amber-600' },
          ].map(s => (
            <div key={s.label} className="bg-card border rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3">
          <Button className="flex-1" onClick={() => router.push('/exams')}>Back to Exams</Button>
          <Button variant="outline" className="flex-1" onClick={() => router.push(`/exams/${id}/pdf`)}>📄 Print PDF</Button>
        </div>
        {/* Answer Review */}
        <div className="space-y-4 pt-2">
          <h2 className="text-lg font-bold">Answer Review</h2>
          {questions.map((q, i) => {
            const studentAns = answers[i]?.option;
            const isCorrect = studentAns === q.correct_option;
            return (
              <div key={q.id} className={`border rounded-xl p-4 ${isCorrect ? 'border-emerald-200 bg-emerald-50 dark:bg-emerald-950/20' : studentAns ? 'border-rose-200 bg-rose-50 dark:bg-rose-950/20' : 'border-border bg-muted/20'}`}>
                <p className="text-xs text-muted-foreground mb-1">Q{q.question_number}</p>
                <p className="font-medium text-sm">{q.question_text}</p>
                <div className="mt-2 flex gap-3 text-sm">
                  <span>Your answer: <strong>{studentAns || '—'}</strong></span>
                  <span>Correct: <strong className="text-emerald-600">{q.correct_option}</strong></span>
                </div>
                {q.explanation && (
                  <p className="text-xs text-muted-foreground mt-2 border-t pt-2">{q.explanation}</p>
                )}
                <div className="mt-2"><ShareQuestion q={q} /></div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  if (phase !== 'test' || !q) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b px-4 py-3 flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground truncate">{bank?.title}</p>
          <p className="text-sm font-semibold">Q{q.question_number} / {questions.length}</p>
        </div>
        <div className={`flex items-center gap-1.5 font-mono text-sm font-bold px-3 py-1.5 rounded-full ${timeLeft < 300 ? 'bg-rose-100 text-rose-600 dark:bg-rose-950' : 'bg-muted text-foreground'}`}>
          <Clock className="size-3.5" />
          {formatTime(timeLeft)}
        </div>
        <Button size="sm" variant="destructive" onClick={() => handleSubmit(false)}>Submit</Button>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-muted">
        <div className="h-1 bg-primary transition-all" style={{ width: `${((current + 1) / questions.length) * 100}%` }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-6xl mx-auto w-full p-4 gap-4">
        {/* Question Panel */}
        <div className="flex-1 space-y-4">
          <div className="bg-card border rounded-2xl p-6">
            <div className="flex items-start justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                  Q{q.question_number}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{q.difficulty}</span>
                <span className="text-xs text-muted-foreground">+{q.marks} marks</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`size-8 ${ans?.flagged ? 'text-amber-500' : 'text-muted-foreground'}`}
                  onClick={() => setAnswers(prev => ({
                    ...prev,
                    [current]: { ...prev[current] || { option: null, flagged: false, time: 0 }, flagged: !prev[current]?.flagged }
                  }))}
                  title="Flag for review"
                >
                  <Flag className="size-4" />
                </Button>
                <ShareQuestion q={q} />
              </div>
            </div>
            <p className="text-base font-medium leading-relaxed">{q.question_text}</p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {OPTIONS.map(opt => {
              const selected = ans?.option === opt;
              return (
                <button
                  key={opt}
                  onClick={() => setAnswers(prev => ({
                    ...prev,
                    [current]: { ...prev[current] || { flagged: false, time: 0 }, option: selected ? null : opt }
                  }))}
                  className={`w-full flex items-center gap-4 p-4 border-2 rounded-xl text-left transition-all ${
                    selected
                      ? 'border-primary bg-primary/5 shadow-sm'
                      : 'border-border hover:border-primary/40 bg-card hover:bg-muted/30'
                  }`}
                >
                  <span className={`size-8 shrink-0 flex items-center justify-center rounded-full text-sm font-bold transition-all ${
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {opt}
                  </span>
                  <span className="text-sm">{q[OPT_LABELS[opt] as keyof Question] as string}</span>
                  {selected && <CheckCircle2 className="size-4 text-primary ml-auto shrink-0" />}
                </button>
              );
            })}
          </div>

          {/* Nav */}
          <div className="flex justify-between pt-2">
            <Button variant="outline" onClick={() => setCurrent(c => Math.max(0, c - 1))} disabled={current === 0}>
              <ChevronLeft className="size-4 mr-1" /> Previous
            </Button>
            {current < questions.length - 1 ? (
              <Button onClick={() => setCurrent(c => c + 1)}>
                Next <ChevronRight className="size-4 ml-1" />
              </Button>
            ) : (
              <Button variant="destructive" onClick={() => handleSubmit(false)}>
                Submit Exam
              </Button>
            )}
          </div>
        </div>

        {/* Question Grid Sidebar */}
        <div className="lg:w-64 shrink-0">
          <div className="bg-card border rounded-2xl p-4 sticky top-20">
            <h3 className="text-sm font-bold mb-3">Questions</h3>
            <div className="grid grid-cols-6 lg:grid-cols-5 gap-1.5">
              {questions.map((_, i) => {
                const a = answers[i];
                return (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`size-8 rounded-lg text-xs font-semibold border transition-all ${
                      i === current ? 'ring-2 ring-primary' : ''
                    } ${
                      a?.flagged ? 'bg-amber-100 text-amber-700 border-amber-300' :
                      a?.option ? 'bg-primary/20 text-primary border-primary/30' :
                      'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {i + 1}
                  </button>
                );
              })}
            </div>
            <div className="mt-4 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-2"><span className="size-3 rounded bg-primary/20 border border-primary/30 inline-block" /> Answered ({answered})</div>
              <div className="flex items-center gap-2"><span className="size-3 rounded bg-amber-100 border border-amber-300 inline-block" /> Flagged ({flagged})</div>
              <div className="flex items-center gap-2"><span className="size-3 rounded bg-muted border border-border inline-block" /> Not visited ({questions.length - answered})</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
