import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

function Apply() {
  const [subjects, setSubjects] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    const formData = new FormData(e.target);
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
      reason: formData.get('reasonForApplication')
    };

    const { error } = await supabase.from('applications').insert([applicationData]);

    if (error) {
      console.error('Submission error:', error);
      setSubmitError('Failed to submit application. Please try again.');
    } else {
      setSubmitSuccess(true);
      e.target.reset();
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
          <form className="p-8" onSubmit={handleSubmit}>
            {submitError && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded text-sm font-medium">
                {submitError}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Full Name */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  fullName<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
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
                <input
                  type="text"
                  name="currentProgram"
                  placeholder="e.g. B.Tech, B.Sc., M.Sc."
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Current Year/Semester */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentSemester<span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="currentSemester"
                  placeholder="e.g. 2nd Year, 3rd Semester"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Current Major */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  currentMajor<span className="text-red-500">*</span>
                </label>
                <select name="currentMajor" className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8" required defaultValue="">
                  <option value="" disabled>Select your current major</option>
                  <option value="geography">Department of Geography</option>
                  <option value="assamese">Department of Assamese</option>
                  <option value="economics">Department of Economics</option>
                  <option value="political_science">Department of Political Science</option>
                  <option value="english">Department of English</option>
                  <option value="education">Department of Education</option>
                  <option value="computer_science">Department of Computer Science</option>
                  <option value="mathematics">Department of Mathematics</option>
                  <option value="zoology">Department of Zoology</option>
                  <option value="botany">Department of Botany</option>
                  <option value="chemistry">Department of Chemistry</option>
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
                  step="0.01"
                  placeholder="e.g. 3.8"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
                />
              </div>

              {/* Select Subject */}
              <div>
                <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                  selectSubject<span className="text-red-500">*</span>
                </label>
                <select 
                  name="selectSubject"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cpath%20d%3D%22M5%208l5%205%205-5z%22%20fill%3D%22%23666%22%2F%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] pr-8"
                  required 
                  defaultValue=""
                >
                  <option value="" disabled>Select a subject</option>
                  {subjects.length > 0 ? (
                    subjects.map(subject => (
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
                  placeholder="e.g. CS210"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                  required
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
                  placeholder="e.g. A in CS101, B+ in MATH102"
                  className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400"
                />
              </div>
            </div>

            {/* Reason for Application */}
            <div className="mb-8">
              <label className="block font-mono text-sm mb-2 text-gray-700 dark:text-gray-300">
                reasonForApplication<span className="text-red-500">*</span>
              </label>
              <textarea
                name="reasonForApplication"
                rows="4"
                placeholder="Describe your academic interest in this specific subject and relevant prerequisites completed..."
                className="w-full border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm bg-white dark:bg-surface-dim focus:outline-none focus:ring-1 focus:ring-gray-400 resize-y"
                required
              ></textarea>
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
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </div>
          </form>
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
