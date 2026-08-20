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
