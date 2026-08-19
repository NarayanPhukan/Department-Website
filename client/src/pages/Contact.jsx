import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import TopNavBar from '../components/TopNavBar';

function Contact() {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContent = async () => {
      const { data, error } = await supabase.from('pages').select('content').eq('slug', 'contact').single();
      if (error) console.error("Error fetching contact content", error);
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

      {/* Main Content */}
      <main className="flex-grow w-full max-w-[1280px] mx-auto px-margin py-xl flex flex-col gap-xl">
        {/* Page Header */}
        <header className="max-w-2xl">
          <h1 className="font-display-lg text-display-lg text-on-surface mb-sm">{content.hero?.title}</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">{content.hero?.description}</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
          {/* Contact Form Section */}
          <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-md border-b border-outline-variant pb-2">Send a Message</h2>
            <form className="flex flex-col gap-md">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                <div className="flex flex-col gap-base">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="firstName">FIRST_NAME</label>
                  <input className="bg-surface border border-outline-variant rounded p-2 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container focus:outline-none transition-colors font-body-md text-body-md text-on-surface" id="firstName" placeholder="Ada" type="text"/>
                </div>
                <div className="flex flex-col gap-base">
                  <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="lastName">LAST_NAME</label>
                  <input className="bg-surface border border-outline-variant rounded p-2 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container focus:outline-none transition-colors font-body-md text-body-md text-on-surface" id="lastName" placeholder="Lovelace" type="text"/>
                </div>
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="email">EMAIL_ADDRESS</label>
                <input className="bg-surface border border-outline-variant rounded p-2 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container focus:outline-none transition-colors font-body-md text-body-md text-on-surface" id="email" placeholder="ada.lovelace@university.edu" type="email"/>
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="subject">INQUIRY_TYPE</label>
                <select className="bg-surface border border-outline-variant rounded p-2 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container focus:outline-none transition-colors font-body-md text-body-md text-on-surface" id="subject">
                  <option>Admissions Inquiry</option>
                  <option>Research Opportunities</option>
                  <option>Industry Partnerships</option>
                  <option>General Question</option>
                </select>
              </div>
              <div className="flex flex-col gap-base">
                <label className="font-label-md text-label-md text-on-surface-variant" htmlFor="message">MESSAGE_BODY</label>
                <textarea className="bg-surface border border-outline-variant rounded p-2 focus:border-secondary-container focus:ring-1 focus:ring-secondary-container focus:outline-none transition-colors font-body-md text-body-md text-on-surface resize-y" id="message" placeholder="Enter your message here..." rows="5"></textarea>
              </div>
              <div className="flex justify-end mt-sm">
                <button className="bg-[#000000] text-[#ffffff] font-label-md text-label-md py-3 px-6 rounded hover:bg-[#131b2e] transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-secondary-container" type="button">
                  EXECUTE submit()
                </button>
              </div>
            </form>
          </div>

          {/* Contact Info & Map Sidebar */}
          <div className="lg:col-span-5 flex flex-col gap-md">
            {/* Direct Contact Details */}
            <div className="bg-surface-container-lowest border border-outline-variant p-md rounded-lg shadow-[0_4px_12px_rgba(15,23,42,0.05)]">
              <h3 className="font-headline-md text-headline-md text-on-surface mb-sm border-b border-outline-variant pb-2">{content.contact_info?.title}</h3>
              <ul className="flex flex-col gap-sm">
                <li className="flex items-start gap-sm">
                  <span className="material-symbols-outlined text-secondary mt-1" data-icon="location_on">location_on</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Physical Address</p>
                    <p className="font-body-md text-body-md text-on-surface-variant mt-1 whitespace-pre-line">{content.contact_info?.address}</p>
                  </div>
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary" data-icon="mail">mail</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Email</p>
                    <a className="font-body-md text-body-md text-secondary hover:underline" href={`mailto:${content.contact_info?.email}`}>{content.contact_info?.email}</a>
                  </div>
                </li>
                <li className="flex items-center gap-sm">
                  <span className="material-symbols-outlined text-secondary" data-icon="phone">phone</span>
                  <div>
                    <p className="font-label-md text-label-md text-on-surface">Phone</p>
                    <a className="font-body-md text-body-md text-secondary hover:underline" href={`tel:${content.contact_info?.phone}`}>{content.contact_info?.phone}</a>
                  </div>
                </li>
              </ul>
            </div>

            {/* Map Section */}
            <div className="w-full h-64 bg-surface-container-high rounded-lg overflow-hidden border border-outline-variant flex items-center justify-center relative">
              {content.map_embed_url ? (
                <iframe 
                  src={content.map_embed_url} 
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen="" 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Interactive Map"
                ></iframe>
              ) : (
                <>
                  <img className="object-cover w-full h-full absolute inset-0 opacity-80" data-alt="Map" src={content.map_image} />
                  <div className="absolute inset-0 bg-surface-container-high/20 backdrop-blur-[2px] flex items-center justify-center pointer-events-none">
                    <div className="bg-surface/90 px-4 py-2 rounded shadow-sm border border-outline-variant flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary" data-icon="map">map</span>
                      <span className="font-label-md text-label-md text-on-surface">Interactive Map Not Set</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest dark:bg-surface-dim w-full mt-xl border-t border-outline-variant dark:border-outline">
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
          <div className="flex flex-wrap justify-center gap-sm">
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Privacy Policy</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Terms of Service</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">Accessibility</Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant dark:text-on-tertiary-fixed-variant hover:underline hover:text-secondary opacity-80 hover:opacity-100 transition-opacity" to="#">IT Support</Link>
          </div>
        </div>
      </footer>
    </>
  );
}

export default Contact;
