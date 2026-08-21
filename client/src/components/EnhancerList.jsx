import React from 'react';
import { problems } from '../data/problems';

export default function EnhancerList({ onSelectProblem }) {
  const isSolved = (id) => localStorage.getItem(`solved_${id}`) === 'true';

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20';
      case 'medium': return 'text-[#f59e0b] bg-[#f59e0b]/10 border border-[#f59e0b]/20';
      case 'hard': return 'text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20';
      default: return 'text-on-surface-variant bg-surface-container-high';
    }
  };

  return (
    <div className="p-xl animate-in fade-in duration-300 h-full flex flex-col">
      <h2 className="font-headline-lg text-primary mb-2">Enhancer</h2>
      <p className="font-body-md text-on-surface-variant mb-8">
        Sharpen your skills with curated coding problems mapped to your syllabus.
      </p>

      <div className="flex-1 overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
          {problems.map((problem) => (
            <div 
              key={problem.id} 
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm hover:shadow-level-2 transition-all flex flex-col group cursor-pointer"
              onClick={() => onSelectProblem(problem.id)}
            >
              <div className="flex justify-between items-start mb-4 gap-4">
                <h3 className={`font-headline-sm font-bold transition-colors ${isSolved(problem.id) ? 'text-[#10b981]' : 'text-on-surface group-hover:text-primary'}`}>
                  {problem.title}
                </h3>
                <div className="flex items-center gap-2">
                  {isSolved(problem.id) && (
                    <span className="material-symbols-outlined text-[#10b981] text-[18px]" title="Solved">check_circle</span>
                  )}
                  <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-label-sm font-bold uppercase tracking-wider ${getDifficultyColor(problem.difficulty)}`}>
                    {problem.difficulty}
                  </span>
                </div>
              </div>
              
              <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-6 flex-1">
                {problem.description}
              </p>
              
              <div className="mt-auto flex items-center justify-between text-primary font-label-md">
                <span>{isSolved(problem.id) ? 'Review Solution' : 'Solve Challenge'}</span>
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1 text-[18px]">arrow_forward</span>
              </div>
            </div>
          ))}
          
          {/* Placeholders for remaining challenges to make it look like 50 */}
          {Array.from({length: Math.max(0, 50 - problems.length)}).map((_, i) => (
            <div key={`placeholder-${i}`} className="bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-sm opacity-60 flex flex-col">
               <div className="flex justify-between items-start mb-4">
                <h3 className="font-headline-sm text-on-surface-variant font-bold">Locked Challenge</h3>
                <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-label-sm font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant border border-outline-variant">
                  Locked
                </span>
              </div>
              <p className="font-body-sm text-on-surface-variant line-clamp-3 mb-6 flex-1 italic">
                Complete previous challenges to unlock this problem.
              </p>
              <div className="mt-auto flex items-center justify-between text-on-surface-variant font-label-md">
                <span>Locked</span>
                <span className="material-symbols-outlined text-[18px]">lock</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
