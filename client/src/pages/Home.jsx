import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Home() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from('pages').select('content').eq('slug', 'home').single();
      if (error) console.error("Error fetching home content", error);
      else setContent(data.content);
      setLoading(false);
    };
    fetchContent();
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            
            {/* Large Highlight */}
            {content.large_highlight && (
              <div className="md:col-span-2 bg-surface-container-lowest border border-surface-container-high rounded-xl p-md shadow-sm hover:shadow-md transition-shadow group">
                <div className="h-48 mb-sm rounded-lg overflow-hidden bg-surface-container">
                  <div 
                    className="bg-cover bg-center w-full h-full group-hover:scale-105 transition-transform duration-500" 
                    style={{ backgroundImage: `url('${content.large_highlight.bg_image}')` }}
                  ></div>
                </div>
                <h3 className="font-headline-md text-headline-md text-primary mb-xs">{content.large_highlight.title}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant">{content.large_highlight.description}</p>
              </div>
            )}

            {/* Small Highlight 1 */}
            {content.small_highlight_1 && (
              <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary text-4xl mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{content.small_highlight_1.icon}</span>
                  <h3 className="font-headline-md text-headline-md text-primary mb-xs">{content.small_highlight_1.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{content.small_highlight_1.description}</p>
                </div>
              </div>
            )}

            {/* Small Highlight 2 */}
            {content.small_highlight_2 && (
              <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-md shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div>
                  <span className="material-symbols-outlined text-secondary text-4xl mb-sm" style={{ fontVariationSettings: "'FILL' 1" }}>{content.small_highlight_2.icon}</span>
                  <h3 className="font-headline-md text-headline-md text-primary mb-xs">{content.small_highlight_2.title}</h3>
                  <p className="font-body-md text-body-md text-on-surface-variant">{content.small_highlight_2.description}</p>
                </div>
              </div>
            )}

            {/* Medium Highlight */}
            {content.medium_highlight && (
              <div className="md:col-span-2 bg-primary text-on-primary rounded-xl p-md shadow-sm flex items-center justify-between overflow-hidden relative group">
                <div className="relative z-10 w-2/3">
                  <h3 className="font-headline-md text-headline-md mb-xs">{content.medium_highlight.title}</h3>
                  <p className="font-body-md text-body-md opacity-90 mb-sm">{content.medium_highlight.description}</p>
                  <Link to="/about" className="bg-[#00e5ff] text-primary px-sm py-xs rounded font-label-md text-label-md hover:opacity-90 transition-opacity inline-block">
                    View More
                  </Link>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-surface-container">
                  <div 
                    className="bg-cover bg-center w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                    style={{ backgroundImage: `url('${content.medium_highlight.bg_image}')` }}
                  ></div>
                </div>
              </div>
            )}
            
          </div>
        </section>

        {/* Two Column Layout: News & Events */}
        <section className="bg-surface-container-low py-xl">
          <div className="max-w-[1280px] mx-auto px-margin grid grid-cols-1 lg:grid-cols-2 gap-xl">
            {/* Latest News */}
            <div>
              <div className="flex justify-between items-end mb-lg border-b border-outline-variant pb-xs">
                <h2 className="font-headline-lg text-headline-lg text-primary">Latest News</h2>
              </div>
              <div className="space-y-md">
                {(content.news || []).map((item, idx) => (
                  <article key={idx} className="flex gap-sm group cursor-pointer">
                    <div className="w-24 h-24 flex-shrink-0 bg-surface-container rounded-lg overflow-hidden border border-outline-variant">
                      <div className="bg-cover bg-center w-full h-full group-hover:scale-110 transition-transform duration-500" style={{ backgroundImage: `url('${item.bg_image}')` }}></div>
                    </div>
                    <div>
                      <span className="font-label-md text-label-md text-secondary block mb-xs">{item.category_date}</span>
                      <h3 className="font-headline-md text-headline-md text-primary group-hover:text-secondary transition-colors line-clamp-2">{item.title}</h3>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div>
              <div className="flex justify-between items-end mb-lg border-b border-outline-variant pb-xs">
                <h2 className="font-headline-lg text-headline-lg text-primary">Upcoming Events</h2>
              </div>
              <div className="space-y-sm">
                {(content.events || []).map((ev, idx) => (
                  <div key={idx} className="bg-surface-container-lowest border border-surface-container-high rounded-lg p-sm flex items-center gap-md hover:shadow-sm transition-shadow">
                    <div className="text-center min-w-[60px]">
                      <span className="font-label-md text-label-md text-secondary block uppercase">{ev.month}</span>
                      <span className="font-display-lg text-display-lg text-primary leading-none">{ev.day}</span>
                    </div>
                    <div className="h-12 w-[1px] bg-outline-variant"></div>
                    <div>
                      <h3 className="font-headline-md text-headline-md text-primary mb-xs">{ev.title}</h3>
                      <div className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-xs">
                        {ev.time && <><span className="material-symbols-outlined text-[16px]">schedule</span> {ev.time}</>}
                        {ev.location && <><span className="material-symbols-outlined text-[16px] ml-sm">location_on</span> {ev.location}</>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
