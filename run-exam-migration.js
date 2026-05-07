import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://dfkgefoqodjccrrqmqis.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y'
);

async function main() {
  console.log('Creating missing exam tables via Supabase rpc...\n');

  // Use rpc to call postgres functions
  // First check if tables exist
  const tables = ['exam_attempts', 'exam_answers'];
  for (const t of tables) {
    const { data, error } = await supabase.from(t).select('id').limit(0);
    if (error) {
      console.log(`❌ ${t} missing — need to create`);
    } else {
      console.log(`✅ ${t} already exists`);
    }
  }

  // Try creating via rpc exec_sql (only works if function was created before)
  const sql = `
    CREATE TABLE IF NOT EXISTS exam_attempts (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      bank_id UUID NOT NULL REFERENCES exam_banks(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
      submitted_at TIMESTAMPTZ,
      time_taken_seconds INTEGER,
      status TEXT NOT NULL DEFAULT 'in_progress',
      score NUMERIC(6,2) DEFAULT 0,
      total_attempted INTEGER DEFAULT 0,
      correct_count INTEGER DEFAULT 0,
      wrong_count INTEGER DEFAULT 0,
      skipped_count INTEGER DEFAULT 0,
      percentage NUMERIC(5,2) DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS exam_answers (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
      question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
      selected_option TEXT,
      is_correct BOOLEAN,
      is_skipped BOOLEAN DEFAULT false,
      time_spent_seconds INTEGER DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql });
  if (error) {
    console.log('rpc exec_sql not available:', error.message);
    console.log('\n📋 MANUAL ACTION REQUIRED:');
    console.log('Go to: https://supabase.com/dashboard/project/dfkgefoqodjccrrqmqis/sql/new');
    console.log('Run this SQL:\n');
    console.log(sql);
  } else {
    console.log('✅ Tables created!', data);
  }
}

main().catch(console.error);
