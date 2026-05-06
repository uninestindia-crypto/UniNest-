-- =============================================================================
-- Exam Platform Tables
-- NEET, JEE, UPSC and other competitive exam prep module
-- =============================================================================

-- Exam categories / banks
CREATE TABLE IF NOT EXISTS exam_banks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    exam_type TEXT NOT NULL CHECK (exam_type IN ('NEET', 'JEE', 'UPSC', 'CUET', 'CAT', 'GATE', 'CLAT', 'NDA', 'OTHER')),
    subject TEXT NOT NULL,
    difficulty TEXT NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard', 'mixed')),
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
);

-- Individual questions
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_id UUID NOT NULL REFERENCES exam_banks(id) ON DELETE CASCADE,
    question_number INTEGER NOT NULL,
    question_text TEXT NOT NULL,
    question_image_url TEXT,
    option_a TEXT NOT NULL,
    option_b TEXT NOT NULL,
    option_c TEXT NOT NULL,
    option_d TEXT NOT NULL,
    correct_option TEXT NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
    explanation TEXT,
    marks INTEGER NOT NULL DEFAULT 4,
    subject_tag TEXT,
    topic_tag TEXT,
    difficulty TEXT DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    is_shareable BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Student exam attempts
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    bank_id UUID NOT NULL REFERENCES exam_banks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    started_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    submitted_at TIMESTAMPTZ,
    time_taken_seconds INTEGER,
    status TEXT NOT NULL DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'abandoned')),
    score NUMERIC(6,2) DEFAULT 0,
    total_attempted INTEGER DEFAULT 0,
    correct_count INTEGER DEFAULT 0,
    wrong_count INTEGER DEFAULT 0,
    skipped_count INTEGER DEFAULT 0,
    percentage NUMERIC(5,2) DEFAULT 0
);

-- Per-question answers within an attempt
CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,
    selected_option TEXT CHECK (selected_option IN ('A', 'B', 'C', 'D')),
    is_correct BOOLEAN,
    is_skipped BOOLEAN DEFAULT false,
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_exam_banks_type ON exam_banks(exam_type);
CREATE INDEX IF NOT EXISTS idx_exam_banks_published ON exam_banks(is_published);
CREATE INDEX IF NOT EXISTS idx_exam_questions_bank ON exam_questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_number ON exam_questions(bank_id, question_number);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_bank ON exam_attempts(bank_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt ON exam_answers(attempt_id);

-- =============================================================================
-- Row Level Security
-- =============================================================================

ALTER TABLE exam_banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;

-- Exam banks: public can view published, admins can do all
CREATE POLICY "Anyone can view published exams"
    ON exam_banks FOR SELECT
    USING (is_published = true);

CREATE POLICY "Admins can manage all exam banks"
    ON exam_banks FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Questions: same pattern
CREATE POLICY "Anyone can view questions of published exams"
    ON exam_questions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM exam_banks
            WHERE exam_banks.id = exam_questions.bank_id
            AND exam_banks.is_published = true
        )
    );

CREATE POLICY "Admins can manage all questions"
    ON exam_questions FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );

-- Attempts: users manage their own
CREATE POLICY "Users can view own attempts"
    ON exam_attempts FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own attempts"
    ON exam_attempts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attempts"
    ON exam_attempts FOR UPDATE
    USING (auth.uid() = user_id);

-- Answers: users manage their own
CREATE POLICY "Users can manage own answers"
    ON exam_answers FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM exam_attempts
            WHERE exam_attempts.id = exam_answers.attempt_id
            AND exam_attempts.user_id = auth.uid()
        )
    );

-- Admins can read all attempts/answers for analytics
CREATE POLICY "Admins can view all attempts"
    ON exam_attempts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role IN ('admin', 'staff')
        )
    );
