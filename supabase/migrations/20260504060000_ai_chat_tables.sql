-- =============================================================================
-- AI Chat Sessions & Messages Tables
-- Required by: UniNestChat.tsx, GroqAssistant.tsx (handover)
-- =============================================================================

-- Sessions table: stores chat conversation sessions per user
CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'New Chat',
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Messages table: stores individual messages within a session
CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    session_id UUID NOT NULL REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    tool_calls JSONB DEFAULT NULL,
    ui_actions JSONB DEFAULT NULL,
    created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_user_id ON ai_chat_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_sessions_updated_at ON ai_chat_sessions(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session_id ON ai_chat_messages(session_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_created_at ON ai_chat_messages(created_at ASC);

-- =============================================================================
-- Row Level Security (RLS)
-- Users can only access their own sessions and messages
-- =============================================================================

ALTER TABLE ai_chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_chat_messages ENABLE ROW LEVEL SECURITY;

-- Sessions: Users can CRUD their own sessions
CREATE POLICY "Users can view own sessions"
    ON ai_chat_sessions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own sessions"
    ON ai_chat_sessions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own sessions"
    ON ai_chat_sessions FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own sessions"
    ON ai_chat_sessions FOR DELETE
    USING (auth.uid() = user_id);

-- Messages: Users can CRUD their own messages
CREATE POLICY "Users can view own messages"
    ON ai_chat_messages FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create own messages"
    ON ai_chat_messages FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own messages"
    ON ai_chat_messages FOR DELETE
    USING (auth.uid() = user_id);
