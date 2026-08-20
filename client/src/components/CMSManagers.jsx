import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function HeroManager({ pages, onSaved }) {
  const [hero, setHero] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const homePage = pages.find(p => p.slug === 'home');
    if (homePage && homePage.content) {
      setHero(homePage.content.hero || { title: '', subtitle: '', bg_image: '' });
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleRemoveImage = () => {
    setHero(prev => ({ ...prev, bg_image: '' }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      
      let bg_image = hero.bg_image;
      const file = formData.get('bg_image');
      if (file && file.size > 0) bg_image = await uploadImage(file);

      const homePage = pages.find(p => p.slug === 'home');
      const updatedContent = {
        ...homePage.content,
        hero: {
          title: formData.get('title'),
          subtitle: formData.get('subtitle'),
          bg_image
        }
      };

      const { error } = await supabase.from('pages').update({ content: updatedContent }).eq('slug', 'home');
      if (error) throw error;
      alert('Hero section updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  if (!hero) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Hero Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the main hero banner on the home page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant flex flex-col gap-md max-w-2xl">
        <div>
          <label className="block font-label-md mb-2">Title</label>
          <input name="title" defaultValue={hero.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>
        <div>
          <label className="block font-label-md mb-2">Subtitle</label>
          <textarea name="subtitle" defaultValue={hero.subtitle} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
        </div>
        <div>
          <label className="block font-label-md mb-2">Background Image</label>
          <input name="bg_image" type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
          {hero.bg_image && (
            <div className="mt-2 relative inline-block">
              <img src={hero.bg_image} alt="Preview" className="h-24 rounded border border-outline" />
              <button type="button" onClick={handleRemoveImage} className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md" title="Remove Image">&times;</button>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-sm">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all">
            {isSaving ? 'Saving...' : 'Save Hero Info'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function HighlightsManager({ pages, onSaved }) {
  const [title, setTitle] = useState('');
  const [highlightsList, setHighlightsList] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const homePage = pages.find(p => p.slug === 'home');
    if (homePage && homePage.content) {
      setTitle(homePage.content.highlights_title || 'Department Highlights');
      
      let initialList = homePage.content.highlights_list;
      if (!initialList) {
        initialList = [];
        const content = homePage.content;
        if (content.large_highlight) initialList.push({ ...content.large_highlight });
        if (content.small_highlight_1) initialList.push({ ...content.small_highlight_1 });
        if (content.small_highlight_2) initialList.push({ ...content.small_highlight_2 });
        if (content.medium_highlight) initialList.push({ ...content.medium_highlight });
      }
      setHighlightsList(initialList);
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    
    const res = await fetch(uploadUrl, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleAddHighlight = () => {
    setHighlightsList([...highlightsList, { title: '', description: '', bg_image: '' }]);
  };

  const handleRemoveHighlight = (index) => {
    setHighlightsList(highlightsList.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    const newList = [...highlightsList];
    newList[index] = { ...newList[index], bg_image: '' };
    setHighlightsList(newList);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      
      const updatedList = await Promise.all(highlightsList.map(async (highlight, index) => {
        let bg_image = highlight.bg_image;
        const file = formData.get(`image_${index}`);
        if (file && file.size > 0) bg_image = await uploadImage(file);

        return {
          title: formData.get(`title_${index}`),
          description: formData.get(`description_${index}`),
          bg_image
        };
      }));

      const homePage = pages.find(p => p.slug === 'home');
      const updatedContent = {
        ...homePage.content,
        highlights_title: formData.get('highlights_title'),
        highlights_list: updatedList
      };

      delete updatedContent.large_highlight;
      delete updatedContent.small_highlight_1;
      delete updatedContent.small_highlight_2;
      delete updatedContent.medium_highlight;

      const { error } = await supabase.from('pages').update({ content: updatedContent }).eq('slug', 'home');
      if (error) throw error;
      alert('Highlights updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  if (highlightsList === null) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Highlights Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the highlights displayed on the home page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-lg pb-xl">
        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant">
          <label className="block font-label-md mb-2">Section Title</label>
          <input name="highlights_title" defaultValue={title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>

        <div className="flex justify-between items-center mt-sm">
          <h3 className="font-headline-md text-primary">Highlights Items</h3>
          <button type="button" onClick={handleAddHighlight} className="bg-secondary text-on-secondary px-md py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all flex items-center gap-xs">
            <span className="material-symbols-outlined text-[18px]">add</span> Add Highlight
          </button>
        </div>

        {highlightsList.map((highlight, index) => (
          <div key={index} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md relative group">
            <button type="button" onClick={() => handleRemoveHighlight(index)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Highlight">
              <span className="material-symbols-outlined">delete</span>
            </button>
            <h4 className="col-span-full font-label-lg text-secondary border-b border-outline-variant pb-2">Highlight {index + 1}</h4>
            
            <div>
              <label className="block font-label-md mb-2">Title</label>
              <input name={`title_${index}`} defaultValue={highlight.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
            </div>
            
            <div>
              <label className="block font-label-md mb-2">Background Image</label>
              <input name={`image_${index}`} type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
              {highlight.bg_image && (
                <div className="mt-2 relative inline-block">
                  <img src={highlight.bg_image} alt="Preview" className="h-16 rounded border border-outline" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md" title="Remove Image">&times;</button>
                </div>
              )}
            </div>

            <div className="col-span-full">
              <label className="block font-label-md mb-2">Description</label>
              <textarea name={`description_${index}`} defaultValue={highlight.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-md">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all">
            {isSaving ? 'Saving...' : 'Save Highlights'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function ContactManager({ pages, onSaved }) {
  const [contact, setContact] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const contactPage = pages.find(p => p.slug === 'contact');
    if (contactPage && contactPage.content) {
      setContact({
        ...(contactPage.content.contact_info || { title: '', address: '', email: '', phone: '' }),
        map_embed_url: contactPage.content.map_embed_url || ''
      });
    }
  }, [pages]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      const contactPage = pages.find(p => p.slug === 'contact');
      const updatedContent = {
        ...contactPage.content,
        map_embed_url: formData.get('map_embed_url'),
        contact_info: {
          title: formData.get('title'),
          address: formData.get('address'),
          email: formData.get('email'),
          phone: formData.get('phone')
        }
      };

      const { error } = await supabase.from('pages').update({ content: updatedContent }).eq('slug', 'contact');
      if (error) throw error;
      alert('Contact information updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  if (!contact) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Contact Info Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the direct contact information displayed on the Contact page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="bg-surface-container-lowest p-lg rounded-xl border border-outline-variant flex flex-col gap-md max-w-2xl">
        <div>
          <label className="block font-label-md mb-2">Section Title</label>
          <input name="title" defaultValue={contact.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>
        <div>
          <label className="block font-label-md mb-2">Email Address</label>
          <input name="email" type="email" defaultValue={contact.email} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>
        <div>
          <label className="block font-label-md mb-2">Phone Number</label>
          <input name="phone" defaultValue={contact.phone} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>
        <div>
          <label className="block font-label-md mb-2">Physical Address</label>
          <textarea name="address" defaultValue={contact.address} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="4" required></textarea>
        </div>
        <div>
          <label className="block font-label-md mb-2">Google Maps Embed URL</label>
          <input name="map_embed_url" defaultValue={contact.map_embed_url} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" placeholder="e.g. https://www.google.com/maps/embed?..." />
          <p className="text-body-sm text-on-surface-variant mt-1">To get this link, go to Google Maps, search for your location, click 'Share', then 'Embed a map', and copy the URL inside the 'src' attribute.</p>
        </div>
        <div className="flex justify-end mt-sm">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all">
            {isSaving ? 'Saving...' : 'Save Contact Info'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function EventsManager({ pages, onSaved }) {
  const [events, setEvents] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const homePage = pages.find(p => p.slug === 'home');
    if (homePage && homePage.content) {
      setEvents(homePage.content.events || []);
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleAddEvent = () => {
    setEvents([...events, { title: '', month: '', day: '', time: '', location: '', bg_image: '' }]);
  };

  const handleRemoveEvent = (index) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleRemoveImage = (index) => {
    const newList = [...events];
    newList[index] = { ...newList[index], bg_image: '' };
    setEvents(newList);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      
      const updatedList = await Promise.all(events.map(async (ev, index) => {
        let bg_image = ev.bg_image;
        const file = formData.get(`image_${index}`);
        if (file && file.size > 0) bg_image = await uploadImage(file);

        return {
          title: formData.get(`title_${index}`),
          month: formData.get(`month_${index}`),
          day: formData.get(`day_${index}`),
          time: formData.get(`time_${index}`),
          location: formData.get(`location_${index}`),
          bg_image
        };
      }));

      const homePage = pages.find(p => p.slug === 'home');
      const updatedContent = {
        ...homePage.content,
        events: updatedList
      };

      delete updatedContent.news;

      const { error } = await supabase.from('pages').update({ content: updatedContent }).eq('slug', 'home');
      if (error) throw error;
      alert('Events updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  if (events === null) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Events Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the events displayed on the home page.</p>
        </div>
        <button type="button" onClick={handleAddEvent} className="bg-secondary text-on-secondary px-md py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all flex items-center gap-xs">
          <span className="material-symbols-outlined text-[18px]">add</span> Add Event
        </button>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-lg pb-xl">
        {events.map((ev, index) => (
          <div key={index} className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md relative group">
            <button type="button" onClick={() => handleRemoveEvent(index)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Event">
              <span className="material-symbols-outlined">delete</span>
            </button>
            <h4 className="col-span-full font-label-lg text-secondary border-b border-outline-variant pb-2">Event {index + 1}</h4>
            
            <div className="col-span-full">
              <label className="block font-label-md mb-2">Event Title</label>
              <input name={`title_${index}`} defaultValue={ev.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
            </div>
            
            <div>
              <label className="block font-label-md mb-2">Month (e.g. OCT)</label>
              <input name={`month_${index}`} defaultValue={ev.month} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
            </div>

            <div>
              <label className="block font-label-md mb-2">Day (e.g. 18)</label>
              <input name={`day_${index}`} defaultValue={ev.day} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
            </div>

            <div>
              <label className="block font-label-md mb-2">Time (e.g. 10:00 AM - 4:00 PM)</label>
              <input name={`time_${index}`} defaultValue={ev.time} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
            </div>

            <div>
              <label className="block font-label-md mb-2">Location</label>
              <input name={`location_${index}`} defaultValue={ev.location} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
            </div>

            <div className="col-span-full">
              <label className="block font-label-md mb-2">Event Image</label>
              <input name={`image_${index}`} type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
              {ev.bg_image && (
                <div className="mt-2 relative inline-block">
                  <img src={ev.bg_image} alt="Preview" className="h-16 rounded border border-outline" />
                  <button type="button" onClick={() => handleRemoveImage(index)} className="absolute -top-2 -right-2 bg-error text-on-error rounded-full w-6 h-6 flex items-center justify-center text-sm shadow-md" title="Remove Image">&times;</button>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="flex justify-end mt-md">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-lg py-sm rounded-lg font-label-md shadow-sm hover:shadow transition-all">
            {isSaving ? 'Saving...' : 'Save Events'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AboutManager({ pages, onSaved }) {
  const [content, setContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const aboutPage = pages.find(p => p.slug === 'about');
    if (aboutPage && aboutPage.content) {
      setContent(aboutPage.content);
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      const newContent = { ...content };

      let heroImage = content.hero?.image || '';
      const heroFile = formData.get('hero_image');
      if (heroFile && heroFile.size > 0) heroImage = await uploadImage(heroFile);
      
      newContent.hero = {
        title: formData.get('hero_title'),
        description: formData.get('hero_desc'),
        image: heroImage
      };

      newContent.history_title = formData.get('history_title');
      const updatedHistory = await Promise.all((content.history || []).map(async (item, idx) => {
        return {
          title: formData.get(`hist_title_${idx}`),
          description: formData.get(`hist_desc_${idx}`),
          year: formData.get(`hist_year_${idx}`),
          isLarge: formData.get(`hist_large_${idx}`) === 'on'
        };
      }));
      newContent.history = updatedHistory;

      const updatedFaculty = await Promise.all((content.faculty || []).map(async (fac, idx) => {
        let facImage = fac.image || '';
        const facFile = formData.get(`fac_img_${idx}`);
        if (facFile && facFile.size > 0) facImage = await uploadImage(facFile);

        return {
          name: formData.get(`fac_name_${idx}`),
          title: formData.get(`fac_title_${idx}`),
          desc: formData.get(`fac_desc_${idx}`),
          image: facImage
        };
      }));
      newContent.faculty = updatedFaculty;

      const updatedResearch = await Promise.all((content.research || []).map(async (res, idx) => {
        return {
          title: formData.get(`res_title_${idx}`),
          desc: formData.get(`res_desc_${idx}`),
          icon: formData.get(`res_icon_${idx}`)
        };
      }));
      newContent.research = updatedResearch;

      const { error } = await supabase.from('pages').update({ content: newContent }).eq('slug', 'about');
      if (error) throw error;
      alert('About page updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  const handleAddHistory = () => setContent(prev => ({ ...prev, history: [...(prev.history || []), { title: '', description: '', year: '', isLarge: false }] }));
  const handleRemoveHistory = (idx) => setContent(prev => ({ ...prev, history: prev.history.filter((_, i) => i !== idx) }));
  
  const handleAddFaculty = () => setContent(prev => ({ ...prev, faculty: [...(prev.faculty || []), { name: '', title: '', desc: '', image: '' }] }));
  const handleRemoveFaculty = (idx) => setContent(prev => ({ ...prev, faculty: prev.faculty.filter((_, i) => i !== idx) }));
  
  const handleAddResearch = () => setContent(prev => ({ ...prev, research: [...(prev.research || []), { title: '', desc: '', icon: 'science' }] }));
  const handleRemoveResearch = (idx) => setContent(prev => ({ ...prev, research: prev.research.filter((_, i) => i !== idx) }));

  if (!content) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">About Page Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the content of the About page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-xl pb-xl">
        {/* Hero Section */}
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h4 className="col-span-full font-label-lg text-secondary border-b border-outline-variant pb-2">Hero Section</h4>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Title</label>
            <input name="hero_title" defaultValue={content.hero?.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="hero_desc" defaultValue={content.hero?.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Hero Image</label>
            <input name="hero_image" type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
            {content.hero?.image && (
              <div className="mt-2 relative inline-block">
                <img src={content.hero.image} alt="Preview" className="h-16 rounded border border-outline" />
              </div>
            )}
          </div>
        </section>

        {/* History Section */}
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h4 className="font-label-lg text-secondary">History Timeline</h4>
            <button type="button" onClick={handleAddHistory} className="bg-secondary text-on-secondary px-sm py-1 rounded-lg text-xs flex items-center gap-1 hover:opacity-90">
              <span className="material-symbols-outlined text-[14px]">add</span> Add History
            </button>
          </div>
          <div>
            <label className="block font-label-md mb-2">Timeline Title</label>
            <input name="history_title" defaultValue={content.history_title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          {(content.history || []).map((item, idx) => (
            <div key={idx} className="bg-surface p-md rounded-xl border border-outline grid grid-cols-1 md:grid-cols-2 gap-md relative group">
              <button type="button" onClick={() => handleRemoveHistory(idx)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove History">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="col-span-full pr-8">
                <label className="block font-label-md mb-2">Item Title</label>
                <input name={`hist_title_${idx}`} defaultValue={item.title} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div className="col-span-full">
                <label className="block font-label-md mb-2">Description</label>
                <textarea name={`hist_desc_${idx}`} defaultValue={item.description} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
              </div>
              <div>
                <label className="block font-label-md mb-2">Year</label>
                <input name={`hist_year_${idx}`} defaultValue={item.year} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div className="flex items-center gap-2 mt-auto pb-2">
                <input type="checkbox" name={`hist_large_${idx}`} defaultChecked={item.isLarge} id={`hist_large_${idx}`} className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary" />
                <label htmlFor={`hist_large_${idx}`} className="font-label-md">Is Large (Takes 2 columns)</label>
              </div>
            </div>
          ))}
        </section>

        {/* Faculty Section */}
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h4 className="font-label-lg text-secondary">Faculty</h4>
            <button type="button" onClick={handleAddFaculty} className="bg-secondary text-on-secondary px-sm py-1 rounded-lg text-xs flex items-center gap-1 hover:opacity-90">
              <span className="material-symbols-outlined text-[14px]">add</span> Add Faculty
            </button>
          </div>
          {(content.faculty || []).map((fac, idx) => (
            <div key={idx} className="bg-surface p-md rounded-xl border border-outline grid grid-cols-1 md:grid-cols-2 gap-md relative group">
              <button type="button" onClick={() => handleRemoveFaculty(idx)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Faculty">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="col-span-full pr-8">
                <label className="block font-label-md mb-2">Name</label>
                <input name={`fac_name_${idx}`} defaultValue={fac.name} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">Title</label>
                <input name={`fac_title_${idx}`} defaultValue={fac.title} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">Profile Image</label>
                <input name={`fac_img_${idx}`} type="file" accept="image/*" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2" />
                {fac.image && (
                  <div className="mt-2 relative inline-block">
                    <img src={fac.image} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-outline" />
                  </div>
                )}
              </div>
              <div className="col-span-full">
                <label className="block font-label-md mb-2">Description</label>
                <textarea name={`fac_desc_${idx}`} defaultValue={fac.desc} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
              </div>
            </div>
          ))}
        </section>

        {/* Research Section */}
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h4 className="font-label-lg text-secondary">Core Research Areas</h4>
            <button type="button" onClick={handleAddResearch} className="bg-secondary text-on-secondary px-sm py-1 rounded-lg text-xs flex items-center gap-1 hover:opacity-90">
              <span className="material-symbols-outlined text-[14px]">add</span> Add Research Area
            </button>
          </div>
          {(content.research || []).map((res, idx) => (
            <div key={idx} className="bg-surface p-md rounded-xl border border-outline grid grid-cols-1 md:grid-cols-2 gap-md relative group">
              <button type="button" onClick={() => handleRemoveResearch(idx)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Research">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="col-span-full pr-8">
                <label className="block font-label-md mb-2">Area Title</label>
                <input name={`res_title_${idx}`} defaultValue={res.title} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">Google Material Icon Name</label>
                <input name={`res_icon_${idx}`} defaultValue={res.icon} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none font-code-sm" required />
              </div>
              <div className="col-span-full">
                <label className="block font-label-md mb-2">Description</label>
                <textarea name={`res_desc_${idx}`} defaultValue={res.desc} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-end mt-sm sticky bottom-4 z-10">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-xl py-md rounded-xl font-headline-sm shadow-level-2 hover:shadow-level-3 transition-all">
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function AlumniManager({ pages, onSaved }) {
  const [content, setContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const alumniPage = pages.find(p => p.slug === 'alumni');
    if (alumniPage && alumniPage.content) {
      setContent(alumniPage.content);
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      const newContent = { ...content };

      newContent.hero = {
        title: formData.get('hero_title'),
        description: formData.get('hero_desc'),
      };

      const updatedAlumni = await Promise.all((content.alumni_list || []).map(async (alum, idx) => {
        let alumImage = alum.image || '';
        const alumFile = formData.get(`alum_img_${idx}`);
        if (alumFile && alumFile.size > 0) alumImage = await uploadImage(alumFile);

        return {
          name: formData.get(`alum_name_${idx}`),
          grad_year: formData.get(`alum_year_${idx}`),
          gpa: formData.get(`alum_gpa_${idx}`),
          profession: formData.get(`alum_profession_${idx}`),
          employment_type: formData.get(`alum_type_${idx}`),
          company: formData.get(`alum_company_${idx}`),
          linkedin: formData.get(`alum_linkedin_${idx}`),
          image: alumImage
        };
      }));
      newContent.alumni_list = updatedAlumni;

      const { error } = await supabase.from('pages').update({ content: newContent }).eq('slug', 'alumni');
      if (error) throw error;
      alert('Alumni page updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  const handleAddAlumni = () => setContent(prev => ({ ...prev, alumni_list: [...(prev.alumni_list || []), { name: '', grad_year: '', gpa: '', profession: '', employment_type: 'private', company: '', linkedin: '', image: '' }] }));
  const handleRemoveAlumni = (idx) => setContent(prev => ({ ...prev, alumni_list: prev.alumni_list.filter((_, i) => i !== idx) }));
  
  if (!content) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Alumni Page Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the content of the Alumni page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-xl pb-xl">
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h4 className="col-span-full font-label-lg text-secondary border-b border-outline-variant pb-2">Hero Section</h4>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Title</label>
            <input name="hero_title" defaultValue={content.hero?.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="hero_desc" defaultValue={content.hero?.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h4 className="font-label-lg text-secondary">Alumni Directory</h4>
            <button type="button" onClick={handleAddAlumni} className="bg-secondary text-on-secondary px-sm py-1 rounded-lg text-xs flex items-center gap-1 hover:opacity-90">
              <span className="material-symbols-outlined text-[14px]">add</span> Add Alumni
            </button>
          </div>
          {(content.alumni_list || []).map((alum, idx) => (
            <div key={idx} className="bg-surface p-md rounded-xl border border-outline grid grid-cols-1 md:grid-cols-2 gap-md relative group">
              <button type="button" onClick={() => handleRemoveAlumni(idx)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Alumni">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="col-span-full pr-8">
                <label className="block font-label-md mb-2">Name</label>
                <input name={`alum_name_${idx}`} defaultValue={alum.name} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">Graduation Year</label>
                <input name={`alum_year_${idx}`} defaultValue={alum.grad_year} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">GPA</label>
                <input name={`alum_gpa_${idx}`} defaultValue={alum.gpa} type="number" step="0.01" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block font-label-md mb-2">Profession</label>
                <input name={`alum_profession_${idx}`} defaultValue={alum.profession} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">Employment Type</label>
                <select name={`alum_type_${idx}`} defaultValue={alum.employment_type || 'private'} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none">
                  <option value="private">Private</option>
                  <option value="government">Government</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md mb-2">Company / Organization</label>
                <input name={`alum_company_${idx}`} defaultValue={alum.company} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              <div>
                <label className="block font-label-md mb-2">LinkedIn URL</label>
                <input name={`alum_linkedin_${idx}`} defaultValue={alum.linkedin} type="url" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" />
              </div>
              <div>
                <label className="block font-label-md mb-2">Profile Image</label>
                <input name={`alum_img_${idx}`} type="file" accept="image/*" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2" />
                {alum.image && (
                  <div className="mt-2 relative inline-block">
                    <img src={alum.image} alt="Preview" className="h-12 w-12 rounded-full object-cover border border-outline" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-end mt-sm sticky bottom-4 z-10">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-xl py-md rounded-xl font-headline-sm shadow-level-2 hover:shadow-level-3 transition-all">
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

export function BatchesManager({ pages, onSaved }) {
  const [content, setContent] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const batchesPage = pages.find(p => p.slug === 'batches');
    if (batchesPage && batchesPage.content) {
      setContent(batchesPage.content);
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
    const uploadUrl = apiUrl.endsWith('/') ? `${apiUrl}upload` : `${apiUrl}/upload`;
    const res = await fetch(uploadUrl, { method: 'POST', body: formData });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      const newContent = { ...content };

      newContent.hero = {
        title: formData.get('hero_title'),
        description: formData.get('hero_desc'),
      };

      const updatedBatches = await Promise.all((content.batches || []).map(async (batch, idx) => {
        let batchImage = batch.image || '';
        const batchFile = formData.get(`batch_img_${idx}`);
        if (batchFile && batchFile.size > 0) batchImage = await uploadImage(batchFile);

        return {
          year: formData.get(`batch_year_${idx}`),
          name: formData.get(`batch_name_${idx}`),
          student_count: parseInt(formData.get(`batch_count_${idx}`), 10) || 0,
          description: formData.get(`batch_desc_${idx}`),
          image: batchImage
        };
      }));
      
      // Sort batches by year descending
      updatedBatches.sort((a, b) => b.year.localeCompare(a.year));
      newContent.batches = updatedBatches;

      const { error } = await supabase.from('pages').update({ content: newContent }).eq('slug', 'batches');
      if (error) throw error;
      alert('Batches page updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  const handleAddBatch = () => setContent(prev => ({ ...prev, batches: [{ year: '', name: '', student_count: 0, description: '', image: '' }, ...(prev.batches || [])] }));
  const handleRemoveBatch = (idx) => setContent(prev => ({ ...prev, batches: prev.batches.filter((_, i) => i !== idx) }));
  
  if (!content) return <div>Loading...</div>;

  return (
    <div className="animate-in fade-in duration-300">
      <header className="flex justify-between items-end border-b border-outline-variant pb-sm mb-lg">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Batches Page Management</h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-xs">Manage the content of the Our Batches page.</p>
        </div>
      </header>

      <form onSubmit={handleSave} className="flex flex-col gap-xl pb-xl">
        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h4 className="col-span-full font-label-lg text-secondary border-b border-outline-variant pb-2">Hero Section</h4>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Title</label>
            <input name="hero_title" defaultValue={content.hero?.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="hero_desc" defaultValue={content.hero?.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
          </div>
        </section>

        <section className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant flex flex-col gap-md">
          <div className="flex justify-between items-center border-b border-outline-variant pb-2">
            <h4 className="font-label-lg text-secondary">Batches Directory</h4>
            <button type="button" onClick={handleAddBatch} className="bg-secondary text-on-secondary px-sm py-1 rounded-lg text-xs flex items-center gap-1 hover:opacity-90">
              <span className="material-symbols-outlined text-[14px]">add</span> Add Batch
            </button>
          </div>
          {(content.batches || []).map((batch, idx) => (
            <div key={idx} className="bg-surface p-md rounded-xl border border-outline grid grid-cols-1 md:grid-cols-2 gap-md relative group">
              <button type="button" onClick={() => handleRemoveBatch(idx)} className="absolute top-md right-md text-error hover:bg-error-container p-1 rounded transition-colors" title="Remove Batch">
                <span className="material-symbols-outlined">delete</span>
              </button>
              
              <div>
                <label className="block font-label-md mb-2">Year</label>
                <input name={`batch_year_${idx}`} defaultValue={batch.year} placeholder="e.g. 2023 or 2019-2023" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              
              <div>
                <label className="block font-label-md mb-2">Name / Title</label>
                <input name={`batch_name_${idx}`} defaultValue={batch.name} placeholder="e.g. Class of 2023" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              
              <div>
                <label className="block font-label-md mb-2">Student Count</label>
                <input name={`batch_count_${idx}`} defaultValue={batch.student_count} type="number" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
              </div>
              
              <div>
                <label className="block font-label-md mb-2">Group Image</label>
                <input name={`batch_img_${idx}`} type="file" accept="image/*" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2" />
                {batch.image && (
                  <div className="mt-2 relative inline-block">
                    <img src={batch.image} alt="Preview" className="h-16 w-auto rounded object-cover border border-outline" />
                  </div>
                )}
              </div>
              
              <div className="col-span-full">
                <label className="block font-label-md mb-2">Description</label>
                <textarea name={`batch_desc_${idx}`} defaultValue={batch.description} rows="2" className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required></textarea>
              </div>
            </div>
          ))}
        </section>

        <div className="flex justify-end mt-sm sticky bottom-4 z-10">
          <button type="submit" disabled={isSaving} className="bg-primary text-on-primary px-xl py-md rounded-xl font-headline-sm shadow-level-2 hover:shadow-level-3 transition-all">
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
