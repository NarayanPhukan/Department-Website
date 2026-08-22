import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import Editor from '@monaco-editor/react';
import { io } from 'socket.io-client';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';

function CodingZone({ isEmbedded = false, enrollmentId = null, resumeData = null }) {
  const [session, setSession] = useState(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  const [runtimes, setRuntimes] = useState([]);
  const [selectedRuntime, setSelectedRuntime] = useState(null);
  const [code, setCode] = useState('// Write your code here...');
  const [isRunning, setIsRunning] = useState(false);
  const terminalRef = useRef(null);
  const termInstance = useRef(null);
  const fitAddonInstance = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    if (resumeData && runtimes.length > 0) {
      setCode(resumeData.code);
      const matchingRuntime = runtimes.find(r => r.language.toLowerCase() === resumeData.lang.toLowerCase() || r.language === resumeData.lang);
      if (matchingRuntime) {
        setSelectedRuntime(matchingRuntime);
      }
    }
  }, [resumeData, runtimes]);

  useEffect(() => {
    // Check authentication
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Initialize xterm.js if container exists and not already initialized
    const initTerminal = () => {
      if (terminalRef.current && !termInstance.current) {
        termInstance.current = new Terminal({
          theme: { background: '#1e1e1e', foreground: '#cccccc', cursor: '#ffffff' },
          fontFamily: 'monospace',
          fontSize: 14,
          convertEol: true
        });
        fitAddonInstance.current = new FitAddon();
        termInstance.current.loadAddon(fitAddonInstance.current);
        termInstance.current.open(terminalRef.current);
        fitAddonInstance.current.fit();
        
        termInstance.current.onData(data => {
          if (socketRef.current) {
            socketRef.current.emit('input', data);
          }
          // Basic local echo
          if (data === '\r') {
            termInstance.current.write('\r\n');
          } else if (data === '\x7f') {
            termInstance.current.write('\b \b'); // Handle backspace visually
          } else {
            termInstance.current.write(data);
          }
        });
        
        termInstance.current.writeln('\x1b[3mClick "Run Code" to start interactive session...\x1b[0m');
      }
    };
    
    // Slight delay to ensure DOM is ready
    setTimeout(initTerminal, 100);

    // Resize handling
    const handleResize = () => {
      if (fitAddonInstance.current) fitAddonInstance.current.fit();
    };
    window.addEventListener('resize', handleResize);

    // Set supported local languages instead of fetching from Piston
    const localRuntimes = [
      { language: 'python', version: '3' },
      { language: 'javascript', version: 'node' },
      { language: 'java', version: 'openjdk' },
      { language: 'c', version: 'zig cc' },
      { language: 'c++', version: 'zig c++' },
      { language: 'bash', version: '5' },
      { language: 'perl', version: '5' }
    ];
    setRuntimes(localRuntimes);
    setSelectedRuntime(localRuntimes[0]);
    setCode('print("Hello from the Coding Zone!")');

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('resize', handleResize);
      if (socketRef.current) socketRef.current.disconnect();
      if (termInstance.current) {
        termInstance.current.dispose();
        termInstance.current = null;
      }
    };
  }, []);

  const handleLanguageChange = (e) => {
    const runtimeStr = e.target.value;
    if (!runtimeStr) return;
    const runtime = JSON.parse(runtimeStr);
    setSelectedRuntime(runtime);
    
    // Provide some basic starter code based on language
    if (runtime.language === 'python') setCode('print("Hello World")');
    else if (runtime.language === 'javascript' || runtime.language === 'node') setCode('console.log("Hello World");');
    else if (runtime.language === 'java') setCode('public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}');
    else if (runtime.language === 'c' || runtime.language === 'c++' || runtime.language === 'cpp') setCode('#include <stdio.h>\n\nint main() {\n    printf("Hello World\\n");\n    return 0;\n}');
    else setCode('// Write your code here...');
  };

  const handleRunCode = async () => {
    if (!selectedRuntime) return;
    
    if (isRunning && socketRef.current) {
      // If already running, kill it
      socketRef.current.emit('kill');
      setIsRunning(false);
      return;
    }

    setIsRunning(true);
    if (termInstance.current) {
      termInstance.current.clear();
      termInstance.current.focus();
    }

    // Connect WebSocket
    const socketUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
    const executeUrl = `${socketUrl}/execute`.replace('api/api', 'api'); // ensure no double /api

    if (termInstance.current) {
      termInstance.current.writeln('\x1b[33mRunning code via secure endpoint...\x1b[0m\r\n');
    }

    try {
      const response = await fetch(executeUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          language: selectedRuntime.language,
          source: code
        })
      });

      const data = await response.json();
      
      if (termInstance.current) {
        if (data.error) {
          termInstance.current.writeln(`\x1b[31mError:\x1b[0m ${data.error}\r\n`);
        } else if (data.run) {
          const formattedOutput = data.run.output.replace(/\n/g, '\r\n');
          termInstance.current.write(formattedOutput);
          termInstance.current.writeln(`\r\n\x1b[33mProcess exited with code ${data.run.code}\x1b[0m`);
        }
      }

      // Save recent build logic
      if (enrollmentId) {
        try {
          await supabase.from('recent_builds').insert([
            {
              enrollment_id: enrollmentId,
              language: selectedRuntime.language,
              code_content: code,
              output: fullOutput
            }
          ]);
        } catch (err) {
          console.error("Failed to save build", err);
        }
      }
    } catch (err) {
      if (termInstance.current) {
        termInstance.current.writeln(`\r\n\x1b[31mNetwork Error: Failed to execute code.\x1b[0m`);
      }
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  if (loadingSession) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex items-center justify-center font-body-md antialiased">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not logged in
  if (!session) {
    return (
      <div className="bg-background text-on-surface min-h-screen flex flex-col font-body-md antialiased relative">
        <TopNavBar />
        <main className="flex-grow flex items-center justify-center p-md">
          <div className="max-w-md w-full bg-surface-container-lowest p-xl rounded-3xl border border-outline-variant shadow-level-2 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
            <span className="material-symbols-outlined text-[64px] text-primary mb-md">lock</span>
            <h2 className="font-headline-lg text-headline-lg text-primary mb-sm">Students Only</h2>
            <p className="font-body-md text-on-surface-variant mb-xl">
              The Coding Zone is a dedicated sandbox for enrolled students to practice and run code in any language. Please log in to access this feature.
            </p>
            <Link 
              to="/login" 
              className="inline-flex items-center justify-center w-full gap-2 bg-primary text-on-primary px-xl py-md rounded-xl font-label-lg hover:bg-primary/90 transition-all duration-300 shadow-level-1"
            >
              Log In to Continue
            </Link>
          </div>
        </main>
      </div>
    );
  }

  // Helper to map Piston languages to Monaco language identifiers where they differ
  const getMonacoLanguage = (pistonLang) => {
    if (!pistonLang) return 'javascript';
    const map = {
      'node': 'javascript',
      'python': 'python',
      'java': 'java',
      'cpp': 'cpp',
      'c++': 'cpp',
      'c': 'c',
      'rust': 'rust',
      'go': 'go',
      'typescript': 'typescript',
      'ruby': 'ruby',
      'php': 'php',
      'csharp': 'csharp',
      'swift': 'swift',
    };
    return map[pistonLang] || pistonLang;
  };

  return (
    <div className={`bg-background text-on-surface ${isEmbedded ? 'h-full' : 'min-h-screen'} flex flex-col font-body-md antialiased relative overflow-hidden`}>
      {!isEmbedded && <TopNavBar />}
      
      <main className={`flex-grow flex flex-col ${isEmbedded ? 'h-full' : 'h-[calc(100vh-64px)]'}`}>
        {/* Toolbar */}
        <div className="bg-surface-container min-h-16 h-auto py-2 border-b border-outline-variant flex flex-wrap items-center px-lg justify-between shrink-0 gap-4">
          <div className="flex items-center gap-2 md:gap-md flex-wrap">
            <span className="material-symbols-outlined text-primary text-[24px]">terminal</span>
            <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold hidden sm:block">Coding Zone</h1>
            
            <div className="h-6 w-[1px] bg-outline-variant mx-sm"></div>
            
            <div className="flex items-center gap-sm">
              <label className="font-label-md text-on-surface-variant">Language:</label>
              <select 
                onChange={handleLanguageChange} 
                className="bg-surface border border-outline-variant rounded-lg px-sm py-1 font-body-sm focus:ring-1 focus:ring-primary focus:outline-none min-w-[150px] capitalize cursor-pointer"
                value={selectedRuntime ? JSON.stringify(selectedRuntime) : ""}
              >
                {runtimes.length === 0 && <option value="">Loading...</option>}
                {runtimes.map(r => (
                  <option key={`${r.language}-${r.version}`} value={JSON.stringify(r)}>
                    {r.language}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button 
            onClick={handleRunCode}
            disabled={isRunning || !selectedRuntime}
            className="flex items-center gap-xs bg-[#10b981] hover:bg-[#059669] text-white px-lg py-2 rounded-lg font-label-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              {isRunning ? 'hourglass_empty' : 'play_arrow'}
            </span>
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
        </div>
        
        {/* Split Pane Area */}
        <div className="flex-grow flex flex-col md:flex-row h-full overflow-hidden bg-[#1e1e1e]">
          
          {/* Editor Pane */}
          <div className="w-full md:w-2/3 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[#333] flex flex-col relative">
            <div className="bg-[#252526] text-[#cccccc] text-xs font-mono px-4 py-2 flex items-center gap-2 border-b border-[#333] shrink-0">
              <span className="material-symbols-outlined text-[14px]">code</span>
              main.{selectedRuntime ? selectedRuntime.language : 'txt'}
            </div>
            <div className="flex-grow relative">
              <Editor
                height="100%"
                language={getMonacoLanguage(selectedRuntime?.language)}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value || '')}
                options={{
                  minimap: { enabled: false },
                  fontSize: 14,
                  wordWrap: 'on',
                  padding: { top: 16 },
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                  cursorBlinking: "smooth",
                  cursorSmoothCaretAnimation: "on",
                }}
              />
            </div>
          </div>
          
          {/* Interactive Terminal Pane */}
          <div className="w-full md:w-1/3 h-1/2 md:h-full flex flex-col bg-[#1e1e1e]">
            <div className="bg-[#252526] text-[#cccccc] text-xs font-mono px-4 py-2 flex justify-between items-center border-b border-[#333] shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[14px]">terminal</span>
                INTERACTIVE TERMINAL
              </div>
              <button 
                onClick={() => {
                  if (termInstance.current) {
                    termInstance.current.clear();
                  }
                }} 
                className="hover:text-white transition-colors flex items-center" 
                title="Clear Terminal"
              >
                <span className="material-symbols-outlined text-[14px]">block</span>
              </button>
            </div>
            <div className="flex-grow p-4 overflow-hidden focus:outline-none relative" ref={terminalRef}>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}

export default CodingZone;
