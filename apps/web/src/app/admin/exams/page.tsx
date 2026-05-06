'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Plus, Search, BookOpen, Pencil, Trash2, Eye, 
  EyeOff, FileText, Users, BarChart2 
} from 'lucide-react';
import Link from 'next/link';
import type { Metadata } from 'next';

type ExamBank = {
  id: string;
  title: string;
  exam_type: string;
  subject: string;
  difficulty: string;
  duration_minutes: number;
  total_marks: number;
  is_published: boolean;
  is_free: boolean;
  created_at: string;
  question_count?: number;
};

const EXAM_TYPE_COLORS: Record<string, string> = {
  NEET: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
  JEE: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
  UPSC: 'bg-amber-500/10 text-amber-700 border-amber-500/20',
  CUET: 'bg-violet-500/10 text-violet-600 border-violet-500/20',
  CAT: 'bg-rose-500/10 text-rose-600 border-rose-500/20',
  GATE: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
  OTHER: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
};

export default function AdminExamsPage() {
  const supabase = createClient();
  const [exams, setExams] = useState<ExamBank[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<string>('ALL');

  const fetchExams = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('exam_banks')
      .select('*')
      .order('created_at', { ascending: false });
    setExams(data || []);
    setLoading(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('exam_banks').update({ is_published: !current }).eq('id', id);
    setExams(prev => prev.map(e => e.id === id ? { ...e, is_published: !current } : e));
  };

  const deleteExam = async (id: string) => {
    if (!confirm('Delete this exam bank and all its questions?')) return;
    await supabase.from('exam_banks').delete().eq('id', id);
    setExams(prev => prev.filter(e => e.id !== id));
  };

  useEffect(() => { fetchExams(); }, []);

  const filtered = exams.filter(e => {
    const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'ALL' || e.exam_type === filter;
    return matchSearch && matchFilter;
  });

  const examTypes = ['ALL', 'NEET', 'JEE', 'UPSC', 'CUET', 'CAT', 'GATE', 'OTHER'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Exam Bank Manager</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Create, manage and publish competitive exam question papers
          </p>
        </div>
        <Link href="/admin/exams/new">
          <Button className="gap-2">
            <Plus className="size-4" /> New Exam Bank
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', value: exams.length, icon: BookOpen, color: 'text-blue-500' },
          { label: 'Published', value: exams.filter(e => e.is_published).length, icon: Eye, color: 'text-emerald-500' },
          { label: 'Draft', value: exams.filter(e => !e.is_published).length, icon: FileText, color: 'text-amber-500' },
          { label: 'NEET Papers', value: exams.filter(e => e.exam_type === 'NEET').length, icon: BarChart2, color: 'text-violet-500' },
        ].map(stat => (
          <div key={stat.label} className="bg-card border rounded-xl p-4 flex items-center gap-4">
            <div className={`p-2 rounded-lg bg-muted ${stat.color}`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by title or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {examTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                filter === type
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'border-border text-muted-foreground hover:border-primary/50'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Exam List */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <div className="animate-spin size-8 rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground border rounded-xl bg-muted/20">
          <BookOpen className="size-12 mx-auto mb-4 opacity-30" />
          <p className="font-medium">No exam banks found</p>
          <p className="text-sm mt-1">Create your first exam bank to get started</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map(exam => (
            <div
              key={exam.id}
              className="bg-card border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${EXAM_TYPE_COLORS[exam.exam_type] || EXAM_TYPE_COLORS.OTHER}`}>
                    {exam.exam_type}
                  </span>
                  {exam.is_published ? (
                    <span className="text-xs text-emerald-600 font-medium">● Published</span>
                  ) : (
                    <span className="text-xs text-amber-600 font-medium">○ Draft</span>
                  )}
                  {exam.is_free && (
                    <span className="text-xs text-blue-500 font-medium border border-blue-200 rounded-full px-2">Free</span>
                  )}
                </div>
                <h3 className="font-semibold text-base">{exam.title}</h3>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {exam.subject} · {exam.duration_minutes} min · {exam.total_marks} marks · {exam.difficulty}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={`/admin/exams/${exam.id}/questions`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Users className="size-3.5" /> Questions
                  </Button>
                </Link>
                <Link href={`/admin/exams/${exam.id}/edit`}>
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Pencil className="size-3.5" /> Edit
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5"
                  onClick={() => togglePublish(exam.id, exam.is_published)}
                >
                  {exam.is_published ? <EyeOff className="size-3.5" /> : <Eye className="size-3.5" />}
                  {exam.is_published ? 'Unpublish' : 'Publish'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() => deleteExam(exam.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
