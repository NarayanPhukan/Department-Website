import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { supabase } from '../supabaseClient';

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('student'); // 'student' or 'admin'
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (activeTab === 'admin') {
        const email = e.target.email.value;
        const password = e.target.password.value;
        const { data, error } = await supabase
          .from('admin_users')
          .select('*')
          .eq('email', email)
          .eq('password', password)
          .maybeSingle();

        if (data) {
          navigate('/admin');
        } else {
          setError('Invalid admin credentials');
        }
      } else {
        const enrollmentId = e.target.enrollment.value;
        const password = e.target.password.value;

        // 1. Look up the student's email and major using their enrollment ID
        const { data: studentData, error: lookupError } = await supabase
          .from('applications')
          .select('email, current_major')
          .eq('enrollment_id', enrollmentId)
          .limit(1)
          .maybeSingle();

        if (!studentData || lookupError) {
          setError('Enrollment ID not found');
          setLoading(false);
          return;
        }

        if (studentData.current_major !== 'computer_science') {
          setError('Portal access is restricted to Computer Science Major students only.');
          setLoading(false);
          return;
        }

        // 2. Sign in with Supabase Auth using the found email
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email: studentData.email,
          password: password,
        });

        if (authError || !authData.user) {
          setError('Invalid password or authentication failed');
        } else {
          navigate('/student-panel');
        }
      }
    } catch (err) {
      setError('An error occurred during login');
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden font-body-md antialiased">
      <TopNavBar />
      <div className="flex-grow flex items-center justify-center">
      {/* Decorative Background Element */}
      <div className="absolute inset-0 tech-grid-bg opacity-40 pointer-events-none z-0"></div>
      
      {/* Decorative Abstract Image fulfilling constraint */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-cover bg-no-repeat opacity-10 pointer-events-none z-0 mix-blend-multiply" data-alt="A subtle, highly abstract digital art piece serving as a background texture." style={{backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuCGd3JcLbE5x5uc1-EHy3eTuvP1QPwTMbkCVVUhrCHlzOWy0A-o2DhpQBGr6BDcVKWhYKz2Pmx6ItxmqK4JIqjThZlfI_aN1Q3omZlY5Ps3jXgg0vcNN9030avqROnFvzsKk7DIWmVLXF4ONVZCVm-ADozyiAJkOM5NTyumGbSx5hdytd7pV1HQrJHvsMW3R3rlslqye-9pjAS6whccpq5jDxOjJ2EAr6nlSq4zagG6eRTinw_r41a_')"}}></div>
      
      {/* Main Content Canvas */}
      <main className="w-full max-w-[440px] px-sm relative z-10">
        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-lg shadow-[0_4px_24px_rgba(15,23,42,0.04)] relative overflow-hidden group transition-colors duration-500 hover:border-outline-variant">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-80"></div>
          
          {/* Header */}
          <div className="flex flex-col items-center mb-md">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-sm border border-surface-container-high">
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>{activeTab === 'admin' ? 'admin_panel_settings' : 'school'}</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary text-center">CS Portal Access</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-xs">Authenticate to proceed</p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex w-full mb-lg p-1 bg-surface border border-outline-variant rounded-lg">
            <button 
              onClick={() => { setActiveTab('student'); setError(''); }} 
              className={`flex-1 py-2 font-label-md rounded-md transition-colors ${activeTab === 'student' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              Student
            </button>
            <button 
              onClick={() => { setActiveTab('admin'); setError(''); }} 
              className={`flex-1 py-2 font-label-md rounded-md transition-colors ${activeTab === 'admin' ? 'bg-secondary text-on-secondary shadow-sm' : 'text-on-surface-variant hover:bg-surface-container-high'}`}
            >
              Admin
            </button>
          </div>
          
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            {activeTab === 'student' ? (
              /* Student Field */
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="enrollment">enrollment number</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">badge</span>
                  <input className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" id="enrollment" name="enrollment" placeholder="e.g. CS-2024-001" required="" type="text" />
                </div>
              </div>
            ) : (
              /* Admin Field */
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="email">email</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">mail</span>
                  <input className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" id="email" name="email" placeholder="user@cs.university.edu" required="" type="email" />
                </div>
              </div>
            )}
            
            {/* Password Field */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="password">password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                <input className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" id="password" name="password" placeholder="••••••••••••" required="" type="password" />
              </div>
              <div className="flex justify-end mt-xs">
                <Link className="font-body-sm text-body-sm text-secondary hover:underline transition-all" to="#">Forgot password?</Link>
              </div>
            </div>
            
            {error && <p className="text-error text-center font-body-sm text-body-sm mt-xs">{error}</p>}
            
            {/* Submit Action */}
            <button className="w-full mt-sm py-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors duration-200 flex items-center justify-center gap-xs disabled:opacity-70 disabled:cursor-not-allowed" type="submit" disabled={loading}>
              {loading ? 'Authenticating...' : 'Execute Login'}
              {!loading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>
          </form>
          
          {/* Secure notice */}
          <div className="mt-lg pt-sm border-t border-surface-container-high flex items-center justify-center gap-xs text-outline font-body-sm text-[12px]">
            <span className="material-symbols-outlined text-[14px]">encrypted</span>
            <span>Connection secured via SSL/TLS</span>
          </div>
        </div>
        
        {/* Footer simplified for transactional page */}
        <div className="mt-lg text-center font-body-sm text-body-sm text-on-surface-variant">
          © 2024 Computer Science Department
        </div>
      </main>
      </div>
    </div>
  );
}

export default Login;
