import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

function ExamManager() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  
  // Views: 'list' | 'details'
  const [view, setView] = useState('list');
  const [activeExam, setActiveExam] = useState(null);
  
  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // Sub-tabs for Exam Details
  const [detailsTab, setDetailsTab] = useState('questions'); // 'questions', 'attendance', 'control'
  
  // Data for active exam
  const [questions, setQuestions] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]); // list of enrollment_ids marked present
  const [isAddQuestionModalOpen, setIsAddQuestionModalOpen] = useState(false);
  
  useEffect(() => {
    fetchExams();
    fetchSubjects();
  }, []);

  const fetchExams = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('exams').select('*').order('created_at', { ascending: false });
    if (error) {
      toast.error('Failed to fetch exams: ' + error.message);
    } else {
      setExams(data || []);
    }
    setLoading(false);
  };

  const fetchSubjects = async () => {
    const { data } = await supabase.from('subjects').select('*').eq('status', 'Active');
    if (data) setSubjects(data);
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const title = formData.get('title');
    const subject_code = formData.get('subject_code');
    const semester = parseInt(formData.get('semester'));
    const duration_minutes = parseInt(formData.get('duration_minutes'));
    
    if (!title || !subject_code || isNaN(semester) || isNaN(duration_minutes)) {
      toast.error('Please fill all fields correctly.');
      return;
    }

    const { error } = await supabase.from('exams').insert([{
      title, subject_code, semester, duration_minutes
    }]);

    if (error) {
      toast.error('Failed to create exam: ' + error.message);
    } else {
      toast.success('Exam created successfully!');
      setIsCreateModalOpen(false);
      fetchExams();
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam? All questions and submissions will be lost.")) return;
    const { error } = await supabase.from('exams').delete().eq('id', id);
    if (error) toast.error("Error: " + error.message);
    else fetchExams();
  };

  // ---- Exam Details Functions ----
  
  const openExamDetails = (exam) => {
    setActiveExam(exam);
    setView('details');
    setDetailsTab('questions');
    fetchQuestions(exam.id);
  };

  const fetchQuestions = async (examId) => {
    const { data, error } = await supabase.from('exam_questions').select('*').eq('exam_id', examId).order('created_at', { ascending: true });
    if (error) toast.error("Error fetching questions: " + error.message);
    else setQuestions(data || []);
  };

  const fetchAttendanceData = async (examId, semester, subjectCode) => {
    // Get all approved students
    const { data: appsData, error: appsError } = await supabase
      .from('applications')
      .select('enrollment_id, full_name, subject_code')
      .eq('status', 'Approved');
      
    if (appsError) {
      toast.error("Error fetching students: " + appsError.message);
      return;
    }

    // Filter students by semester - since semester isn't on applications, we rely on subject_code matching if it's a major subject
    // In a real app we'd map this properly, but for this demo, we'll just show all approved students and maybe filter by subject_code if it matches.
    const relevantStudents = appsData; // We can show all and let admin check who they want
    setStudents(relevantStudents || []);

    // Get attendance records
    const { data: attData, error: attError } = await supabase
      .from('exam_attendance')
      .select('*')
      .eq('exam_id', examId);
      
    if (!attError && attData) {
      setAttendance(attData.filter(a => a.is_present).map(a => a.enrollment_id));
    }
  };

  // Called when tab changes to Attendance
  useEffect(() => {
    if (view === 'details' && detailsTab === 'attendance' && activeExam) {
      fetchAttendanceData(activeExam.id, activeExam.semester, activeExam.subject_code);
    }
  }, [detailsTab, view, activeExam]);

  const handleToggleAttendance = async (enrollment_id) => {
    const isPresent = attendance.includes(enrollment_id);
    
    if (isPresent) {
      // Remove
      const { error } = await supabase.from('exam_attendance').delete().match({ exam_id: activeExam.id, enrollment_id });
      if (!error) setAttendance(attendance.filter(id => id !== enrollment_id));
    } else {
      // Add
      const { error } = await supabase.from('exam_attendance').insert([{ exam_id: activeExam.id, enrollment_id, is_present: true }]);
      if (!error) setAttendance([...attendance, enrollment_id]);
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const type = formData.get('question_type');
    const text = formData.get('question_text');
    const marks = parseInt(formData.get('marks'));
    
    let options = null;
    let correct_answer = formData.get('correct_answer');

    if (type === 'mcq') {
      const optA = formData.get('optA');
      const optB = formData.get('optB');
      const optC = formData.get('optC');
      const optD = formData.get('optD');
      options = [optA, optB, optC, optD].filter(Boolean);
      
      const correctIdx = parseInt(formData.get('correct_mcq_idx'));
      if (!isNaN(correctIdx) && options[correctIdx]) {
        correct_answer = options[correctIdx];
      } else {
        toast.error("Please select a valid correct option.");
        return;
      }
    }

    const { error } = await supabase.from('exam_questions').insert([{
      exam_id: activeExam.id,
      question_type: type,
      question_text: text,
      options,
      correct_answer,
      marks
    }]);

    if (error) {
      toast.error('Error adding question: ' + error.message);
    } else {
      toast.success('Question added.');
      setIsAddQuestionModalOpen(false);
      fetchQuestions(activeExam.id);
    }
  };

  const handleDeleteQuestion = async (id) => {
    const { error } = await supabase.from('exam_questions').delete().eq('id', id);
    if (!error) fetchQuestions(activeExam.id);
  };

  const handleStartExam = async () => {
    if (!window.confirm("Are you sure you want to start this exam? Students will be able to begin immediately.")) return;
    
    const { error } = await supabase.from('exams').update({ 
      is_active: true, 
      start_time: new Date().toISOString() 
    }).eq('id', activeExam.id);
    
    if (error) {
      toast.error("Failed to start: " + error.message);
    } else {
      toast.success("Exam Started!");
      setActiveExam({ ...activeExam, is_active: true, start_time: new Date().toISOString() });
      fetchExams();
    }
  };

  const handleEndExam = async () => {
    if (!window.confirm("Are you sure you want to end this exam? This will lock all students out.")) return;
    
    const { error } = await supabase.from('exams').update({ 
      is_active: false 
    }).eq('id', activeExam.id);
    
    if (error) {
      toast.error("Failed to end: " + error.message);
    } else {
      toast.success("Exam Ended.");
      setActiveExam({ ...activeExam, is_active: false });
      fetchExams();
    }
  };

  if (view === 'details' && activeExam) {
    return (
      <div className="flex flex-col gap-xl animate-in fade-in duration-300">
        <header className="flex justify-between items-end border-b border-outline-variant pb-sm">
          <div>
            <button onClick={() => setView('list')} className="text-secondary hover:underline text-sm mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">arrow_back</span> Back to Exams
            </button>
            <h2 className="font-headline-lg text-headline-lg text-primary">{activeExam.title}</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              {activeExam.subject_code} | Sem: {activeExam.semester} | {activeExam.duration_minutes} mins
            </p>
          </div>
          <div>
             <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${activeExam.is_active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {activeExam.is_active ? '● LIVE' : 'INACTIVE'}
             </span>
          </div>
        </header>

        <div className="flex border-b border-outline-variant gap-4">
          <button onClick={() => setDetailsTab('questions')} className={`pb-2 px-2 font-label-md transition-colors ${detailsTab === 'questions' ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant'}`}>Questions</button>
          <button onClick={() => setDetailsTab('attendance')} className={`pb-2 px-2 font-label-md transition-colors ${detailsTab === 'attendance' ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant'}`}>Attendance</button>
          <button onClick={() => setDetailsTab('control')} className={`pb-2 px-2 font-label-md transition-colors ${detailsTab === 'control' ? 'border-b-2 border-secondary text-secondary' : 'text-on-surface-variant'}`}>Exam Control</button>
        </div>

        {detailsTab === 'questions' && (
          <div className="flex flex-col gap-4">
            <div className="flex justify-end">
              <button onClick={() => setIsAddQuestionModalOpen(true)} className="bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:opacity-90">
                + Add Question
              </button>
            </div>
            
            <div className="grid gap-4">
              {questions.map((q, i) => (
                <div key={q.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                  <div className="flex justify-between items-start">
                    <h4 className="font-bold text-primary">Q{i + 1}. {q.question_text}</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-xs bg-surface-container font-bold px-2 py-1 rounded">{q.marks} Marks</span>
                      <button onClick={() => handleDeleteQuestion(q.id)} className="text-error hover:opacity-80"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                    </div>
                  </div>
                  {q.question_type === 'mcq' && (
                    <div className="mt-3 pl-4 border-l-2 border-surface-container-high grid grid-cols-2 gap-2 text-sm text-on-surface-variant">
                      {q.options.map((opt, idx) => (
                        <div key={idx} className={`${opt === q.correct_answer ? 'text-secondary font-bold' : ''}`}>
                          {String.fromCharCode(65 + idx)}) {opt} {opt === q.correct_answer && '✓'}
                        </div>
                      ))}
                    </div>
                  )}
                  {q.question_type === 'fill_in_blank' && (
                    <div className="mt-3 pl-4 border-l-2 border-surface-container-high text-sm text-secondary font-bold">
                      Answer: {q.correct_answer}
                    </div>
                  )}
                </div>
              ))}
              {questions.length === 0 && <div className="text-center text-on-surface-variant p-8">No questions added yet.</div>}
            </div>
          </div>
        )}

        {detailsTab === 'attendance' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="px-md py-sm bg-surface border-b border-outline-variant">
              <h3 className="font-headline-sm text-primary">Mark Eligible Students</h3>
              <p className="text-xs text-on-surface-variant">Only checked students can access this exam.</p>
            </div>
            <div className="max-h-[600px] overflow-y-auto">
              <table className="w-full text-left">
                <thead className="bg-surface-container-low border-b border-outline-variant text-sm text-on-surface-variant">
                  <tr>
                    <th className="px-4 py-2 w-16">Present</th>
                    <th className="px-4 py-2">Enrollment ID</th>
                    <th className="px-4 py-2">Name</th>
                    <th className="px-4 py-2">Subject</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {students.map(s => (
                    <tr key={s.enrollment_id} className="hover:bg-surface-container-highest cursor-pointer" onClick={() => handleToggleAttendance(s.enrollment_id)}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={attendance.includes(s.enrollment_id)} readOnly className="w-4 h-4 rounded text-secondary focus:ring-secondary cursor-pointer" />
                      </td>
                      <td className="px-4 py-3 font-code-sm">{s.enrollment_id}</td>
                      <td className="px-4 py-3 font-medium">{s.full_name}</td>
                      <td className="px-4 py-3">{s.subject_code}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {detailsTab === 'control' && (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-xl shadow-sm text-center">
            <h3 className="font-headline-md text-primary mb-4">Exam Execution Control</h3>
            <p className="text-on-surface-variant max-w-md mx-auto mb-8">
              Starting the exam will immediately allow present students to see questions and start their timers. Ending the exam will force-submit all active sessions.
            </p>
            
            <div className="flex justify-center gap-8">
              <button 
                onClick={handleStartExam} 
                disabled={activeExam.is_active}
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center bg-secondary text-on-secondary shadow-lg hover:bg-secondary-container hover:text-on-secondary-container transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[48px] mb-2">play_circle</span>
                <span className="font-bold text-lg">START EXAM</span>
              </button>
              
              <button 
                onClick={handleEndExam} 
                disabled={!activeExam.is_active}
                className="w-48 h-48 rounded-full flex flex-col items-center justify-center bg-error-container text-on-error-container shadow-lg hover:bg-error hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-[48px] mb-2">stop_circle</span>
                <span className="font-bold text-lg">END EXAM</span>
              </button>
            </div>
          </div>
        )}

        {/* Add Question Modal */}
        {isAddQuestionModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-level-3 w-full max-w-lg">
              <h2 className="font-headline-md text-primary mb-6">Add Question</h2>
              <form onSubmit={handleAddQuestion} className="flex flex-col gap-4">
                
                <div>
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Question Type</label>
                  <select name="question_type" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required
                    onChange={(e) => {
                      const mcqOpts = document.getElementById('mcq-options');
                      const fibOpts = document.getElementById('fib-options');
                      if(e.target.value === 'mcq') {
                        mcqOpts.style.display = 'block';
                        fibOpts.style.display = 'none';
                      } else {
                        mcqOpts.style.display = 'none';
                        fibOpts.style.display = 'block';
                      }
                    }}
                  >
                    <option value="mcq">Multiple Choice (MCQ)</option>
                    <option value="fill_in_blank">Fill in the Blank</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Question Text</label>
                  <textarea name="question_text" rows="3" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required></textarea>
                </div>

                <div>
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Marks</label>
                  <input name="marks" type="number" defaultValue="1" min="1" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
                </div>

                <div id="mcq-options">
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Options</label>
                  <div className="grid gap-2">
                    <input name="optA" placeholder="Option A" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
                    <input name="optB" placeholder="Option B" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
                    <input name="optC" placeholder="Option C" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
                    <input name="optD" placeholder="Option D" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
                  </div>
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block mt-3">Correct Option (0=A, 1=B, 2=C, 3=D)</label>
                  <select name="correct_mcq_idx" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none">
                    <option value="0">Option A</option>
                    <option value="1">Option B</option>
                    <option value="2">Option C</option>
                    <option value="3">Option D</option>
                  </select>
                </div>

                <div id="fib-options" style={{display: 'none'}}>
                  <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Exact Correct Answer</label>
                  <input name="correct_answer" placeholder="e.g. O(n log n)" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <button type="button" onClick={() => setIsAddQuestionModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  // LIST VIEW
  return (
    <div className="flex flex-col gap-xl animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Exam Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Create and monitor examinations.</p>
        </div>
        <div>
          <button onClick={() => setIsCreateModalOpen(true)} className="bg-primary text-on-primary font-label-md px-4 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">add</span> New Exam
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <p>Loading exams...</p>}
        {!loading && exams.length === 0 && <p className="col-span-full text-center text-on-surface-variant p-8">No exams created yet.</p>}
        {exams.map(exam => (
          <div key={exam.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm flex flex-col group hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-2">
              <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${exam.is_active ? 'bg-secondary-container text-on-secondary-container' : 'bg-surface-container-high text-on-surface-variant'}`}>
                {exam.is_active ? 'ACTIVE' : 'DRAFT'}
              </span>
              <button onClick={() => handleDeleteExam(exam.id)} className="text-outline-variant hover:text-error opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="material-symbols-outlined text-[18px]">delete</span>
              </button>
            </div>
            <h3 className="font-headline-sm text-primary mb-1 truncate" title={exam.title}>{exam.title}</h3>
            <p className="font-body-sm text-on-surface-variant mb-4">{exam.subject_code} | Sem {exam.semester} | {exam.duration_minutes} mins</p>
            <div className="mt-auto">
              <button onClick={() => openExamDetails(exam)} className="w-full bg-surface-container-high text-on-surface font-label-md py-2 rounded-lg hover:bg-surface-container-highest transition-colors">
                Manage Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-level-3 w-full max-w-md">
            <h2 className="font-headline-md text-primary mb-6">Create New Exam</h2>
            <form onSubmit={handleCreateExam} className="flex flex-col gap-4">
              <div>
                <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Title</label>
                <input name="title" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="e.g. Midterm Examination" required />
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Subject Code</label>
                <select name="subject_code" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required>
                  {subjects.map(s => <option key={s.id} value={s.code}>{s.code} - {s.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Semester</label>
                <select name="semester" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs uppercase tracking-wide text-on-surface-variant mb-1 block">Duration (Minutes)</label>
                <input name="duration_minutes" type="number" min="1" defaultValue="60" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-4 py-2 text-on-surface-variant hover:bg-surface-container rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default ExamManager;
