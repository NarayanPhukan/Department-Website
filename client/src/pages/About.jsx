import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function About() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from('pages').select('content').eq('slug', 'about').single();
      if (error) console.error("Error fetching about content", error);
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

      <main className="flex-grow">
        <section className="max-w-[1280px] mx-auto px-margin py-xl flex flex-col md:flex-row gap-lg items-center">
          <div className="flex-1">
            <h1 className="font-display-lg text-display-lg text-on-surface mb-md">{content.hero?.title}</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg">
              {content.hero?.description}
            </p>
            <div className="flex gap-sm">
              <Link to="/apply" className="bg-tertiary text-on-tertiary px-lg py-sm font-label-md text-label-md rounded">Explore Programs</Link>
            </div>
          </div>
          <div className="flex-1 w-full h-[400px] rounded-xl overflow-hidden border border-outline-variant">
            <img className="w-full h-full object-cover" src={content.hero?.image} alt="Hero" />
          </div>
        </section>

        {/* History Bento Grid */}
        <section className="bg-surface-container-low py-xl">
          <div className="max-w-[1280px] mx-auto px-margin">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-lg">{content.history_title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-md auto-rows-[250px]">
              {(content.history || []).map((item, idx) => (
                <div key={idx} className={`${item.isLarge ? 'md:col-span-2' : ''} bg-surface-container-lowest border border-outline-variant p-md rounded-lg flex flex-col justify-between hover:border-secondary transition-colors relative overflow-hidden group`}>
                  <div className="z-10">
                    <h3 className="font-headline-md text-headline-md text-on-surface mb-xs">{item.title}</h3>
                    <p className="font-body-md text-body-md text-on-surface-variant">{item.description}</p>
                  </div>
                  <span className="font-label-md text-label-md text-secondary block mt-auto z-10">{item.year}</span>
                  {!item.isLarge && <div className="absolute inset-0 bg-secondary opacity-0 group-hover:opacity-5 transition-opacity z-0 pointer-events-none"></div>}
                  {item.isLarge && idx > 0 && <div className="absolute inset-0 bg-surface-tint opacity-0 group-hover:opacity-10 transition-opacity z-0 pointer-events-none"></div>}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Faculty Profiles */}
        <section className="max-w-[1280px] mx-auto px-margin py-xl">
          <div className="flex justify-between items-end mb-lg">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Our Faculty</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-md">
            {(content.faculty || []).map((fac, idx) => (
              <div key={idx} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-md hover:shadow-level-2 transition-shadow">
                <div className="w-full aspect-square rounded-full overflow-hidden mb-sm bg-surface-container-high border border-outline">
                  <img className="w-full h-full object-cover" src={fac.image} alt={fac.name} />
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface">{fac.name}</h3>
                <p className="font-label-md text-label-md text-secondary mb-xs">{fac.title}</p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{fac.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Research Areas */}
        <section className="bg-tertiary text-on-tertiary py-xl">
          <div className="max-w-[1280px] mx-auto px-margin">
            <h2 className="font-headline-lg text-headline-lg mb-lg">Core Research Areas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
              {(content.research || []).map((area, idx) => (
                <div key={idx} className="border-t border-outline py-md group">
                  <div className="flex items-center gap-sm mb-sm">
                    <span className="material-symbols-outlined text-secondary-fixed-dim">{area.icon}</span>
                    <h3 className="font-headline-md text-headline-md">{area.title}</h3>
                  </div>
                  <p className="font-body-md text-body-md text-surface-dim">{area.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Component */}
      <footer className="bg-surface-container-lowest dark:bg-surface-dim text-on-surface dark:text-inverse-on-surface font-body-sm text-body-sm w-full mt-xl border-t border-outline-variant dark:border-outline">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-[1280px] mx-auto py-lg px-margin gap-sm">
          <div className="font-label-md text-label-md text-secondary dark:text-secondary-fixed">
            © 2024 Computer Science Department. All rights reserved.
          </div>
          <div className="flex gap-md">
            <Link className="text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Privacy Policy</Link>
            <Link className="text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Terms of Service</Link>
            <Link className="text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Accessibility</Link>
            <Link className="text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">IT Support</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default About;
