import React, { useState } from 'react';
import Editor from '@monaco-editor/react';

export default function EnhancerSolver({ problem, onBack }) {
  const [code, setCode] = useState(problem.starter_code);
  const [isRunning, setIsRunning] = useState(false);
  const [testResults, setTestResults] = useState(null);

  const getDifficultyColor = (difficulty) => {
    switch(difficulty.toLowerCase()) {
      case 'easy': return 'text-[#10b981]';
      case 'medium': return 'text-[#f59e0b]';
      case 'hard': return 'text-[#ef4444]';
      default: return 'text-on-surface-variant';
    }
  };

  const handleRunTests = async () => {
    setIsRunning(true);
    setTestResults({ status: 'running' });

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/';
      const parsedTests = [];
      let passedCount = 0;
      let hasCompileError = false;

      for (const testCase of problem.test_cases) {
        const response = await fetch(`${apiUrl}execute`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language: 'c', // Defaulting to C
            source: code,
            input: testCase.input
          })
        });

        const data = await response.json();

        if (data.error) {
          setTestResults({ status: 'error', message: data.error });
          setIsRunning(false);
          return;
        }

        if (data.run && data.run.stderr) {
          hasCompileError = true;
          setTestResults({ status: 'error', message: data.run.stderr });
          setIsRunning(false);
          return;
        }

        if (data.run) {
          const outText = (data.run.output || '').trim();
          const isPass = outText === testCase.expected_output.trim();
          
          if (isPass) {
            passedCount++;
          }

          parsedTests.push({
            status: isPass ? 'pass' : 'fail',
            name: testCase.name,
            details: `Expected: ${testCase.expected_output.trim()} | Got: ${outText}`
          });
        } else {
          setTestResults({ status: 'error', message: 'Unknown error occurred.' });
          setIsRunning(false);
          return;
        }
      }

      const summary = { passed: passedCount, total: problem.test_cases.length };
      setTestResults({
        status: 'success',
        tests: parsedTests,
        summary: summary
      });

      // Mark as solved if all tests pass
      if (passedCount === problem.test_cases.length) {
        const solvedKey = `solved_${problem.id}`;
        localStorage.setItem(solvedKey, 'true');
      }

    } catch (err) {
      setTestResults({ status: 'error', message: err.message });
    }
    
    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] text-[#cccccc] font-body-md animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-[#252526] h-14 border-b border-[#333] flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="hover:text-white transition-colors flex items-center gap-1 text-sm bg-transparent border-none cursor-pointer p-0 m-0 outline-none">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to List
          </button>
          <div className="w-[1px] h-6 bg-[#333]"></div>
          <h2 className="font-bold text-white text-sm">{problem.title}</h2>
        </div>
        <button 
          onClick={handleRunTests}
          disabled={isRunning}
          className="flex items-center gap-2 bg-[#10b981] hover:bg-[#059669] text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-50 border-none cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">
            {isRunning ? 'hourglass_empty' : 'play_arrow'}
          </span>
          {isRunning ? 'Running Tests...' : 'Submit & Run Tests'}
        </button>
      </div>

      {/* Main Split */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        
        {/* Left: Problem Description */}
        <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-[#333] flex flex-col bg-[#1e1e1e]">
          <div className="text-xs text-gray-400 px-4 py-2 border-b border-[#333] bg-[#252526] font-mono flex items-center gap-2 shrink-0">
            <span className="material-symbols-outlined text-[14px]">description</span>
            PROBLEM DESCRIPTION
          </div>
          <div className="p-6 overflow-y-auto flex-1">
            <h1 className="text-xl font-bold text-white mb-2">{problem.title}</h1>
            <div className={`text-sm font-bold mb-6 ${getDifficultyColor(problem.difficulty)}`}>
              {problem.difficulty}
            </div>
            
            <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap text-gray-300">
              {problem.description}
            </div>
            
            {problem.examples && problem.examples.length > 0 && (
              <div className="mt-8">
                <h3 className="text-sm font-bold text-white mb-3">Examples</h3>
                <div className="flex flex-col gap-4">
                  {problem.examples.map((ex, idx) => (
                    <div key={idx} className="bg-[#252526] p-3 rounded border border-[#333]">
                      <p className="text-sm mb-1"><strong className="text-gray-400">Input:</strong> <span className="font-mono text-[#d4d4d4]">{ex.input}</span></p>
                      <p className="text-sm"><strong className="text-gray-400">Output:</strong> <span className="font-mono text-[#d4d4d4]">{ex.output}</span></p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Code Editor & Results */}
        <div className="w-full md:w-2/3 flex flex-col bg-[#1e1e1e]">
          
          {/* Editor */}
          <div className="flex-1 flex flex-col border-b border-[#333]">
            <div className="text-xs text-gray-400 px-4 py-2 border-b border-[#333] bg-[#252526] font-mono flex items-center justify-between shrink-0">
               <div className="flex items-center gap-2">
                 <span className="material-symbols-outlined text-[14px]">code</span>
                 solution.c
               </div>
               <button onClick={() => setCode(problem.starter_code)} className="hover:text-white transition-colors border-none bg-transparent cursor-pointer p-0" title="Reset to starter code">
                  <span className="material-symbols-outlined text-[14px]">refresh</span>
               </button>
            </div>
            <div className="flex-1 relative">
              <Editor
                height="100%"
                language="c"
                theme="vs-dark"
                value={code}
                onChange={(val) => setCode(val || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
              />
            </div>
          </div>

          {/* Test Results */}
          <div className="h-[40%] flex flex-col bg-[#1e1e1e]">
            <div className="text-xs text-gray-400 px-4 py-2 border-b border-[#333] bg-[#252526] font-mono flex items-center gap-2 shrink-0">
              <span className="material-symbols-outlined text-[14px]">fact_check</span>
              TEST RESULTS
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {!testResults ? (
                <div className="text-gray-500 italic flex items-center justify-center h-full">
                  Click "Submit & Run Tests" to evaluate your solution.
                </div>
              ) : testResults.status === 'running' ? (
                <div className="text-gray-400 flex items-center justify-center h-full gap-2">
                  <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                  Executing tests...
                </div>
              ) : testResults.status === 'error' ? (
                <div className="text-[#ef4444] font-mono text-sm whitespace-pre-wrap bg-[#ef4444]/10 border border-[#ef4444]/20 p-4 rounded">
                  {testResults.message}
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                     <span className={`text-2xl font-bold ${testResults.summary.passed === testResults.summary.total ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                        {testResults.summary.passed === testResults.summary.total ? 'Accepted' : 'Wrong Answer'}
                     </span>
                     <span className="text-gray-400">
                        {testResults.summary.passed} / {testResults.summary.total} test cases passed.
                     </span>
                  </div>
                  
                  <div className="flex flex-col gap-2">
                    {testResults.tests && testResults.tests.map((test, idx) => {
                      if (test.status === 'stdout') {
                         return <div key={idx} className="font-mono text-xs text-gray-400 px-2 py-1 bg-black/30 rounded border border-white/5">stdout: {test.message}</div>;
                      }
                      
                      const isPass = test.status === 'pass';
                      return (
                        <div key={idx} className={`p-3 rounded border ${isPass ? 'bg-[#10b981]/10 border-[#10b981]/20' : 'bg-[#ef4444]/10 border-[#ef4444]/20'}`}>
                          <div className="flex items-center justify-between mb-1">
                             <div className={`font-bold text-sm ${isPass ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                                {test.name}
                             </div>
                             {isPass ? (
                                <span className="material-symbols-outlined text-[#10b981] text-[18px]">check_circle</span>
                             ) : (
                                <span className="material-symbols-outlined text-[#ef4444] text-[18px]">cancel</span>
                             )}
                          </div>
                          <div className="font-mono text-xs text-gray-300">
                             {test.details}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
