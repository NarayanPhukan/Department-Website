import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

function TopNavBar() {
  const location = useLocation();
  const currentPath = location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About' },
    { path: '/subjects', label: 'Subjects' },
    { path: '/contact', label: 'Contact' }
  ];

  const getLinkClasses = (path) => {
    const isActive = currentPath === path;
    const baseClasses = "scale-95 active:opacity-80 transition-transform transition-colors";
    
    if (isActive) {
      return `${baseClasses} text-primary dark:text-secondary-fixed-dim border-b-2 border-secondary font-bold pb-1`;
    }
    
    return `${baseClasses} text-on-surface-variant dark:text-surface-variant hover:text-secondary dark:hover:text-secondary-fixed-dim`;
  };

  return (
    <nav className="bg-surface dark:bg-inverse-surface w-full top-0 sticky border-b border-outline-variant dark:border-outline z-50">
      <div className="flex justify-between items-center max-w-[1280px] mx-auto px-margin h-16 font-body-md text-body-md">
        <Link className="font-headline-md text-headline-md font-bold text-on-surface dark:text-inverse-on-surface flex items-center gap-xs" to="/">
          <span className="material-symbols-outlined fill" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          CS Department
        </Link>
        <div className="hidden md:flex space-x-6 items-center">
          {navLinks.map((link) => (
            <Link key={link.path} className={getLinkClasses(link.path)} to={link.path}>
              {link.label}
            </Link>
          ))}
        </div>
        <div className="flex items-center space-x-4">
          <Link to="/apply" className="hidden md:block bg-primary text-on-primary px-sm py-xs rounded hover:bg-opacity-90 transition-colors font-label-md text-label-md">
            Apply Now
          </Link>
          <Link className="text-on-surface hover:text-secondary transition-colors" to="/login">
            <span className="material-symbols-outlined">account_circle</span>
          </Link>
          <button aria-label="Notifications" className="text-on-surface dark:text-inverse-on-surface hover:text-secondary transition-colors">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button 
            className="md:hidden text-on-surface dark:text-inverse-on-surface"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="material-symbols-outlined">{mobileMenuOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-surface-container dark:bg-surface-container-high border-b border-outline-variant absolute w-full left-0">
          <div className="flex flex-col px-margin py-sm gap-sm">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                className={`py-2 ${currentPath === link.path ? 'text-primary font-bold' : 'text-on-surface-variant'}`} 
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link 
              to="/apply" 
              className="bg-primary text-on-primary px-sm py-xs rounded text-center mt-xs inline-block"
              onClick={() => setMobileMenuOpen(false)}
            >
              Apply Now
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default TopNavBar;
