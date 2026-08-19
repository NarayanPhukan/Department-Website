import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TopNavBar from '../components/TopNavBar';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;
    
    if (email === 'computer@morancollege.ac.in' && password === 'ComSc#321') {
      navigate('/admin');
    } else {
      setError('Invalid credentials');
    }
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
          <div className="flex flex-col items-center mb-lg">
            <div className="w-12 h-12 rounded-lg bg-surface-container flex items-center justify-center mb-sm border border-surface-container-high">
              <span className="material-symbols-outlined text-secondary" style={{fontVariationSettings: "'FILL' 1"}}>terminal</span>
            </div>
            <h1 className="font-headline-md text-headline-md text-primary text-center">CS Portal Access</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant text-center mt-xs">Authenticate to proceed</p>
          </div>
          

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-sm">
            {/* Email Field */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="email">email</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">mail</span>
                <input className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" id="email" name="email" placeholder="user@cs.university.edu" required="" type="email" defaultValue="computer@morancollege.ac.in"/>
              </div>
            </div>
            
            {/* Password Field */}
            <div>
              <label className="font-label-md text-label-md text-on-surface-variant mb-base block" htmlFor="password">password</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-outline-variant text-[20px]">lock</span>
                <input className="w-full pl-xl pr-sm py-sm bg-surface border border-outline-variant rounded-lg focus:outline-none focus:border-secondary focus:ring-1 focus:ring-secondary font-body-md text-body-md text-on-surface transition-all placeholder:text-outline-variant/60" id="password" name="password" placeholder="••••••••••••" required="" type="password" defaultValue="ComSc#321"/>
              </div>
              <div className="flex justify-end mt-xs">
                <Link className="font-body-sm text-body-sm text-secondary hover:underline transition-all" to="#">Forgot password?</Link>
              </div>
            </div>
            {error && <p className="text-error text-center font-body-sm text-body-sm mt-xs">{error}</p>}
            
            {/* Submit Action */}
            <button className="w-full mt-sm py-sm rounded-lg bg-secondary text-on-secondary font-label-md text-label-md hover:bg-secondary-container hover:text-on-secondary-container transition-colors duration-200 flex items-center justify-center gap-xs" type="submit">
              Execute Login
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
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
