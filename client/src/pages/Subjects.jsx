import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('All');

  useEffect(() => {
    const fetchSubjects = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .eq('status', 'Active')
        .order('code', { ascending: true });
      
      if (error) {
        console.error("Error fetching subjects:", error);
      } else {
        setSubjects(data || []);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, []);

  return (
    <>
      <TopNavBar />

      {/* Main Content Canvas */}
      <main className="flex-grow max-w-[1280px] w-full mx-auto px-margin py-xl flex flex-col gap-lg">
        {/* Page Header & Filters */}
        <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-md">
          <div>
            <h1 className="font-display-lg text-display-lg text-primary mb-xs">Course Catalog</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Explore our comprehensive curriculum designed to build foundational knowledge and advanced expertise in computer science.</p>
          </div>
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-sm bg-surface-container-lowest p-sm border border-outline-variant rounded-lg shadow-level-2">
            <div className="flex items-center gap-xs">
              <span className="material-symbols-outlined text-on-surface-variant">filter_list</span>
              <span className="font-label-md text-label-md text-on-surface-variant uppercase">Filters</span>
            </div>
            <div className="h-6 w-px bg-outline-variant mx-xs"></div>
            <select 
              value={selectedSemester} 
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="bg-surface border-none text-body-sm font-body-sm text-on-surface rounded focus:ring-1 focus:ring-secondary py-xs pl-sm pr-lg cursor-pointer appearance-none"
            >
              <option value="All">All Semesters</option>
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
          </div>
        </section>

        {/* Course Grid (Bento style) */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter">
          {loading ? (
            <div className="col-span-full py-20 text-center text-on-surface-variant font-body-lg">
              Loading courses...
            </div>
          ) : subjects.filter(s => selectedSemester === 'All' || s.semester === parseInt(selectedSemester)).length > 0 ? (
            subjects.filter(s => selectedSemester === 'All' || s.semester === parseInt(selectedSemester)).map(subject => (
              <article key={subject.id} className="bg-surface-container-lowest border border-outline-variant hover:border-secondary hover:shadow-level-2 transition-all duration-300 rounded-lg p-md flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-sm">
                    <span className="font-label-md text-label-md text-secondary bg-secondary-fixed px-xs py-1 rounded">{subject.code}</span>
                    <span className="font-code-sm text-code-sm text-on-surface-variant bg-surface-container px-xs py-1 rounded">Sem {subject.semester || 1} • {subject.credits} Credits</span>
                  </div>
                  <h2 className="font-headline-md text-headline-md text-primary mb-xs group-hover:text-secondary transition-colors">{subject.name}</h2>
                  <p className="font-body-md text-body-md text-on-surface-variant mb-md">Dive into the fundamentals and advanced topics of this subject. Expand your expertise in computer science.</p>
                </div>
                <div>
                  {subject.syllabus_url && (
                    <a href={subject.syllabus_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-body-sm text-secondary hover:underline mb-3">
                      <span className="material-symbols-outlined text-[16px]">download</span>
                      Download Syllabus
                    </a>
                  )}
                  <div className="flex items-center gap-xs mb-md border-t border-surface-container-high pt-sm mt-sm">
                    <span className="material-symbols-outlined text-on-surface-variant text-[20px]">person</span>
                    <span className="font-body-sm text-body-sm text-on-surface">{subject.instructor || 'TBD'}</span>
                  </div>
                  <Link to={`/apply?subjectCode=${subject.code}`} className="block text-center w-full bg-surface-container hover:bg-secondary hover:text-on-secondary text-primary font-label-md text-label-md py-sm rounded transition-colors border border-outline-variant hover:border-secondary">Apply</Link>
                </div>
              </article>
            ))
          ) : (
            <div className="col-span-full py-20 text-center text-on-surface-variant font-body-lg">
              No active subjects available for this semester.
            </div>
          )}

          {/* Featured Graphic/Information Area (Bento span) */}
          <article className="md:col-span-2 lg:col-span-2 bg-primary text-on-primary rounded-lg p-md flex flex-col md:flex-row gap-lg items-center overflow-hidden relative border border-tertiary shadow-level-2">
            {/* Decorative code pattern background */}
            <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "24px 24px" }}></div>
            <div className="flex-1 relative z-10">
              <span className="font-label-md text-label-md text-secondary-fixed-dim uppercase tracking-wider mb-xs block">Featured Program</span>
              <h2 className="font-headline-lg text-headline-lg mb-sm text-white">Quantum Computing Initiative</h2>
              <p className="font-body-md text-body-md text-inverse-on-surface mb-md">A new cross-disciplinary track exploring quantum algorithms, cryptography, and hardware interfaces. Enrollment open for Fall 2025 cohort.</p>
              <button className="bg-secondary-container text-on-secondary-container px-md py-sm rounded font-label-md text-label-md hover:bg-secondary hover:text-white transition-colors">View Track Details</button>
            </div>
            <div className="w-full md:w-1/3 aspect-video md:aspect-square bg-inverse-surface rounded flex items-center justify-center relative z-10 border border-surface-tint">
              <span className="material-symbols-outlined text-[64px] text-secondary-fixed-dim opacity-50">memory</span>
            </div>
          </article>
        </section>

        {/* Pagination / Load More */}
        <div className="flex justify-center mt-lg">
          <button className="bg-transparent border border-outline text-primary font-label-md text-label-md px-lg py-sm rounded-full hover:bg-surface-container transition-colors flex items-center gap-xs">
            Load More Courses
            <span className="material-symbols-outlined text-[18px]">expand_more</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-dim w-full mt-xl border-t border-outline-variant dark:border-outline">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto py-lg px-margin gap-md">
          {/* Brand Logo / Copyright */}
          <div className="flex flex-col items-center md:items-start gap-xs">
            <span className="font-label-md text-label-md text-secondary dark:text-secondary-fixed flex items-center gap-xs">
              <span className="material-symbols-outlined text-[18px]">terminal</span>
              CS Department
            </span>
            <span className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant">© 2024 Computer Science Department. All rights reserved.</span>
          </div>
          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-md">
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Accessibility</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">IT Support</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}

export default Subjects;
