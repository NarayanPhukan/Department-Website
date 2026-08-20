import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export default function StudentSyllabus({ applications }) {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      if (!applications || applications.length === 0) {
        setLoading(false);
        return;
      }
      
      const subjectIds = applications.map(app => app.subject_id).filter(id => id != null);
      
      if (subjectIds.length === 0) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .in('id', subjectIds);
        
      if (!error && data) {
        setSubjects(data);
      }
      setLoading(false);
    };

    fetchSubjects();
  }, [applications]);

  if (loading) {
    return <div className="p-xl text-center text-on-surface-variant font-body-md">Loading your syllabus...</div>;
  }

  if (subjects.length === 0) {
    return (
      <div className="p-xl">
        <h2 className="font-headline-lg text-primary mb-md">My Syllabus</h2>
        <div className="bg-surface-container-lowest p-xl rounded-xl border border-outline-variant shadow-sm text-center">
          <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-sm">menu_book</span>
          <p className="font-body-lg text-on-surface-variant">You have not applied for any specific subjects yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-xl animate-in fade-in duration-300">
      <h2 className="font-headline-lg text-primary mb-2">My Syllabus</h2>
      <p className="font-body-md text-on-surface-variant mb-8">Access the curriculum and teacher information for all your applied subjects.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {subjects.map(subject => (
          <div key={subject.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-level-2 transition-all flex flex-col group h-full">
            <div className="h-32 relative overflow-hidden bg-surface-container">
              {subject.image_url ? (
                <img src={subject.image_url} alt={subject.name} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant opacity-20">subject</span>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>
              <div className="absolute bottom-sm left-sm right-sm">
                <div className="flex gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-label-sm font-bold bg-secondary text-on-secondary uppercase">{subject.code}</span>
                  {subject.credits && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-label-sm font-bold bg-surface/20 text-white border border-white/30 backdrop-blur-sm uppercase">{subject.credits} Credits</span>
                  )}
                </div>
                <h3 className="font-headline-sm text-white font-bold leading-tight line-clamp-1">{subject.name}</h3>
              </div>
            </div>
            
            <div className="p-md flex-1 flex flex-col">
              <div className="flex items-start gap-3 mb-4">
                <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">person</span>
                <div>
                  <p className="font-label-sm text-on-surface-variant uppercase tracking-wider text-[11px]">Subject Teacher</p>
                  <p className="font-body-md text-on-surface font-medium">{subject.instructor || 'Not assigned yet'}</p>
                </div>
              </div>
              
              <div className="mt-auto pt-sm">
                {subject.syllabus_url ? (
                  <a 
                    href={subject.syllabus_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg font-label-md transition-colors"
                  >
                    <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
                    Download Syllabus
                  </a>
                ) : (
                  <button disabled className="flex items-center justify-center gap-2 w-full py-2 bg-surface-container text-on-surface-variant rounded-lg font-label-md cursor-not-allowed">
                    <span className="material-symbols-outlined text-[18px]">block</span>
                    Syllabus Unavailable
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
