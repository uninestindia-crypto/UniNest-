// run-exam-migration.js
// Runs exam platform migration using Supabase's pg REST SQL function
// Uses the same service_role key the app uses
const https = require('https');

const SUPABASE_URL = 'dfkgefoqodjccrrqmqis.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRma2dlZm9xb2RqY2NycnFtcWlzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzM0ODEyNCwiZXhwIjoyMDcyOTI0MTI0fQ.mAGzTPmDluMelD5E7Qjzm_l0qF0N9rPXbmh6U-Ztk9Y';

// Individual statements - each run separately so errors are isolated
const STATEMENTS = [
  // 1. exam_banks table
  `CREATE TABLE IF NOT EXISTS exam_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('NEET','JEE','UPSC','CUET','CAT','GATE','CLAT','NDA','OTHER')),
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard','mixed')),
    duration_minutes INTEGER NOT NULL DEFAULT 60,
    total_marks INTEGER NOT NULL DEFAULT 0,
    negative_marking BOOLEAN DEFAULT false,
    negative_marks_per_wrong NUMERIC(4,2) DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    is_free BOOLEAN DEFAULT true,
    thumbnail_url TEXT,
    tags TEXT[] DEFAULT '{}',
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
  )`,

  // 2. exam_questions table
  `CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_id UUID NOT NULL REFERENCES exam_banks(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A','B','C','D')),
    explanation TEXT,
    marks INTEGER NOT NULL DEFAULT 4,
    subject_tag TEXT,
    topic_tag TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy','medium','hard')),
    is_shareable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
  )`,

  // 3. exam_attempts table
  `CREATE TABLE IF NOT EXISTS exam_attempts (
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

  // 4. exam_answers table
  `CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A','B','C','D')),
    is_correct BOOLEAN,
    is_skipped BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
  )`,

  // 5. Indexes
  `CREATE INDEX IF NOT EXISTS idx_exam_banks_type ON exam_banks(exam_type)`,
  `CREATE INDEX IF NOT EXISTS idx_exam_banks_published ON exam_banks(is_published)`,
  `CREATE INDEX IF NOT EXISTS idx_exam_questions_bank ON exam_questions(bank_id)`,
  `CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id)`,

  // 6. RLS
  `ALTER TABLE exam_banks ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY`,
  `ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY`,

  // 7. Policies (IF NOT EXISTS safe)
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_banks' AND policyname='Anyone can view published exams') THEN CREATE POLICY "Anyone can view published exams" ON exam_banks FOR SELECT USING (is_published = true); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_banks' AND policyname='Admins can manage all exam banks') THEN CREATE POLICY "Admins can manage all exam banks" ON exam_banks FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','staff'))); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_questions' AND policyname='Anyone can view questions of published exams') THEN CREATE POLICY "Anyone can view questions of published exams" ON exam_questions FOR SELECT USING (EXISTS (SELECT 1 FROM exam_banks WHERE exam_banks.id = exam_questions.bank_id AND exam_banks.is_published = true)); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_questions' AND policyname='Admins can manage all questions') THEN CREATE POLICY "Admins can manage all questions" ON exam_questions FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','staff'))); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can view own attempts') THEN CREATE POLICY "Users can view own attempts" ON exam_attempts FOR SELECT USING (auth.uid() = user_id); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can create own attempts') THEN CREATE POLICY "Users can create own attempts" ON exam_attempts FOR INSERT WITH CHECK (auth.uid() = user_id); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_attempts' AND policyname='Users can update own attempts') THEN CREATE POLICY "Users can update own attempts" ON exam_attempts FOR UPDATE USING (auth.uid() = user_id); END IF; END $$`,
  `DO $$ BEGIN IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename='exam_answers' AND policyname='Users can manage own answers') THEN CREATE POLICY "Users can manage own answers" ON exam_answers FOR ALL USING (EXISTS (SELECT 1 FROM exam_attempts WHERE exam_attempts.id = exam_answers.attempt_id AND exam_attempts.user_id = auth.uid())); END IF; END $$`,
];

function execSQL(sql) {
  return new Promise((resolve, reject) => {
    // Use the PostgREST /rpc endpoint with a helper function
    // Actually use the direct Postgres REST approach via fetch to /rest/v1/rpc/
    // The correct approach for raw SQL with service_role is the pg_meta endpoint:
    const path = `/pg/query`;
    const body = JSON.stringify({ query: sql });
    
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    // Use database REST via pg_dump approach - call the built-in execute function
    // Supabase exposes POST /rest/v1/ for table operations but not raw SQL
    // Use the pg_net or the correct meta API
    const pgOpts = {
      hostname: SUPABASE_URL,
      path: `/pg/query`,
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(pgOpts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// The correct Supabase internal endpoint for SQL
function execSQLCorrect(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: SUPABASE_URL,
      // This is the internal pg_meta REST endpoint exposed by Supabase
      path: `/pg/query`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Best approach: Use Supabase's internal API via the project subdomain
function execViaInternal(sql) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query: sql });
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/rpc/exec_sql`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Length': Buffer.byteLength(body),
      },
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => resolve({ status: res.statusCode, body: d }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// Use Supabase DB REST direct SQL – service role can call pg functions
// We create a helper SQL function first, then call it
async function runAll() {
  console.log('🚀 Exam Platform DB Migration\n');
  console.log('Using Supabase project:', SUPABASE_URL);
  console.log('Statements to run:', STATEMENTS.length);
  console.log('');

  // First, discover what endpoints are available
  const testRes = await execSQLCorrect('SELECT 1');
  console.log('Test endpoint /pg/query:', testRes.status, testRes.body.slice(0,200));

  let passed = 0, failed = 0;

  for (let i = 0; i < STATEMENTS.length; i++) {
    const sql = STATEMENTS[i];
    const preview = sql.replace(/\s+/g, ' ').trim().slice(0, 55);
    process.stdout.write(`[${i+1}/${STATEMENTS.length}] ${preview}... `);

    const res = await execSQLCorrect(sql);
    if (res.status >= 200 && res.status < 300) {
      console.log('✅');
      passed++;
    } else {
      const err = res.body.slice(0, 150);
      // Already exists is fine
      if (err.includes('already exists') || err.includes('duplicate')) {
        console.log('⏭️  (already exists)');
        passed++;
      } else {
        console.log(`❌ HTTP ${res.status}: ${err}`);
        failed++;
      }
    }
  }

  console.log(`\nResult: ${passed} ok, ${failed} failed`);
  if (failed === 0) console.log('✅ All tables and policies are ready!');
}

runAll().catch(err => {
  console.error('Fatal:', err.message);
});
