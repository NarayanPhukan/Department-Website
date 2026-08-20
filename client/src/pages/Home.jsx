import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Home() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toppers, setToppers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const [pagesRes, appsRes, subjectsRes] = await Promise.all([
        supabase.from('pages').select('content').eq('slug', 'home').single(),
        supabase.from('applications').select('*').eq('status', 'Approved').eq('current_major', 'computer_science'),
        supabase.from('subjects').select('*')
      ]);

      if (pagesRes.error) console.error("Error fetching home content", pagesRes.error);
      else setContent(pagesRes.data.content);

      if (appsRes.data && subjectsRes.data) {
        const majorSubjects = subjectsRes.data.filter(s => s.subject_type === 'Major').map(s => s.id);
        const validApps = appsRes.data.filter(app => majorSubjects.includes(app.subject_id));
        
        const topperMap = {};
        validApps.forEach(app => {
          const sem = app.current_semester;
          if (!topperMap[sem] || app.current_gpa > topperMap[sem].current_gpa) {
            topperMap[sem] = app;
          }
        });
        
        setToppers(Object.values(topperMap).sort((a, b) => {
          const semA = parseInt(a.current_semester) || 0;
          const semB = parseInt(b.current_semester) || 0;
          return semA - semB;
        }));
      }

      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-screen bg-background text-on-surface">Loading...</div>;
  if (!content) return <div className="flex justify-center items-center h-screen bg-background text-on-surface">Content not found.</div>;

  return (
    <>
      <TopNavBar />

      {/* Main Canvas */}
      <main className="flex-grow w-full">
        {/* Hero Section */}
        <section className="relative w-full min-h-[80vh] flex items-center justify-center overflow-hidden pt-lg pb-xl">
          {/* Background Image */}
          <div className="absolute inset-0 z-0 bg-surface-container">
            <div 
              className="bg-cover bg-center w-full h-full opacity-60" 
              data-alt="Abstract architectural background representing computer science" 
              style={{ backgroundImage: `url('${content.hero?.bg_image}')` }}
            ></div>
          </div>

          {/* Hero Content */}
          <div className="relative z-10 max-w-[1280px] w-full mx-auto px-margin text-center">
            <div className="glass-panel p-lg rounded-xl max-w-3xl mx-auto shadow-sm">
              <h1 className="font-display-lg text-display-lg text-primary mb-md tracking-tight">
                {content.hero?.title}
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
                {content.hero?.subtitle}
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-sm">
                <Link to="/apply" className="bg-[#00e5ff] text-primary px-lg py-sm rounded font-label-md text-label-md hover:opacity-90 transition-opacity">
                  Apply Now
                </Link>
                <Link to="/subjects" className="bg-transparent border border-outline text-primary px-lg py-sm rounded font-label-md text-label-md hover:bg-surface-container-low transition-colors block w-fit mx-auto sm:mx-0">
                  Explore Subjects
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Department Highlights */}
        <section className="max-w-[1280px] mx-auto px-margin py-xl">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">{content.highlights_title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {(() => {
              let highlights = content.highlights_list;
              // Fallback to old schema if highlights_list doesn't exist yet
              if (!highlights) {
                highlights = [];
                if (content.large_highlight) highlights.push({ ...content.large_highlight });
                if (content.small_highlight_1) highlights.push({ ...content.small_highlight_1, bg_image: '' });
                if (content.small_highlight_2) highlights.push({ ...content.small_highlight_2, bg_image: '' });
                if (content.medium_highlight) highlights.push({ ...content.medium_highlight });
              }

              return highlights.map((highlight, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group flex flex-col h-full">
                  {highlight.bg_image ? (
                    <div className="h-48 mb-sm rounded-lg overflow-hidden bg-surface-container shrink-0">
                      <div 
                        className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" 
                        style={{ backgroundImage: `url('${highlight.bg_image}')` }}
                      ></div>
                    </div>
                  ) : (
                    <div className="h-48 mb-sm rounded-lg overflow-hidden bg-surface-container shrink-0 flex items-center justify-center bg-surface-variant">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">image</span>
                    </div>
                  )}
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-headline-md text-headline-md text-primary mb-xs">{highlight.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant flex-grow">{highlight.description}</p>
                  </div>
                </div>
              ));
            })()}
          </div>
        </section>

        {/* Department Toppers Section */}
        {toppers.length > 0 && (
          <section className="bg-surface py-xl">
            <div className="max-w-[1280px] mx-auto px-margin">
              <div className="flex justify-between items-end mb-lg border-b border-outline-variant pb-xs">
                <h2 className="font-headline-lg text-headline-lg text-primary">Department Toppers</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-md">
                {toppers.map((topper, idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-md flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-20 h-20 bg-secondary-container rounded-full flex items-center justify-center text-on-secondary-container mb-sm">
                      <span className="material-symbols-outlined text-4xl">workspace_premium</span>
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-primary mb-1">{topper.full_name}</h3>
                    <p className="font-label-md text-label-md text-secondary uppercase tracking-wider mb-xs">{topper.current_semester}</p>
                    <div className="mt-auto bg-surface-container py-1 px-4 rounded-full font-code-sm text-primary font-bold">
                      GPA: {topper.current_gpa.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Events Section */}
        <section className="bg-surface-container-low py-xl">
          <div className="max-w-[1280px] mx-auto px-margin">
            <div className="flex justify-between items-end mb-lg border-b border-outline-variant pb-xs">
              <h2 className="font-headline-lg text-headline-lg text-primary">Events</h2>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-md">
              {(content.events || []).map((ev, idx) => (
                <div key={idx} className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-0 flex flex-col sm:flex-row hover:shadow-md transition-shadow overflow-hidden group">
                  {ev.bg_image ? (
                    <div className="sm:w-48 h-48 sm:h-auto bg-surface-container shrink-0 overflow-hidden">
                      <div className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" style={{ backgroundImage: `url('${ev.bg_image}')` }}></div>
                    </div>
                  ) : (
                    <div className="sm:w-48 h-48 sm:h-auto bg-surface-variant shrink-0 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-on-surface-variant opacity-50">event</span>
                    </div>
                  )}
                  <div className="p-md flex items-center gap-md flex-grow">
                    <div className="text-center min-w-[60px] shrink-0">
                      <span className="font-label-md text-label-md text-secondary block uppercase">{ev.month}</span>
                      <span className="font-display-lg text-display-lg text-primary leading-none">{ev.day}</span>
                    </div>
                    <div className="h-full min-h-[3rem] w-[1px] bg-outline-variant shrink-0 hidden sm:block"></div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-xs">{ev.title}</h3>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex flex-col gap-1 mt-sm">
                        {ev.time && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">schedule</span> {ev.time}</span>}
                        {ev.location && <span className="flex items-center gap-xs"><span className="material-symbols-outlined text-[16px]">location_on</span> {ev.location}</span>}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {(content.events || []).length === 0 && (
              <div className="text-center text-on-surface-variant py-xl">No events scheduled.</div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-dim w-full mt-xl border-t border-outline-variant dark:border-outline flat no shadows">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto py-lg px-margin">
          <div className="font-label-md text-label-md text-secondary dark:text-secondary-fixed mb-sm md:mb-0">
            © 2024 Computer Science Department. All rights reserved.
          </div>
          <div className="flex flex-wrap justify-center gap-md font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant">
            <a className="hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Privacy Policy</a>
            <a className="hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Terms of Service</a>
            <a className="hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">Accessibility</a>
            <a className="hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" href="#">IT Support</a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Home;
