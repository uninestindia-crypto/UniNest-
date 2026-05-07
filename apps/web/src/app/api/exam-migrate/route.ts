import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// One-time migration endpoint — protected by secret key
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get('secret');
  
  if (secret !== 'exam-migrate-2026') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  );

  const results: { step: string; ok: boolean; error?: string }[] = [];

  const steps = [
    {
      name: 'Create exam_attempts',
      sql: `CREATE TABLE IF NOT EXISTS exam_attempts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        bank_id UUID NOT NULL REFERENCES exam_banks(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
        submitted_at TIMESTAMPTZ,
        time_taken_seconds INTEGER,
        status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress','submitted','abandoned')),
        score NUMERIC(6,2) DEFAULT 0,
        total_attempted INTEGER DEFAULT 0,
        correct_count INTEGER DEFAULT 0,
        wrong_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        percentage NUMERIC(5,2) DEFAULT 0
      )`,
    },
    {
      name: 'Create exam_answers',
      sql: `CREATE TABLE IF NOT EXISTS exam_answers (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
        question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
        selected_option TEXT CHECK (selected_option IN ('A','B','C','D')),
        is_correct BOOLEAN,
        is_skipped BOOLEAN DEFAULT false,
        time_spent_seconds INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      )`,
    },
    {
      name: 'Enable RLS on exam_attempts',
      sql: `ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY`,
    },
    {
      name: 'Enable RLS on exam_answers',
      sql: `ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY`,
    },
    {
      name: 'Policy: users view own attempts',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can view own attempts') THEN CREATE POLICY "Users can view own attempts" ON exam_attempts FOR SELECT USING (auth.uid() = user_id); END IF; END $$`,
    },
    {
      name: 'Policy: users insert attempts',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can create own attempts') THEN CREATE POLICY "Users can create own attempts" ON exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id); END IF; END $$`,
    },
    {
      name: 'Policy: users update attempts',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can update own attempts') THEN CREATE POLICY "Users can update own attempts" ON exam_attempts FOR UPDATE USING (auth.uid() = user_id); END IF; END $$`,
    },
    {
      name: 'Policy: users manage own answers',
      sql: `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_answers' AND policyname='Users can manage own answers') THEN CREATE POLICY "Users can manage own answers" ON exam_answers FOR ALL USING (EXISTS (SELECT 1 FROM exam_attempts WHERE exam_attempts.id = exam_answers.attempt_id AND exam_attempts.user_id = auth.uid())); END IF; END $$`,
    },
    {
      name: 'Index: exam_attempts user',
      sql: `CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id)`,
    },
    {
      name: 'Index: exam_attempts bank',
      sql: `CREATE INDEX IF NOT EXISTS idx_exam_attempts_bank ON exam_attempts(bank_id)`,
    },
    {
      name: 'Index: exam_answers attempt',
      sql: `CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers(attempt_id)`,
    },
  ];

  for (const step of steps) {
    const { error } = await supabase.rpc('exec_sql', { sql: step.sql }).single();
    
    if (error && !error.message.includes('already exists')) {
      // Try direct query approach
      const { error: e2 } = await (supabase as any).from('_sql').select(step.sql);
      results.push({ step: step.name, ok: false, error: error.message });
    } else {
      results.push({ step: step.name, ok: true });
    }
  }

  return NextResponse.json({ results }, { status: 200 });
}
