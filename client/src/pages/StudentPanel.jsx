import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import toast from 'react-hot-toast';

// We will import these later once we create them
import CodingZone from './CodingZone';
import StudentSyllabus from '../components/StudentSyllabus';
import StudentProfile from '../components/StudentProfile';
import RecentBuilds from '../components/RecentBuilds';
import EnhancerList from '../components/EnhancerList';
import EnhancerSolver from '../components/EnhancerSolver';
import { problems } from '../data/problems';

function StudentPanel() {
  const [activeTab, setActiveTab] = useState('coding-zone');
  const [workspaceOpen, setWorkspaceOpen] = useState(true);
  const [studentApps, setStudentApps] = useState([]);
  const [resumeData, setResumeData] = useState(null);
  const [selectedEnhancerProblem, setSelectedEnhancerProblem] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate('/login');
        return;
      }
      setUser(user);

      // Fetch student application data based on email
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('email', user.email)
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        toast.error("Could not find your student profile.");
        // navigate('/login');
      } else {
        setStudentApps(data);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  if (!user || studentApps.length === 0) {
    return <div className="min-h-screen flex items-center justify-center bg-background text-on-surface">Loading portal...</div>;
  }

  const latestApp = studentApps[0];

  return (
    <div className="font-body-md text-body-md text-on-surface bg-background flex min-h-screen">
      {/* SideNavBar Component */}
      <nav className="bg-surface-container h-screen w-64 fixed left-0 top-0 flex flex-col p-sm gap-base z-50">
        <div className="mb-lg px-sm pt-sm">
          <h1 className="font-headline-sm text-headline-md font-black text-primary">Student Portal</h1>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">CS Major Workspace</p>
        </div>
        
        <div className="flex-1 flex flex-col gap-xs overflow-y-auto pr-2">
          
          {/* Workspace Dropdown */}
          <div className="mb-2">
            <button 
              onClick={() => setWorkspaceOpen(!workspaceOpen)} 
              className="flex items-center justify-between w-full px-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface-container-high transition-all"
            >
              <div className="flex items-center gap-sm">
                <span className="material-symbols-outlined text-[20px]" data-icon="workspaces">workspaces</span>
                <span className="font-label-md text-label-md font-bold uppercase tracking-wider text-xs">My Workspace</span>
              </div>
              <span className={`material-symbols-outlined text-[18px] transition-transform ${workspaceOpen ? 'rotate-180' : ''}`}>expand_more</span>
            </button>
            
            {workspaceOpen && (
              <div className="pl-8 flex flex-col gap-1 mt-1">
                <button 
                  onClick={() => setActiveTab('coding-zone')} 
                  className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all ${activeTab === 'coding-zone' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">terminal</span>
                  <span className="font-label-md">Coding Zone</span>
                </button>
                <button 
                  onClick={() => setActiveTab('recent-builds')} 
                  className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all ${activeTab === 'recent-builds' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span className="font-label-md">Recent Builds</span>
                </button>
              </div>
            )}
          </div>

          {/* Enhancer */}
          <button 
            onClick={() => setActiveTab('enhancer')} 
            className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all ${activeTab === 'enhancer' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">model_training</span>
            <span className="font-label-md">Enhancer</span>
          </button>

          {/* Syllabus */}
          <button 
            onClick={() => setActiveTab('syllabus')} 
            className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all ${activeTab === 'syllabus' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">menu_book</span>
            <span className="font-label-md">My Syllabus</span>
          </button>

          {/* Profile */}
          <button 
            onClick={() => setActiveTab('profile')} 
            className={`flex items-center gap-sm px-sm py-2 rounded-lg transition-all ${activeTab === 'profile' ? 'bg-secondary-container text-on-secondary-container' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
          >
            <span className="material-symbols-outlined text-[20px]">person</span>
            <span className="font-label-md">My Profile</span>
          </button>
          
        </div>

        <div className="mt-auto border-t border-outline-variant pt-sm flex flex-col gap-base">
          <div className="px-sm py-2 text-xs text-on-surface-variant flex items-center gap-2">
            <div className="w-8 h-8 bg-primary text-on-primary rounded-full flex items-center justify-center font-bold text-sm">
              {latestApp.full_name?.charAt(0) || 'S'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold truncate">{latestApp.full_name}</p>
              <p className="truncate opacity-70">{latestApp.enrollment_id}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-sm px-sm py-2 text-on-surface-variant hover:bg-surface-container-high transition-all rounded-lg w-full text-left"
          >
            <span className="material-symbols-outlined" data-icon="logout">logout</span>
            <span className="font-label-md text-label-md">Log Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="ml-64 flex-1 min-h-screen bg-[#f8f9fa] dark:bg-[#121212] overflow-x-hidden">
        {activeTab === 'coding-zone' && <CodingZone isEmbedded={true} enrollmentId={latestApp.enrollment_id} resumeData={resumeData} />}
        {activeTab === 'recent-builds' && (
          <RecentBuilds 
            enrollmentId={latestApp.enrollment_id} 
            onResume={(lang, code) => {
              setResumeData({ lang, code });
              setActiveTab('coding-zone');
            }}
          />
        )}
        {activeTab === 'enhancer' && (
          selectedEnhancerProblem ? (
            <EnhancerSolver 
              problem={problems.find(p => p.id === selectedEnhancerProblem)} 
              onBack={() => setSelectedEnhancerProblem(null)} 
            />
          ) : (
            <EnhancerList onSelectProblem={setSelectedEnhancerProblem} />
          )
        )}
        {activeTab === 'syllabus' && <StudentSyllabus applications={studentApps} />}
        {activeTab === 'profile' && <StudentProfile applications={studentApps} setStudentApps={setStudentApps} />}
      </main>
    </div>
  );
}

export default StudentPanel;
