import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

export default function RecentBuilds({ enrollmentId }) {
  const [builds, setBuilds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuilds = async () => {
      if (!enrollmentId) return;

      const { data, error } = await supabase
        .from('recent_builds')
        .select('*')
        .eq('enrollment_id', enrollmentId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (!error && data) {
        setBuilds(data);
      }
      setLoading(false);
    };

    fetchBuilds();
  }, [enrollmentId]);

  if (loading) {
    return <div className="p-xl text-center text-on-surface-variant font-body-md">Loading recent builds...</div>;
  }

  if (builds.length === 0) {
    return (
      <div className="p-xl animate-in fade-in duration-300 h-full flex flex-col">
        <h2 className="font-headline-lg text-primary mb-2">Recent Builds</h2>
        <p className="font-body-md text-on-surface-variant mb-8">View the history of code you have executed in the Coding Zone.</p>
        
        <div className="flex-1 flex flex-col items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm p-xl text-center">
          <span className="material-symbols-outlined text-[64px] text-surface-container-highest mb-4">history</span>
          <h3 className="font-headline-sm text-on-surface mb-2">No Recent Builds</h3>
          <p className="font-body-md text-on-surface-variant max-w-md">
            You haven't executed any code yet. Head over to the Coding Zone to run your first program, and it will appear here!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-xl animate-in fade-in duration-300 h-full flex flex-col">
      <h2 className="font-headline-lg text-primary mb-2">Recent Builds</h2>
      <p className="font-body-md text-on-surface-variant mb-8">View the history of code you have executed in the Coding Zone.</p>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4">
        {builds.map((build) => (
          <div key={build.id} className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-sm">
            <div className="bg-surface-container-high px-4 py-2 border-b border-outline-variant flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-label-sm font-bold bg-secondary text-on-secondary uppercase">
                  {build.language}
                </span>
                <span className="text-xs text-on-surface-variant font-mono">
                  {new Date(build.created_at).toLocaleString()}
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-outline-variant">
              <div className="p-0 bg-[#1e1e1e]">
                <div className="text-xs text-gray-400 px-4 py-1 border-b border-[#333] bg-[#252526]">Code Snippet</div>
                <pre className="p-4 text-sm font-mono text-[#d4d4d4] overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>{build.code_content}</code>
                </pre>
              </div>
              <div className="p-0 bg-[#1e1e1e]">
                <div className="text-xs text-gray-400 px-4 py-1 border-b border-[#333] bg-[#252526]">Execution Output</div>
                <pre className="p-4 text-sm font-mono text-[#4ade80] overflow-x-auto max-h-[300px] overflow-y-auto">
                  <code>{build.output}</code>
                </pre>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
