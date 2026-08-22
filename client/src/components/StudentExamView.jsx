import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

function StudentExamView({ applications }) {
  const enrollmentId = applications[0]?.enrollment_id;
  const [loading, setLoading] = useState(true);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [examState, setExamState] = useState('checking'); // 'checking', 'waiting', 'active', 'submitted', 'locked'
  const [warnings, setWarnings] = useState(0);
  const [timeLeft, setTimeLeft] = useState(null);
  const [needsFullscreen, setNeedsFullscreen] = useState(false);
  
  const MAX_WARNINGS = 3;
  const timerRef = useRef(null);
  const examContainerRef = useRef(null);
  
  // Keep track of the latest submit function for closures (setInterval, event listeners)
  const submitRef = useRef();

  // Shuffle array utility
  const shuffleArray = (array) => {
    let newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  useEffect(() => {
    if (enrollmentId) {
      checkEligibility();
    }
  }, [enrollmentId]);

  const checkEligibility = async () => {
    setLoading(true);
    // Find if the student is marked present for any exam
    const { data: attendanceData, error: attError } = await supabase
      .from('exam_attendance')
      .select('exam_id')
      .eq('enrollment_id', enrollmentId)
      .eq('is_present', true);

    if (attError || !attendanceData || attendanceData.length === 0) {
      setExam(null);
      setExamState('checking'); // Nothing to do
      setLoading(false);
      return;
    }

    // Assume they can only have 1 active exam at a time. Let's get the first one.
    const examId = attendanceData[0].exam_id;
    
    // Check if they already submitted
    const { data: subData } = await supabase
      .from('exam_submissions')
      .select('id')
      .eq('exam_id', examId)
      .eq('enrollment_id', enrollmentId)
      .limit(1);
      
    if (subData && subData.length > 0) {
      setExamState('submitted');
      setLoading(false);
      return;
    }

    // Fetch Exam details
    const { data: examData, error: examError } = await supabase
      .from('exams')
      .select('*')
      .eq('id', examId)
      .single();

    if (examError || !examData) {
      setLoading(false);
      return;
    }

    setExam(examData);
    
    if (examData.is_active) {
      setExamState('active');
      fetchQuestions(examId);
      startTimer(examData.start_time, examData.duration_minutes);
    } else {
      setExamState('waiting');
    }
    setLoading(false);
  };

  // Listen to realtime changes on exams table
  useEffect(() => {
    if (!exam) return;

    const channel = supabase
      .channel('public:exams')
      .on('postgres_changes', { 
        event: 'UPDATE', 
        schema: 'public', 
        table: 'exams', 
        filter: `id=eq.${exam.id}` 
      }, (payload) => {
        const updatedExam = payload.new;
        setExam(updatedExam);
        
        if (updatedExam.is_active && examState === 'waiting') {
          setExamState('active');
          fetchQuestions(updatedExam.id);
          startTimer(updatedExam.start_time, updatedExam.duration_minutes);
        } else if (!updatedExam.is_active && examState === 'active') {
          // Exam ended by admin
          handleSubmitExam(true);
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [exam, examState]);

  const fetchQuestions = async (examId) => {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('id, question_type, question_text, options, marks') // DO NOT select correct_answer!
      .eq('exam_id', examId);
      
    if (!error && data) {
      // Randomize questions
      setQuestions(shuffleArray(data));
    }
  };

  const startTimer = (startTimeIso, durationMins) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    const startTime = new Date(startTimeIso).getTime();
    const endTime = startTime + (durationMins * 60 * 1000);
    
    timerRef.current = setInterval(() => {
      const now = new Date().getTime();
      const distance = endTime - now;
      
      if (distance <= 0) {
        clearInterval(timerRef.current);
        setTimeLeft('00:00');
        if (submitRef.current) submitRef.current(true);
      } else {
        const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const s = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
      }
    }, 1000);
  };

  // Anti-cheat measures
  useEffect(() => {
    if (examState !== 'active') return;
    
    // Request fullscreen
    const enterFullscreen = () => {
      if (examContainerRef.current && !document.fullscreenElement) {
        examContainerRef.current.requestFullscreen().catch(err => {
          console.warn("Fullscreen request failed:", err);
        });
      }
    };
    
    // Trigger on next user interaction (often required by browsers)
    document.addEventListener('click', enterFullscreen, { once: true });

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarnings(prev => {
          const newWarnings = prev + 1;
          if (newWarnings >= MAX_WARNINGS) {
            toast.error("Maximum warnings exceeded. Exam auto-submitted.");
            if (submitRef.current) submitRef.current(true);
          } else {
            toast.error(`WARNING: You switched tabs! (${newWarnings}/${MAX_WARNINGS})`);
          }
          return newWarnings;
        });
      }
    };
    
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setNeedsFullscreen(true);
      } else {
        setNeedsFullscreen(false);
      }
    };

    const handleContextMenu = (e) => e.preventDefault();
    const handleCopy = (e) => e.preventDefault();
    const handlePaste = (e) => e.preventDefault();

    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('paste', handlePaste);

    return () => {
      document.removeEventListener('click', enterFullscreen);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('paste', handlePaste);
    };
  }, [examState]);

  const handleAnswerChange = (qId, val) => {
    setAnswers(prev => ({ ...prev, [qId]: val }));
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    if (!exam) return;
    if (!isAutoSubmit && !window.confirm("Are you sure you want to submit your exam? You cannot change answers after submitting.")) return;
    
    if (timerRef.current) clearInterval(timerRef.current);
    
    // We need to fetch the correct answers securely from the server side, but since we're doing it entirely client side with RLS open,
    // we'll fetch them now to grade. In a real highly secure app, grading should be an Edge Function.
    const { data: correctData } = await supabase
      .from('exam_questions')
      .select('id, correct_answer, marks')
      .eq('exam_id', exam.id);
      
    let submissions = [];
    
    questions.forEach(q => {
      const studentAns = answers[q.id] || '';
      const correctAns = correctData?.find(c => c.id === q.id)?.correct_answer || '';
      const marksToAward = (studentAns.toLowerCase().trim() === correctAns.toLowerCase().trim()) ? q.marks : 0;
      
      submissions.push({
        exam_id: exam.id,
        enrollment_id: enrollmentId,
        question_id: q.id,
        student_answer: studentAns,
        marks_obtained: marksToAward
      });
    });

    if (submissions.length > 0) {
      const { error } = await supabase.from('exam_submissions').insert(submissions);
      if (error) {
        toast.error("Error submitting exam. Please contact admin. " + error.message);
        return;
      }
    }
    
    // Exit fullscreen
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(()=>{});
    }

    setExamState(isAutoSubmit && warnings >= MAX_WARNINGS ? 'locked' : 'submitted');
  };

  useEffect(() => {
    submitRef.current = handleSubmitExam;
  });

  if (loading) {
    return <div className="p-8 text-on-surface-variant">Checking exam eligibility...</div>;
  }

  if (examState === 'checking' || !exam) {
    return (
      <div className="flex flex-col items-center justify-center p-xl h-full animate-in fade-in">
        <div className="w-24 h-24 bg-surface-container rounded-full flex items-center justify-center mb-md">
          <span className="material-symbols-outlined text-[48px] text-outline">event_busy</span>
        </div>
        <h2 className="font-headline-md text-primary mb-2">No Active Exams</h2>
        <p className="text-on-surface-variant">You are not currently marked present for any active exams.</p>
      </div>
    );
  }

  if (examState === 'waiting') {
    return (
      <div className="flex flex-col items-center justify-center p-xl h-full animate-in fade-in">
        <div className="w-32 h-32 bg-secondary-container rounded-full flex items-center justify-center mb-md shadow-lg animate-pulse">
          <span className="material-symbols-outlined text-[64px] text-secondary">hourglass_empty</span>
        </div>
        <h2 className="font-headline-lg text-primary mb-2">{exam.title}</h2>
        <p className="text-on-surface-variant text-lg text-center max-w-md">
          You are marked present. Please wait in this lobby. The exam will start automatically when the administrator begins the session.
        </p>
      </div>
    );
  }

  if (examState === 'submitted' || examState === 'locked') {
    return (
      <div className="flex flex-col items-center justify-center p-xl h-full animate-in zoom-in-95">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mb-md ${examState === 'locked' ? 'bg-error-container text-on-error-container' : 'bg-primary-container text-on-primary-container'}`}>
          <span className="material-symbols-outlined text-[48px]">{examState === 'locked' ? 'gavel' : 'task_alt'}</span>
        </div>
        <h2 className="font-headline-md text-primary mb-2">
          {examState === 'locked' ? 'Exam Locked due to Violations' : 'Exam Submitted Successfully'}
        </h2>
        <p className="text-on-surface-variant">
          {examState === 'locked' ? 'You exceeded the maximum allowed warnings for tab switching or exiting fullscreen.' : 'Your answers have been recorded. You may now close this window.'}
        </p>
      </div>
    );
  }

  // Active Exam View
  return (
    <div ref={examContainerRef} className="flex flex-col h-screen bg-background text-on-surface font-body-md relative overflow-y-auto p-4 md:p-8">
      
      {/* Fullscreen Enforcer Overlay */}
      {needsFullscreen && (
        <div className="absolute inset-0 z-[9999] bg-surface-container-highest flex flex-col items-center justify-center p-8 text-center animate-in fade-in">
          <span className="material-symbols-outlined text-[64px] text-error mb-4">fullscreen_exit</span>
          <h2 className="font-headline-lg text-primary mb-2">Fullscreen Required</h2>
          <p className="text-on-surface-variant max-w-md mb-8">
            You have exited fullscreen mode. For security reasons, this exam must be taken in fullscreen. 
            Please return to fullscreen to continue your exam.
          </p>
          <button 
            onClick={() => {
              if (examContainerRef.current) {
                examContainerRef.current.requestFullscreen().catch(() => {});
              }
            }} 
            className="bg-primary text-on-primary font-bold px-8 py-3 rounded-lg shadow-lg hover:opacity-90 transition-opacity"
          >
            Return to Fullscreen
          </button>
        </div>
      )}

      <div className="sticky top-0 z-50 bg-surface-container-lowest border border-outline-variant shadow-md rounded-xl p-4 flex justify-between items-center mb-8">
        <div>
          <h2 className="font-headline-sm text-primary font-bold">{exam.title}</h2>
          <div className="text-xs text-on-surface-variant flex gap-4 mt-1">
            <span>Subject: {exam.subject_code}</span>
            <span>Enrollment ID: {enrollmentId}</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-widest">Time Remaining</span>
            <span className={`font-code-lg text-2xl font-black ${timeLeft && timeLeft.startsWith('00') ? 'text-error animate-pulse' : 'text-primary'}`}>
              {timeLeft || '--:--'}
            </span>
          </div>
          <button onClick={() => handleSubmitExam(false)} className="bg-primary text-on-primary font-label-md px-6 py-2 rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            Submit Exam
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 pb-20">
        {questions.map((q, i) => (
          <div key={q.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 shadow-sm select-none">
            <div className="flex justify-between items-start mb-4">
              <h3 className="font-headline-sm text-on-surface">
                <span className="text-secondary mr-2">{i + 1}.</span>
                {q.question_text}
              </h3>
              <span className="text-xs bg-surface-container text-on-surface-variant px-2 py-1 rounded font-bold whitespace-nowrap">
                {q.marks} Marks
              </span>
            </div>
            
            {q.question_type === 'mcq' && q.options && (
              <div className="flex flex-col gap-3 ml-6 mt-4">
                {q.options.map((opt, idx) => (
                  <label key={idx} className="flex items-center gap-3 cursor-pointer group">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${answers[q.id] === opt ? 'border-secondary bg-secondary/10' : 'border-outline-variant group-hover:border-secondary'}`}>
                      {answers[q.id] === opt && <div className="w-2.5 h-2.5 bg-secondary rounded-full"></div>}
                    </div>
                    <input 
                      type="radio" 
                      name={q.id} 
                      value={opt} 
                      checked={answers[q.id] === opt} 
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className="hidden"
                    />
                    <span className={`text-body-md transition-colors ${answers[q.id] === opt ? 'text-on-surface font-medium' : 'text-on-surface-variant'}`}>
                      {opt}
                    </span>
                  </label>
                ))}
              </div>
            )}

            {q.question_type === 'fill_in_blank' && (
              <div className="ml-6 mt-4">
                <input 
                  type="text" 
                  value={answers[q.id] || ''} 
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full max-w-md bg-surface-container border-b-2 border-outline-variant px-4 py-2 focus:border-secondary focus:outline-none transition-colors text-on-surface"
                />
              </div>
            )}
          </div>
        ))}
        {questions.length === 0 && (
          <div className="text-center p-8 text-on-surface-variant">
            No questions found for this exam.
          </div>
        )}
      </div>
      
      {/* Warnings overlay */}
      {warnings > 0 && (
        <div className="fixed bottom-4 left-4 bg-error-container text-on-error-container px-4 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 animate-in slide-in-from-bottom-4 z-[100]">
          <span className="material-symbols-outlined">warning</span>
          Warnings: {warnings}/{MAX_WARNINGS}
        </div>
      )}
    </div>
  );
}

export default StudentExamView;
