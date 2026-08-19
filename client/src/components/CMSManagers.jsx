import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function HighlightsManager({ pages, onSaved }) {
  const [highlights, setHighlights] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const homePage = pages.find(p => p.slug === 'home');
    if (homePage && homePage.content) {
      setHighlights({
        title: homePage.content.highlights_title || 'Department Highlights',
        large: homePage.content.large_highlight || { title: '', description: '', bg_image: '' },
        small1: homePage.content.small_highlight_1 || { title: '', description: '', icon: '' },
        small2: homePage.content.small_highlight_2 || { title: '', description: '', icon: '' },
        medium: homePage.content.medium_highlight || { title: '', description: '', bg_image: '' }
      });
    }
  }, [pages]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const res = await fetch('http://localhost:5000/api/upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload image');
    const data = await res.json();
    return data.url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData(e.target);
      
      let largeBg = highlights.large.bg_image;
      const largeFile = formData.get('large_image');
      if (largeFile && largeFile.size > 0) largeBg = await uploadImage(largeFile);

      let mediumBg = highlights.medium.bg_image;
      const mediumFile = formData.get('medium_image');
      if (mediumFile && mediumFile.size > 0) mediumBg = await uploadImage(mediumFile);

      const homePage = pages.find(p => p.slug === 'home');
      const updatedContent = {
        ...homePage.content,
        highlights_title: formData.get('highlights_title'),
        large_highlight: {
          title: formData.get('large_title'),
          description: formData.get('large_desc'),
          bg_image: largeBg
        },
        small_highlight_1: {
          title: formData.get('s1_title'),
          description: formData.get('s1_desc'),
          icon: formData.get('s1_icon')
        },
        small_highlight_2: {
          title: formData.get('s2_title'),
          description: formData.get('s2_desc'),
          icon: formData.get('s2_icon')
        },
        medium_highlight: {
          title: formData.get('m_title'),
          description: formData.get('m_desc'),
          bg_image: mediumBg
        }
      };

      const { error } = await supabase.from('pages').update({ content: updatedContent }).eq('slug', 'home');
      if (error) throw error;
      alert('Highlights updated successfully!');
      onSaved();
    } catch (err) {
      alert(err.message);
    }
    setIsSaving(false);
  };

  if (!highlights) return <div>Loading...</div>;

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
          <input name="highlights_title" defaultValue={highlights.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h3 className="col-span-full font-headline-md text-primary border-b border-outline-variant pb-2">Large Highlight</h3>
          <div>
            <label className="block font-label-md mb-2">Title</label>
            <input name="large_title" defaultValue={highlights.large.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div>
            <label className="block font-label-md mb-2">Background Image</label>
            <input name="large_image" type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
            {highlights.large.bg_image && <img src={highlights.large.bg_image} alt="Preview" className="mt-2 h-16 rounded border border-outline" />}
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="large_desc" defaultValue={highlights.large.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h3 className="col-span-full font-headline-md text-primary border-b border-outline-variant pb-2">Small Highlight 1</h3>
          <div>
            <label className="block font-label-md mb-2">Title</label>
            <input name="s1_title" defaultValue={highlights.small1.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div>
            <label className="block font-label-md mb-2">Icon (Material Symbol)</label>
            <input name="s1_icon" defaultValue={highlights.small1.icon} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="s1_desc" defaultValue={highlights.small1.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h3 className="col-span-full font-headline-md text-primary border-b border-outline-variant pb-2">Small Highlight 2</h3>
          <div>
            <label className="block font-label-md mb-2">Title</label>
            <input name="s2_title" defaultValue={highlights.small2.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div>
            <label className="block font-label-md mb-2">Icon (Material Symbol)</label>
            <input name="s2_icon" defaultValue={highlights.small2.icon} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="s2_desc" defaultValue={highlights.small2.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="2" required></textarea>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-md rounded-xl border border-outline-variant grid grid-cols-1 md:grid-cols-2 gap-md">
          <h3 className="col-span-full font-headline-md text-primary border-b border-outline-variant pb-2">Medium Highlight</h3>
          <div>
            <label className="block font-label-md mb-2">Title</label>
            <input name="m_title" defaultValue={highlights.medium.title} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" required />
          </div>
          <div>
            <label className="block font-label-md mb-2">Background Image</label>
            <input name="medium_image" type="file" accept="image/*" className="w-full bg-surface border border-outline-variant rounded p-2" />
            {highlights.medium.bg_image && <img src={highlights.medium.bg_image} alt="Preview" className="mt-2 h-16 rounded border border-outline" />}
          </div>
          <div className="col-span-full">
            <label className="block font-label-md mb-2">Description</label>
            <textarea name="m_desc" defaultValue={highlights.medium.description} className="w-full bg-surface border border-outline-variant rounded p-2 focus:ring-1 focus:ring-secondary focus:outline-none" rows="3" required></textarea>
          </div>
        </div>

        <div className="flex justify-end">
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
