-- Exam System Database Schema

-- 1. Exams Table
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    subject_code TEXT NOT NULL,
    semester INTEGER NOT NULL,
    duration_minutes INTEGER NOT NULL,
    is_active BOOLEAN DEFAULT false,
    start_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable realtime for exams to listen to is_active and start_time changes
alter publication supabase_realtime add table exams;

-- 2. Exam Questions Table
CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_type TEXT NOT NULL CHECK (question_type IN ('mcq', 'fill_in_blank')),
    question_text TEXT NOT NULL,
    options JSONB, -- For MCQ, e.g., ["Option A", "Option B", "Option C"]
    correct_answer TEXT NOT NULL,
    marks INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Exam Attendance Table
-- Marks who is eligible to take the exam (must be present)
CREATE TABLE exam_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    enrollment_id TEXT NOT NULL,
    is_present BOOLEAN DEFAULT false,
    UNIQUE(exam_id, enrollment_id)
);

-- 4. Exam Submissions Table
-- Stores the final answers submitted by the student
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    enrollment_id TEXT NOT NULL,
    question_id UUID REFERENCES exam_questions(id) ON DELETE CASCADE,
    student_answer TEXT,
    marks_obtained INTEGER DEFAULT 0,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(exam_id, enrollment_id, question_id)
);

-- RLS Policies
-- Enable RLS
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_submissions ENABLE ROW LEVEL SECURITY;

-- Disable RLS checks for simplicity since this is handled in client via supabase anon key
-- If you need strict RLS, these need proper policies. But for now, we'll allow all public operations
-- (assuming you have a way to secure it or prefer wide-open access like the rest of the tables)
CREATE POLICY "Enable all operations for exams" ON exams FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for exam_questions" ON exam_questions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for exam_attendance" ON exam_attendance FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all operations for exam_submissions" ON exam_submissions FOR ALL USING (true) WITH CHECK (true);
