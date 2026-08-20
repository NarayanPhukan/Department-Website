import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Batches() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from('pages')
        .select('*')
        .eq('slug', 'batches')
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
          <p className="text-on-surface-variant">Failed to load Batches page content.</p>
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
          <div className="absolute inset-0 tech-grid-bg opacity-30 mix-blend-overlay pointer-events-none z-0"></div>
          
          <div className="max-w-[800px] w-full relative z-10 scroll-reveal-up animation-delay-100">
            <div className="inline-flex items-center gap-xs px-sm py-1 rounded-full bg-secondary-container/50 border border-secondary/20 text-secondary font-label-md mb-md">
              <span className="material-symbols-outlined text-[16px]">history_edu</span>
              <span>Our Legacy</span>
            </div>
            
            <h1 className="font-display-lg text-display-lg md:text-[64px] font-bold tracking-tight text-primary mb-md leading-tight">
              {content.hero?.title || 'Our Batches'}
            </h1>
            
            <p className="font-body-lg text-body-lg md:text-[22px] text-on-surface-variant leading-relaxed max-w-[700px] mx-auto">
              {content.hero?.description || 'Celebrating the journey of our graduates.'}
            </p>
          </div>
        </section>

        {/* Batches Grid */}
        <section className="py-24 px-md bg-surface-container-lowest relative z-10">
          <div className="max-w-[1200px] mx-auto">
            {content.batches && content.batches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-xl">
                {content.batches.map((batch, index) => (
                  <div 
                    key={index} 
                    className="group bg-surface rounded-3xl border border-surface-container-highest shadow-level-1 hover:shadow-level-3 transition-all duration-300 hover:-translate-y-2 overflow-hidden flex flex-col scroll-reveal-scale"
                    style={{ animationDelay: `${(index % 2) * 100}ms` }}
                  >
                    {/* Image Header */}
                    <div className="h-64 w-full bg-surface-container relative overflow-hidden">
                      {batch.image ? (
                        <img src={batch.image} alt={batch.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-secondary-container/30 text-secondary">
                          <span className="material-symbols-outlined text-[80px] opacity-50">groups</span>
                        </div>
                      )}
                      
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-surface to-transparent opacity-90"></div>
                      
                      {/* Year Badge */}
                      <div className="absolute top-md right-md bg-primary text-on-primary font-bold px-md py-xs rounded-full shadow-level-2">
                        {batch.year}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-xl flex-grow flex flex-col relative z-10 -mt-12">
                      <h3 className="font-headline-lg text-headline-lg text-primary mb-xs">{batch.name}</h3>
                      
                      <div className="flex items-center gap-xs text-secondary font-label-lg mb-md">
                        <span className="material-symbols-outlined text-[20px]">group</span>
                        <span>{batch.student_count} Students Graduated</span>
                      </div>
                      
                      <div className="w-16 h-1 bg-outline-variant rounded-full mb-md group-hover:bg-primary/50 transition-colors"></div>
                      
                      <p className="font-body-md text-on-surface-variant leading-relaxed mb-auto">
                        {batch.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-outline-variant rounded-3xl bg-surface">
                <span className="material-symbols-outlined text-[64px] text-on-surface-variant opacity-30 mb-4 block">history_edu</span>
                <p className="font-headline-sm text-on-surface-variant">No batches recorded yet.</p>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default Batches;
