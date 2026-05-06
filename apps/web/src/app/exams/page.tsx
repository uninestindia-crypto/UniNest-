import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { BookOpen, Clock, BarChart2, ChevronRight, Zap, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Exam Prep | UniNest',
  description: 'Practice NEET, JEE, UPSC and more with AI-powered mock tests.',
};

const EXAM_GRADIENTS: Record<string, string> = {
  NEET: 'from-emerald-500 to-teal-600',
  JEE: 'from-blue-500 to-indigo-600',
  UPSC: 'from-amber-500 to-orange-600',
  CUET: 'from-violet-500 to-purple-600',
  CAT: 'from-rose-500 to-pink-600',
  GATE: 'from-cyan-500 to-sky-600',
  OTHER: 'from-gray-500 to-slate-600',
};

const EXAM_ICONS: Record<string, string> = {
  NEET: '🧬', JEE: '⚛️', UPSC: '🏛️', CUET: '📚', CAT: '📊', GATE: '⚙️', OTHER: '📝',
};

export default async function ExamsPage() {
  const supabase = await createClient();
  const { data: exams } = await supabase
    .from('exam_banks')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false });

  const examTypes = [...new Set((exams || []).map(e => e.exam_type))];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 text-white px-6 py-16">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-1.5 text-sm font-medium mb-4">
            <Zap className="size-4" /> AI-Powered Exam Prep
          </div>
          <h1 className="text-3xl md:text-5xl font-bold mb-4">Crack Your Competitive Exam</h1>
          <p className="text-indigo-100 text-lg max-w-xl mx-auto">
            Practice NEET, JEE, UPSC and more. Share questions with Gemini or ChatGPT. Print PDFs for offline practice.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 space-y-10">
        {/* Exam Type Filter pills (static UI, filter is client-side via links) */}
        {examTypes.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {examTypes.map(type => (
              <span
                key={type}
                className={`px-4 py-1.5 rounded-full text-xs font-bold text-white bg-gradient-to-r ${EXAM_GRADIENTS[type] || EXAM_GRADIENTS.OTHER}`}
              >
                {EXAM_ICONS[type]} {type}
              </span>
            ))}
          </div>
        )}

        {/* Exam Grid */}
        {!exams || exams.length === 0 ? (
          <div className="text-center py-24 border rounded-2xl bg-muted/20">
            <BookOpen className="size-12 mx-auto mb-4 text-muted-foreground/30" />
            <p className="font-semibold text-lg">No exams published yet</p>
            <p className="text-muted-foreground text-sm mt-1">Check back soon — admins are preparing your tests!</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map(exam => (
              <Link
                key={exam.id}
                href={`/exams/${exam.id}`}
                className="group bg-card border rounded-2xl overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Card top gradient */}
                <div className={`h-28 bg-gradient-to-br ${EXAM_GRADIENTS[exam.exam_type] || EXAM_GRADIENTS.OTHER} flex items-center justify-center relative overflow-hidden`}>
                  <span className="text-5xl">{EXAM_ICONS[exam.exam_type]}</span>
                  <div className="absolute top-3 right-3">
                    {exam.is_free ? (
                      <span className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white px-2 py-1 rounded-full">FREE</span>
                    ) : (
                      <Star className="size-4 text-yellow-300 fill-yellow-300" />
                    )}
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center gap-1.5 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${EXAM_GRADIENTS[exam.exam_type] || EXAM_GRADIENTS.OTHER}`}>
                      {exam.exam_type}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize border rounded-full px-2 py-0.5">{exam.difficulty}</span>
                  </div>
                  <h3 className="font-bold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                    {exam.title}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">{exam.subject}</p>

                  <div className="flex items-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="size-3" /> {exam.duration_minutes} min
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart2 className="size-3" /> {exam.total_marks} marks
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button size="sm" className="flex-1 gap-1">
                      Start Test <ChevronRight className="size-3.5" />
                    </Button>
                    <Link href={`/exams/${exam.id}/pdf`} onClick={e => e.stopPropagation()}>
                      <Button size="sm" variant="outline" className="px-3" title="Download PDF">
                        📄
                      </Button>
                    </Link>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
