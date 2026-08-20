import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Alumni() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'alumni')
        .single();
      
      if (!error && data) {
        setContent(data.content);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center font-body-md antialiased">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased">
        <TopNavBar />
        <div className="flex-grow flex items-center justify-center">
          <p className="text-on-surface-variant">Failed to load Alumni page content.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased relative">
      <TopNavBar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative py-32 px-md overflow-hidden bg-surface flex flex-col items-center justify-center text-center">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 tech-grid-bg opacity-30 mix-blend-overlay pointer-events-none z-0"></div>
          
          <div className="max-w-[800px] w-full relative z-10 scroll-reveal-up animation-delay-100">
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-secondary-container/50 border border-secondary/20 text-secondary font-label-md mb-md">
              <span className="material-symbols-outlined text-[16px]">school</span>
              <span>Our Graduates</span>
            </div>
            
            <h1 className="font-display-lg text-display-lg md:text-[64px] font-bold tracking-tight text-primary mb-md leading-tight">
              {content.hero?.title}
            </h1>
            
            <p className="font-body-lg text-body-lg md:text-[22px] text-on-surface-variant leading-relaxed max-w-[700px] mx-auto">
              {content.hero?.description}
            </p>
          </div>
        </section>

        {/* Alumni Grid Section */}
        <section className="py-24 px-md bg-surface-container-lowest relative z-10">
          <div className="max-w-[1200px] mx-auto">
            
            {content.alumni_list && content.alumni_list.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-xl">
                {content.alumni_list.map((alum, index) => (
                  <div 
                    key={index} 
                    className="group bg-surface rounded-2xl p-lg border border-surface-container-highest shadow-level-1 hover:shadow-level-3 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden flex flex-col scroll-reveal-scale"
                    style={{ animationDelay: `${(index % 3) * 100}ms` }}
                  >
                    {/* Decorative Background for Card */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors duration-500 z-0 pointer-events-none"></div>
                    
                    <div className="relative z-10 flex flex-col items-center text-center h-full">
                      {/* Image / Avatar */}
                      <div className="w-24 h-24 rounded-full mb-md overflow-hidden border-4 border-surface shadow-level-2 bg-surface-container flex items-center justify-center shrink-0">
                        {alum.image ? (
                          <img src={alum.image} alt={alum.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="material-symbols-outlined text-[40px] text-on-surface-variant">person</span>
                        )}
                      </div>
                      
                      {/* Name & Profession */}
                      <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{alum.name}</h3>
                      <p className="font-label-lg text-secondary mb-sm">{alum.profession}</p>
                      
                      {/* Divider */}
                      <div className="w-12 h-1 bg-outline-variant rounded-full mb-sm group-hover:bg-primary/30 transition-colors"></div>
                      
                      {/* Details */}
                      <div className="flex flex-col gap-1 text-sm font-body-sm text-on-surface-variant mb-md w-full">
                        {alum.company && (
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px] opacity-70">corporate_fare</span>
                            <span>{alum.company}</span>
                          </div>
                        )}
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[16px] opacity-70">badge</span>
                          <span className="capitalize">{alum.employment_type} Sector</span>
                        </div>
                        <div className="flex items-center justify-center gap-2">
                          <span className="material-symbols-outlined text-[16px] opacity-70">calendar_month</span>
                          <span>Class of {alum.grad_year}</span>
                        </div>
                        {alum.gpa && (
                          <div className="flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[16px] opacity-70">school</span>
                            <span>GPA: {alum.gpa}</span>
                          </div>
                        )}
                      </div>

                      {/* LinkedIn Button (Pushed to bottom) */}
                      {alum.linkedin && (
                        <div className="mt-auto pt-md w-full">
                          <a 
                            href={alum.linkedin} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="inline-flex items-center justify-center gap-2 w-full py-2 px-4 rounded-lg bg-surface-container border border-outline-variant text-on-surface hover:bg-secondary hover:text-on-secondary hover:border-secondary transition-colors duration-200"
                          >
                            <span className="font-label-md">Connect on LinkedIn</span>
                            <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline-variant rounded-2xl bg-surface">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-50 mb-4 block">group</span>
                <p className="font-body-lg text-on-surface-variant">No alumni profiles added yet.</p>
              </div>
            )}
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-xl px-md bg-surface border-t border-outline-variant">
          <div className="max-w-[800px] mx-auto text-center bg-secondary-container/30 rounded-3xl p-xl border border-secondary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl"></div>
            
            <h2 className="font-display-sm text-display-sm text-primary mb-sm relative z-10">Are you an Alumni?</h2>
            <p className="font-body-lg text-on-surface-variant mb-lg max-w-[600px] mx-auto relative z-10">
              We would love to feature your journey! Apply to join our alumni network and connect with current students and fellow graduates.
            </p>
            <a 
              href="/contact?subject=Alumni%20Application" 
              className="inline-flex items-center gap-2 bg-primary text-on-primary px-xl py-md rounded-xl font-label-lg hover:bg-primary/90 hover:-translate-y-1 transition-all duration-300 shadow-level-2 hover:shadow-level-3 relative z-10"
            >
              <span>Apply to Join</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </a>
          </div>
        </section>
      </main>
    </div>
  );
}

export default Alumni;
