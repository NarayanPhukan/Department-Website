import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';
import { supabase } from '../supabaseClient';

function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Listen for auth state changes specifically for the PASSWORD_RECOVERY event
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'PASSWORD_RECOVERY') {
          setMessage({ type: 'info', text: 'Please enter your new password below.' });
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      
      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully. Redirecting...' });
        
        // Sign out to prevent auto login
        await supabase.auth.signOut();
        
        setTimeout(() => {
          navigate('/');
        }, 2000);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'An unexpected error occurred.' });
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-background text-on-surface min-h-screen flex flex-col relative overflow-hidden font-body-md antialiased">
      <TopNavBar />
      <div className="flex-grow flex items-center justify-center">
        {/* Decorative Background Element */}
        <div className="absolute inset-0 tech-grid-bg opacity-40 pointer-events-none z-0"></div>
        
        {/* Main Content Canvas */}
        <main className="w-full max-w-[440px] px-sm relative z-10">
          {/* Card */}
          <div className="bg-surface-container-lowest border border-surface-container-high rounded-xl p-lg shadow-2xl relative overflow-hidden">
            {/* Subtle top accent line */}
            <div className="absolute top-0 left-0 w-full h-1 bg-secondary opacity-80"></div>
            
            <div className="flex flex-col items-center mb-md">
              <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-sm border border-surface-container-high">
                <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>lock_reset</span>
              </div>
              <h1 className="font-headline-md text-headline-md text-primary text-center">Reset Password</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-xs">Create a new password for your account</p>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="password">New Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                  <input 
                    className="w-full pl-xl pr-10 py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" 
                    id="password" 
                    placeholder="••••••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-sm top-1/2 -translate-y-1/2 text-outline-variant hover:text-on-surface transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                  <input 
                    className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" 
                    id="confirmPassword" 
                    placeholder="••••••••••••" 
                    required 
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
              </div>

              {message.text && (
                <div className={`p-sm rounded-lg font-body-sm text-body-sm flex items-start gap-2 mt-xs ${
                  message.type === 'error' ? 'bg-error/10 text-error' : 
                  message.type === 'success' ? 'bg-primary/10 text-primary' : 
                  'bg-secondary/10 text-secondary'
                }`}>
                  <span className="material-symbols-outlined text-[18px]">
                    {message.type === 'error' ? 'error' : message.type === 'success' ? 'check_circle' : 'info'}
                  </span>
                  <span>{message.text}</span>
                </div>
              )}

              <button 
                className="w-full mt-sm py-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors duration-200 flex items-center justify-center gap-xs disabled:opacity-70 disabled:cursor-not-allowed" 
                type="submit" 
                disabled={loading}
              >
                {loading ? 'Updating...' : 'Update Password'}
                {!loading && <span className="material-symbols-outlined text-[18px]">check</span>}
              </button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}

export default ResetPassword;
