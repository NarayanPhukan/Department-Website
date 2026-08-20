import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { toast } from 'react-hot-toast';

function Apply() {
  const [subjects, setSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const [enrollmentInput, setEnrollmentInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [subjectCode, setSubjectCode] = useState('');
  const [subjectCredit, setSubjectCredit] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedProgram, setSelectedProgram] = useState('');

  useEffect(() => {
    const fetchSubjects = async () => {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('status', 'Active');
      
      if (!error && data) {
        setSubjects(data);
      }
    };
    fetchSubjects();
  }, []);

  const handleCheckEnrollment = async () => {
    if (!enrollmentInput) return;
    setIsChecking(true);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('enrollment_id', enrollmentInput)
      .maybeSingle(); // maybeSingle returns null without throwing if not found
    
    if (data && !error) {
      setExistingData(data);
      setSubjectCode(data.subject_code || '');
      setSelectedSemester(data.current_semester || '');
      setSelectedProgram(data.current_program || '');
      const sub = subjects.find(s => s.id == data.subject_id);
      if (sub) setSubjectCredit(sub.credits || '');
      toast.success('Existing application found and loaded. You can now update your details.');
    } else {
      setExistingData(null);
      setSubjectCode('');
      setSubjectCredit('');
      setSelectedSemester('');
      setSelectedProgram('');
      toast('No existing application found. Please proceed with a new entry.', { icon: 'ℹ️' });
    }
    setIsChecking(false);
  };

  const handleSubjectChange = (e) => {
    const selectedId = e.target.value;
    const sub = subjects.find(s => s.id == selectedId);
    if (sub) {
      setSubjectCode(sub.code);
      setSubjectCredit(sub.credits || '');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const formData = new FormData(e.target);
    
    let marksheet_url = existingData?.marksheet_url || null;
    const marksheetFile = formData.get('marksheet');
    if (marksheetFile && marksheetFile.size > 0) {
      if (marksheetFile.size > 5 * 1024 * 1024) {
        toast.error("Marksheet file is too large! Please keep it under 5MB.");
        setIsSubmitting(false);
        return;
      }
      try {
        marksheet_url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(marksheetFile);
        });
      } catch (err) {
        toast.error("Failed to read marksheet file: " + err.message);
        setIsSubmitting(false);
        return;
      }
    }

    const applicationData = {
      full_name: formData.get('fullName'),
      enrollment_id: formData.get('enrollmentID'),
      phone_num: formData.get('phoneNum'),
      email: formData.get('email'),
      current_program: formData.get('currentProgram'),
      current_semester: formData.get('currentSemester'),
      current_major: formData.get('currentMajor'),
      current_gpa: formData.get('currentGPA') ? parseFloat(formData.get('currentGPA')) : null,
      subject_id: formData.get('selectSubject') || null,
      subject_code: formData.get('subjectCode'),
      prerequisites_completed: formData.get('prerequisitesCompleted'),
      prerequisites_grades: formData.get('prerequisitesGrades'),
      marksheet_url: marksheet_url
    };

    let error;
    if (existingData) {
      const res = await supabase.from('applications').update(applicationData).eq('id', existingData.id);
      error = res.error;
    } else {
      const res = await supabase.from('applications').insert([applicationData]);
      error = res.error;
    }

    if (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } else {
      setSubmitSuccess(true);
      e.target.reset();
      setExistingData(null);
      setEnrollmentInput('');
      setSubjectCode('');
      setSubjectCredit('');
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-surface dark:bg-inverse-surface font-sans">
      <TopNavBar />

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-8 bg-[#f8f9fa] dark:bg-[#121212]" style={{ backgroundImage: 'radial-gradient(#e5e7eb 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
        <div className="bg-white dark:bg-surface-dim border border-gray-200 dark:border-gray-700 w-full max-w-4xl shadow-sm rounded-md overflow-hidden">

          {/* Header */}
          <div className="bg-[#f0f2f5] dark:bg-surface-container-high px-8 py-6 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">Apply for Subject</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Please fill out the details below to submit your application for the selected course.
            </p>
          </div>

          {/* Form */}
          {submitSuccess ? (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-[#dcfce7] text-[#166534] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-3xl">check</span>
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">Application Submitted!</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your application has been received and is pending review.</p>
              <button 
                onClick={() => setSubmitSuccess(false)}
                className="font-mono text-sm border border-black bg-black text-white hover:bg-gray-800 px-6 py-2 transition-colors dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200"
              >
                Submit Another
              </button>
            </div>
          ) : (
          <div key={existingData ? existingData.id : 'new'} className="p-8">
            <form onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded text-sm font-medium">
                {submitError}
              </div>
            )}
            
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                Check Existing Application by Enrollment ID
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={enrollmentInput}
                  onChange={(e) => setEnrollmentInput(e.target.value)}
                  placeholder="e.g. CS-2024-001"
                  className="flex-grow border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
                <button 
                  type="button" 
                  onClick={handleCheckEnrollment}
                  disabled={isChecking || !enrollmentInput}
                  className="font-mono text-sm border border-black bg-black text-white hover:bg-gray-800 px-6 py-2 transition-colors dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 disabled:opacity-70 whitespace-nowrap"
                >
                  {isChecking ? 'Checking...' : 'Check / Load Data'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  fullName<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  defaultValue={existingData?.full_name || ''}
                  placeholder="e.g. Ada Lovelace"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Enrollment ID */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  enrollmentID<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="enrollmentID"
                  defaultValue={existingData?.enrollment_id || enrollmentInput}
                  placeholder="CS-2024-001"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Phone Num */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  phoneNum<span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phoneNum"
                  defaultValue={existingData?.phone_num || ''}
                  placeholder="+1 (555) 000-0000"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Inst Email */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  email<span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue={existingData?.email || ''}
                  placeholder="student@cs.university.edu"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Current Program */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentProgram<span className="text-red-500">*</span>
                </label>
                <select name="currentProgram" value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8" required>
                  <option value="" disabled>Select your program</option>
                  <option value="Bsc">Bsc</option>
                  <option value="BA">BA</option>
                </select>
              </div>

              {/* Current Year/Semester */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentSemester<span className="text-red-500">*</span>
                </label>
                <select name="currentSemester" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8" required>
                  <option value="" disabled>Select semester</option>
                  <option value="Semester 1">Semester 1</option>
                  <option value="Semester 2">Semester 2</option>
                  <option value="Semester 3">Semester 3</option>
                  <option value="Semester 4">Semester 4</option>
                  <option value="Semester 5">Semester 5</option>
                  <option value="Semester 6">Semester 6</option>
                  <option value="Semester 7">Semester 7</option>
                  <option value="Semester 8">Semester 8</option>
                </select>
              </div>

              {/* Current Major */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentMajor<span className="text-red-500">*</span>
                </label>
                <select name="currentMajor" defaultValue={existingData?.current_major || ''} className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8" required>
                  <option value="" disabled>Select your current major</option>
                  {selectedProgram !== 'Bsc' && (
                    <>
                      <option value="geography">Department of Geography</option>
                      <option value="assamese">Department of Assamese</option>
                      <option value="economics">Department of Economics</option>
                      <option value="political_science">Department of Political Science</option>
                      <option value="english">Department of English</option>
                      <option value="education">Department of Education</option>
                    </>
                  )}
                  {selectedProgram !== 'BA' && (
                    <>
                      <option value="computer_science">Department of Computer Science</option>
                      <option value="mathematics">Department of Mathematics</option>
                      <option value="zoology">Department of Zoology</option>
                      <option value="botany">Department of Botany</option>
                      <option value="chemistry">Department of Chemistry</option>
                    </>
                  )}
                </select>
              </div>

              {/* Current GPA */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentGPA<span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="currentGPA"
                  defaultValue={existingData?.current_gpa || ''}
                  step="0.01"
                  placeholder="e.g. 3.8"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {parseInt(String(selectedSemester).replace(/\D/g, '')) > 1 && (
                <div>
                  <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                    previousSemesterMarksheet<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="file"
                    name="marksheet"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                    required={!existingData?.marksheet_url}
                  />
                  {existingData?.marksheet_url && (
                    <p className="mt-1 text-xs text-blue-500">Current marksheet attached. Upload a new one to replace.</p>
                  )}
                </div>
              )}

              {/* Select Subject */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  selectSubject<span className="text-red-500">*</span>
                </label>
                <select 
                  name="selectSubject"
                  onChange={handleSubjectChange}
                  defaultValue={existingData?.subject_id || ''}
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  required 
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.length > 0 ? (
                    subjects
                      .filter(s => {
                        if (selectedProgram === 'BA' && s.subject_type === 'Major') return false;
                        if (!selectedSemester) return true;
                        const semInt = parseInt(String(selectedSemester).replace(/\D/g, ''));
                        return s.semester === semInt;
                      })
                      .map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.code} {subject.name}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Loading subjects...</option>
                  )}
                </select>
              </div>

              {/* Subject Code */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  subjectCode<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subjectCode"
                  value={subjectCode}
                  readOnly
                  placeholder="e.g. CS210"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-gray-100 dark:bg-surface-dim focus:outline-none cursor-not-allowed text-gray-500"
                  required
                />
              </div>

              {/* Subject Credit (Auto-fill) */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  subjectCredit (Auto-filled)
                </label>
                <input
                  type="text"
                  name="subjectCredit"
                  value={subjectCredit}
                  readOnly
                  placeholder="Credits"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-gray-100 dark:bg-surface-dim focus:outline-none cursor-not-allowed text-gray-500"
                />
              </div>

              {/* Prerequisites Completed */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  prerequisitesCompleted
                </label>
                <input
                  type="text"
                  name="prerequisitesCompleted"
                  defaultValue={existingData?.prerequisites_completed || ''}
                  placeholder="e.g. CS101, MATH102"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>

              {/* Grades in Prerequisites */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  prerequisitesGrades
                </label>
                <input
                  type="text"
                  name="prerequisitesGrades"
                  defaultValue={existingData?.prerequisites_grades || ''}
                  placeholder="e.g. A in CS101, B+ in MATH102"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>



            {/* Separator */}
            <hr className="border-gray-200 dark:border-gray-700 mb-6" />

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4">
              <Link to="/subjects" className="font-mono text-sm border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 px-6 py-2 transition-colors dark:bg-transparent dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-800">
                Cancel
              </Link>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="font-mono text-sm border border-black bg-black text-white hover:bg-gray-800 px-6 py-2 transition-colors dark:bg-white dark:text-black dark:border-white dark:hover:bg-gray-200 disabled:opacity-70 flex items-center justify-center min-w-[180px]"
              >
                {isSubmitting ? 'Submitting...' : (existingData ? 'Update Application' : 'Submit Application')}
              </button>
            </div>
            </form>
          </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-dim w-full border-t border-outline-variant dark:border-outline">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto py-lg px-margin">
          <div className="mb-sm md:mb-0 text-center md:text-left">
            <div className="font-label-md text-label-md text-secondary dark:text-secondary-fixed mb-xs flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              CS Department
            </div>
            <div className="font-body-sm text-body-sm text-on-surface dark:text-inverse-on-surface">
              © 2024 Computer Science Department. All rights reserved.
            </div>
          </div>
          <div className="flex gap-md font-body-sm text-body-sm">
            <Link className="text-secondary opacity-80 hover:opacity-100 hover:underline transition-opacity" to="#">Privacy Policy</Link>
            <Link className="text-secondary opacity-80 hover:opacity-100 hover:underline transition-opacity" to="#">Terms of Service</Link>
            <Link className="text-secondary opacity-80 hover:opacity-100 hover:underline transition-opacity" to="#">Accessibility</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Apply;
