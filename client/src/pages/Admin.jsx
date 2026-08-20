import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { HeroManager, HighlightsManager, ContactManager, EventsManager, AboutManager, AlumniManager, BatchesManager } from '../components/CMSManagers';
import { toast } from 'react-hot-toast';

function Admin() {
  const [subjects, setSubjects] = useState([]);
  const [applications, setApplications] = useState([]);
  const [pages, setPages] = useState([]);
  const [selectedPageContent, setSelectedPageContent] = useState('');
  const [selectedPageSlug, setSelectedPageSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isUploading, setIsUploading] = useState(false);
  
  const [userSemesterFilter, setUserSemesterFilter] = useState('All');
  const [userSubjectTypeFilter, setUserSubjectTypeFilter] = useState('All');
  const [userSortBy, setUserSortBy] = useState('Name A-Z');

  const fetchData = async () => {
    setLoading(true);
    const [appsRes, subsRes, pagesRes] = await Promise.all([
      supabase.from('applications').select('*'),
      supabase.from('subjects').select('*').order('code', { ascending: true }),
      supabase.from('pages').select('*')
    ]);

    if (appsRes.data) setApplications(appsRes.data);
    if (subsRes.data) setSubjects(subsRes.data);
    if (pagesRes.data) {
      setPages(pagesRes.data);
      if (pagesRes.data.length > 0) {
        setSelectedPageSlug(pagesRes.data[0].slug);
        setSelectedPageContent(JSON.stringify(pagesRes.data[0].content, null, 2));
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSaveSubject = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const code = formData.get('code');
    const name = formData.get('name');
    const credits = parseFloat(formData.get('credits'));
    const instructor = formData.get('instructor');
    const semester = parseInt(formData.get('semester'));
    const subject_type = formData.get('subject_type');
    const file = formData.get('syllabus');

    if (!code || !name || isNaN(credits) || isNaN(semester) || !subject_type) return;

    setIsUploading(true);
    let syllabus_url = editingSubject?.syllabus_url || null;

    if (file && file.size > 0) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File is too large! Please keep the syllabus under 5MB.");
        setIsUploading(false);
        return;
      }
      try {
        syllabus_url = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
          reader.readAsDataURL(file);
        });
      } catch (err) {
        toast.error("Upload failed to read file: " + err.message);
        setIsUploading(false);
        return;
      }
    }

    if (editingSubject) {
      const { error } = await supabase.from('subjects').update({ code, name, credits, instructor, semester, subject_type, syllabus_url }).eq('id', editingSubject.id);
      if (error) toast.error("Error updating subject: " + error.message);
      else {
        setIsModalOpen(false);
        setEditingSubject(null);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('subjects').insert([
        { code, name, credits, instructor, semester, subject_type, syllabus_url, status: 'Active' }
      ]);
      if (error) toast.error("Error creating subject: " + error.message);
      else {
        setIsModalOpen(false);
        fetchData();
      }
    }
    setIsUploading(false);
  };

  const handleDeleteSubject = async (id) => {
    if (window.confirm("Are you sure you want to delete this subject?")) {
      const { error } = await supabase.from('subjects').delete().eq('id', id);
      if (error) toast.error("Error deleting subject: " + error.message);
      else fetchData();
    }
  };

  const updateApplicationStatus = async (id, status) => {
    const { error } = await supabase.from('applications').update({ status }).eq('id', id);
    if (error) toast.error("Error updating status: " + error.message);
    else fetchData();
  };

  const handleDeleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to permanently delete this student from the database?")) {
      const { error } = await supabase.from('applications').delete().eq('id', id);
      if (error) toast.error("Error deleting student: " + error.message);
      else {
        toast.success("Student deleted successfully");
        fetchData();
      }
    }
  };

  const pendingApps = applications.filter(a => a.status === 'Pending').length;

  const getAppSubject = (subjectCode) => subjects.find(s => s.code === subjectCode);

  const enrolledStudents = applications
    .filter(app => app.status === 'Approved')
    .filter(app => {
      if (userSemesterFilter === 'All' && userSubjectTypeFilter === 'All') return true;
      const sub = getAppSubject(app.subject_code);
      if (!sub) return true;
      
      const matchSemester = userSemesterFilter === 'All' || sub.semester === parseInt(userSemesterFilter);
      const matchType = userSubjectTypeFilter === 'All' || sub.subject_type === userSubjectTypeFilter;
      return matchSemester && matchType;
    })
    .sort((a, b) => {
      if (userSortBy === 'Name A-Z') return a.full_name.localeCompare(b.full_name);
      if (userSortBy === 'Name Z-A') return b.full_name.localeCompare(a.full_name);
      if (userSortBy === 'GPA (High to Low)') return (b.current_gpa || 0) - (a.current_gpa || 0);
      if (userSortBy === 'GPA (Low to High)') return (a.current_gpa || 0) - (b.current_gpa || 0);
      return 0;
    });

  return (
    <div className="font-body-md text-body-md text-on-surface bg-background flex min-h-screen">
      {/* SideNavBar Component */}
      <nav className="bg-surface-container h-screen w-64 fixed left-0 top-0 flex flex-col p-sm gap-base z-50">
        <div className="mb-lg px-sm pt-sm">
          <h1 className="font-headline-sm text-headline-md font-black text-primary">Admin Panel</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">CS Portal Management</p>
        </div>
        <div className="flex-1 flex flex-col gap-base">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'dashboard' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
            <span className="font-label-md text-label-md">Dashboard</span>
          </button>
          <button onClick={() => setActiveTab('curriculum')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'curriculum' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="terminal">terminal</span>
            <span className="font-label-md text-label-md">Curriculum</span>
          </button>
          <button onClick={() => setActiveTab('applications')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'applications' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="description">description</span>
            <span className="font-label-md text-label-md">Applications</span>
          </button>
          <button onClick={() => setActiveTab('users')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'users' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="group">group</span>
            <span className="font-label-md text-label-md">User Management</span>
          </button>
          <button onClick={() => setActiveTab('hero')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'hero' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="image">image</span>
            <span className="font-label-md text-label-md">Hero Section</span>
          </button>
          <button onClick={() => setActiveTab('highlights')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'highlights' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="star">star</span>
            <span className="font-label-md text-label-md">Highlights</span>
          </button>
          <button onClick={() => setActiveTab('events')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'events' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="event">event</span>
            <span className="font-label-md text-label-md">Events</span>
          </button>
          <button onClick={() => setActiveTab('contact')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'contact' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="contact_page">contact_page</span>
            <span className="font-label-md text-label-md">Contact</span>
          </button>
          <button onClick={() => setActiveTab('about')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'about' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="info">info</span>
            <span className="font-label-md text-label-md">About Page</span>
          </button>
          <button onClick={() => setActiveTab('alumni')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'alumni' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="school">school</span>
            <span className="font-label-md text-label-md">Alumni</span>
          </button>
          <button onClick={() => setActiveTab('batches')} className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all active:scale-98 duration-100 ${activeTab === 'batches' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest'}`}>
            <span className="material-symbols-outlined" data-icon="groups">groups</span>
            <span className="font-label-md text-label-md">Our Batches</span>
          </button>
        </div>
        <div className="mt-auto border-t border-outline-variant pt-sm flex flex-col gap-base">
          <Link className="flex items-center gap-sm px-sm py-2 text-on-surface-variant hover:bg-surface-container-high hover:bg-surface-container-highest transition-all active:scale-98 duration-100 rounded-lg" to="/">
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-label-md text-label-md">Log Out</span>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 p-xl max-w-[1600px] w-full min-h-screen flex flex-col gap-xl">
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-300">
            <h2 className="font-headline-lg text-headline-lg text-primary">Dashboard</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs mb-8">System overview and metrics.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter">
              {/* Students Stat Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-level-2 transition-shadow flex items-center gap-md">
                <div className="w-14 h-14 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container">
                  <span className="material-symbols-outlined text-[28px]">school</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Enrolled Students</p>
                  <p className="font-display-md text-display-md text-primary leading-none">
                    {applications.filter(a => a.status === 'Approved').length}
                  </p>
                </div>
              </div>

              {/* Subjects Stat Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-level-2 transition-shadow flex items-center gap-md">
                <div className="w-14 h-14 bg-tertiary-container rounded-full flex items-center justify-center text-on-tertiary-container">
                  <span className="material-symbols-outlined text-[28px]">menu_book</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Subjects Offered</p>
                  <p className="font-display-md text-display-md text-primary leading-none">
                    {subjects.filter(s => s.status === 'Active').length}
                  </p>
                </div>
              </div>

              {/* Applications Stat Card */}
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-level-2 transition-shadow flex items-center gap-md">
                <div className="w-14 h-14 bg-error-container rounded-full flex items-center justify-center text-on-error-container">
                  <span className="material-symbols-outlined text-[28px]">description</span>
                </div>
                <div>
                  <p className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-1">Total Applications</p>
                  <p className="font-display-md text-display-md text-primary leading-none">
                    {applications.length}
                  </p>
                </div>
              </div>
            </div>
            
            {/* Quick Actions or Info (Optional extra UI for dashboard) */}
            <div className="mt-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-4">Welcome to the CS Admin Portal</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                From this dashboard, you can oversee the entire department's curriculum and admissions pipeline. Use the sidebar to navigate between managing the subject roster and processing incoming student applications.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex flex-col gap-xl h-full animate-in fade-in duration-300">
            <header className="flex flex-col md:flex-row md:items-end justify-between border-b border-outline-variant pb-sm gap-sm">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Student Management</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage enrolled students filtered by subjects and semesters.</p>
              </div>
              <div className="flex flex-wrap items-center gap-sm bg-surface-container-lowest p-xs border border-outline-variant rounded-lg shadow-sm">
                <select value={userSemesterFilter} onChange={(e) => setUserSemesterFilter(e.target.value)} className="bg-surface border-none text-body-sm text-on-surface rounded focus:ring-1 focus:ring-secondary py-1 pl-2 pr-6 cursor-pointer appearance-none">
                  <option value="All">All Semesters</option>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
                <div className="w-px h-5 bg-outline-variant"></div>
                <select value={userSubjectTypeFilter} onChange={(e) => setUserSubjectTypeFilter(e.target.value)} className="bg-surface border-none text-body-sm text-on-surface rounded focus:ring-1 focus:ring-secondary py-1 pl-2 pr-6 cursor-pointer appearance-none">
                  <option value="All">All Subjects</option>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="GEC">GEC</option>
                  <option value="VAC">VAC</option>
                  <option value="SEC">SEC</option>
                </select>
                <div className="w-px h-5 bg-outline-variant"></div>
                <select value={userSortBy} onChange={(e) => setUserSortBy(e.target.value)} className="bg-surface border-none text-body-sm text-on-surface rounded focus:ring-1 focus:ring-secondary py-1 pl-2 pr-6 cursor-pointer appearance-none">
                  <option value="Name A-Z">Name A-Z</option>
                  <option value="Name Z-A">Name Z-A</option>
                  <option value="GPA (High to Low)">GPA (High to Low)</option>
                  <option value="GPA (Low to High)">GPA (Low to High)</option>
                </select>
              </div>
            </header>
            
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
                    <tr>
                      <th className="px-md py-sm font-medium">Student Name</th>
                      <th className="px-md py-sm font-medium">Enrollment ID</th>
                      <th className="px-md py-sm font-medium">Subject</th>
                      <th className="px-md py-sm font-medium">Type</th>
                      <th className="px-md py-sm font-medium">Sem</th>
                      <th className="px-md py-sm font-medium">GPA</th>
                      <th className="px-md py-sm font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                    {enrolledStudents.map(student => {
                      const sub = getAppSubject(student.subject_code);
                      return (
                        <tr key={student.id} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="px-md py-sm font-medium">
                            {student.full_name}
                            <span className="block text-[11px] text-on-surface-variant">{student.email}</span>
                          </td>
                          <td className="px-md py-sm font-code-sm text-code-sm">{student.enrollment_id || 'N/A'}</td>
                          <td className="px-md py-sm font-code-sm text-code-sm text-primary">{student.subject_code}</td>
                          <td className="px-md py-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-secondary-container text-on-secondary-container">
                              {sub ? sub.subject_type : 'N/A'}
                            </span>
                          </td>
                          <td className="px-md py-sm">{sub ? sub.semester : 'N/A'}</td>
                          <td className="px-md py-sm font-medium text-secondary">{student.current_gpa ? student.current_gpa.toFixed(2) : 'N/A'}</td>
                          <td className="px-md py-sm text-right">
                            <button onClick={() => handleDeleteStudent(student.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete Student">
                              <span className="material-symbols-outlined text-[20px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {enrolledStudents.length === 0 && (
                      <tr>
                        <td colSpan="7" className="px-md py-xl text-center text-on-surface-variant">
                          No enrolled students match these filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hero' && <HeroManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'highlights' && <HighlightsManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'events' && <EventsManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'contact' && <ContactManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'about' && <AboutManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'alumni' && <AlumniManager pages={pages} onSaved={fetchData} />}
        {activeTab === 'batches' && <BatchesManager pages={pages} onSaved={fetchData} />}

        {activeTab === 'applications' && (
          <div className="flex flex-col gap-xl">
            <header className="flex justify-between items-end border-b border-outline-variant pb-sm">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Application Queue</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Review and process student applications.</p>
              </div>
            </header>
            <div className="grid grid-cols-12 gap-gutter">
              {/* Recent Applications Side Column (Takes up 12 columns for full width) */}
              <section className="col-span-12 flex flex-col gap-gutter">
                {/* Quick Stats Widget */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md shadow-sm">
                  <h3 className="font-label-md text-label-md text-on-surface-variant mb-sm uppercase tracking-wider">Queue Stats</h3>
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-display-lg text-display-lg text-primary block leading-none">{pendingApps}</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant mt-1 block">Pending Review</span>
                    </div>
                  </div>
                </div>

                {/* Applications List Widget */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
                  <div className="px-md py-sm bg-surface border-b border-outline-variant flex justify-between items-center">
                    <h3 className="font-headline-md text-headline-md text-primary">Recent Submissions</h3>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-outline-variant max-h-[800px]">
                    {applications.map(app => (
                      <div key={app.id} className="p-md hover:bg-surface-container-lowest transition-colors group">
                        <div className="flex justify-between items-start mb-xs">
                          <div>
                            <h4 className="font-body-md text-body-md font-medium text-primary">{app.full_name}</h4>
                            <span className="font-code-sm text-code-sm text-on-surface-variant">{app.subject_code}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium 
                            ${app.status === 'Pending' ? 'bg-tertiary-fixed text-on-tertiary-fixed' : 
                              app.status === 'Approved' ? 'bg-[#dcfce7] text-[#166534]' : 'bg-error-container text-on-error-container'}
                          `}>
                            {app.status}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface-variant truncate">{app.reason}</p>
                        
                        {app.status === 'Pending' && (
                          <div className="mt-2 flex gap-2">
                            <button onClick={() => updateApplicationStatus(app.id, 'Approved')} className="text-xs px-2 py-1 bg-[#dcfce7] text-[#166534] rounded hover:opacity-80">Approve</button>
                            <button onClick={() => updateApplicationStatus(app.id, 'Rejected')} className="text-xs px-2 py-1 bg-error-container text-on-error-container rounded hover:opacity-80">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                    {applications.length === 0 && !loading && (
                      <div className="p-md text-center text-on-surface-variant">No recent applications.</div>
                    )}
                  </div>
                </div>
              </section>
            </div>
          </div>
        )}

        {activeTab === 'curriculum' && (
          <div className="flex flex-col gap-xl">
            {/* Header Section */}
            <header className="flex justify-between items-end border-b border-outline-variant pb-sm">
              <div>
                <h2 className="font-headline-lg text-headline-lg text-primary">Curriculum Management</h2>
                <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage departmental subjects and curriculum.</p>
              </div>
              <div className="flex gap-sm">
                <button onClick={() => { setEditingSubject(null); setIsModalOpen(true); }} className="bg-primary text-on-primary font-label-md text-label-md px-md py-2 rounded hover:opacity-90 transition-opacity shadow-sm flex items-center gap-xs">
                  <span className="material-symbols-outlined text-[18px]" data-icon="add">add</span>
                  New Subject
                </button>
              </div>
            </header>

            {/* Bento Grid Layout for Content */}
            <div className="grid grid-cols-12 gap-gutter">
              {/* Subject Management Table (Takes up 12 columns) */}
              <section className="col-span-12 bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-level-2 transition-shadow">
            <div className="px-md py-sm bg-surface flex justify-between items-center border-b border-outline-variant">
              <h3 className="font-headline-md text-headline-md text-primary">Subject Roster</h3>
              <button className="text-secondary hover:text-primary transition-colors font-label-md text-label-md">View All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low font-label-md text-label-md text-on-surface-variant border-b border-outline-variant">
                  <tr>
                    <th className="px-md py-sm font-medium">Code</th>
                    <th className="px-md py-sm font-medium">Subject Name</th>
                    <th className="px-md py-sm font-medium">Credits</th>
                    <th className="px-md py-sm font-medium">Status</th>
                    <th className="px-md py-sm font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant">
                  {subjects.map(subject => (
                    <tr key={subject.id} className="hover:bg-surface-container-lowest transition-colors group">
                      <td className="px-md py-sm font-code-sm text-code-sm text-primary">{subject.code}</td>
                      <td className="px-md py-sm font-medium">{subject.name}</td>
                      <td className="px-md py-sm">{subject.credits}</td>
                      <td className="px-md py-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-[12px] font-medium ${subject.status === 'Active' ? 'bg-secondary-fixed text-on-secondary-fixed' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                          {subject.status}
                        </span>
                      </td>
                      <td className="px-md py-sm text-right flex justify-end gap-xs opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingSubject(subject); setIsModalOpen(true); }} className="text-on-surface-variant hover:text-secondary transition-colors" title="Edit"><span className="material-symbols-outlined text-[20px]" data-icon="edit">edit</span></button>
                        <button onClick={() => handleDeleteSubject(subject.id)} className="text-on-surface-variant hover:text-error transition-colors" title="Delete"><span className="material-symbols-outlined text-[20px]" data-icon="delete">delete</span></button>
                      </td>
                    </tr>
                  ))}
                  {subjects.length === 0 && !loading && (
                    <tr>
                      <td colSpan="5" className="px-md py-sm text-center text-on-surface-variant">No subjects found. Add one above.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-md py-sm bg-surface-container-lowest border-t border-outline-variant flex justify-between items-center text-body-sm text-on-surface-variant">
              <span>Showing {subjects.length} entries</span>
            </div>
          </section>

            </div>
          </div>
        )}
      </main>

      {/* Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-surface border border-outline-variant rounded-2xl p-8 shadow-level-3 w-full max-w-md transform scale-100 transition-transform">
            <h2 className="font-headline-md text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">{editingSubject ? 'edit_note' : 'add_circle'}</span>
              {editingSubject ? 'Edit Subject' : 'Add New Subject'}
            </h2>
            <form onSubmit={handleSaveSubject} className="flex flex-col gap-5">
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Subject Code</label>
                <input name="code" defaultValue={editingSubject?.code || ''} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow font-code-sm" placeholder="e.g. CS500" required />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Subject Title</label>
                <input name="name" defaultValue={editingSubject?.name || ''} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow" placeholder="e.g. Machine Learning" required />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Instructor</label>
                <input name="instructor" defaultValue={editingSubject?.instructor || ''} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow" placeholder="e.g. Dr. Alan Turing" required />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Credits</label>
                <input name="credits" type="number" step="0.5" defaultValue={editingSubject?.credits || ''} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow" placeholder="e.g. 3.0" required />
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Subject Type</label>
                <select name="subject_type" defaultValue={editingSubject?.subject_type || 'Major'} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow" required>
                  <option value="Major">Major</option>
                  <option value="Minor">Minor</option>
                  <option value="GEC">GEC (Generic Elective)</option>
                  <option value="VAC">VAC (Value Added)</option>
                  <option value="SEC">SEC (Skill Enhancement)</option>
                </select>
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Semester</label>
                <select name="semester" defaultValue={editingSubject?.semester || 1} className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2.5 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow" required>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>Semester {sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="font-label-md text-on-surface-variant block mb-1.5 uppercase tracking-wide text-[11px]">Syllabus (PDF/DOC)</label>
                <input name="syllabus" type="file" accept=".pdf,.doc,.docx" className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 focus:border-secondary focus:ring-1 focus:ring-secondary focus:outline-none transition-shadow text-body-sm" />
                {editingSubject?.syllabus_url && (
                  <p className="mt-1 text-[11px] text-primary">Current syllabus attached. Upload a new one to replace.</p>
                )}
              </div>
              <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-outline-variant">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingSubject(null); }} className="px-5 py-2.5 font-label-md text-on-surface-variant hover:bg-surface-container rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={isUploading} className={`px-5 py-2.5 bg-primary text-on-primary font-label-md rounded-lg shadow-sm transition-all flex items-center gap-2 ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-container hover:text-on-primary-container hover:shadow-md'}`}>
                  {isUploading ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[18px]">save</span>
                      Save Subject
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;
