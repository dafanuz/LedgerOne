import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, PlusCircle, BookOpen, PieChart, Settings } from 'lucide-react';
import { useTranslation } from '../store';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const { t } = useTranslation();
  const location = useLocation();

  // Hide nav permanently on specific pages (like New Entry) to avoid clutter
  const isHideNavPage = location.pathname === '/new';

  useEffect(() => {
    const controlNavbar = () => {
      const currentScrollY = window.scrollY;
      
      // Hide if scrolling down AND scrolled past 100px
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', controlNavbar);
    return () => window.removeEventListener('scroll', controlNavbar);
  }, [lastScrollY]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors">
      <div className="max-w-md mx-auto min-h-screen bg-white dark:bg-slate-950 shadow-2xl relative transition-colors pb-32">
        {children}
        
        {/* Floating Bottom Navigation */}
        <div className={`fixed bottom-6 left-0 right-0 z-50 flex justify-center transition-transform duration-300 ${showNav && !isHideNavPage ? 'translate-y-0' : 'translate-y-32'}`}>
          <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-full px-6 py-3 flex items-center justify-between shadow-xl shadow-slate-200/50 dark:shadow-black/50 w-[90%] max-w-sm">
            <NavItem to="/" icon={<Home size={22} />} label={t('nav.home')} />
            <NavItem to="/journal" icon={<BookOpen size={22} />} label={t('nav.journal')} />
            
            <NavLink to="/new" className="flex flex-col items-center justify-center -mt-12 group">
              <div className="bg-primary-600 text-white p-4 rounded-full shadow-lg shadow-primary-500/40 border-4 border-white dark:border-slate-950 group-hover:scale-110 transition-transform active:scale-95">
                <PlusCircle size={28} />
              </div>
            </NavLink>

            <NavItem to="/budget" icon={<PieChart size={22} />} label={t('nav.budget')} />
            <NavItem to="/settings" icon={<Settings size={22} />} label={t('nav.settings')} />
          </nav>
        </div>
      </div>
    </div>
  );
};

const NavItem: React.FC<{ to: string; icon: React.ReactNode; label?: string }> = ({ to, icon, label }) => (
  <NavLink 
    to={to} 
    className={({ isActive }) => 
      `p-2 rounded-full transition-all duration-300 flex flex-col items-center gap-1 ${
        isActive 
          ? 'text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20' 
          : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
      }`
    }
  >
    {icon}
  </NavLink>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string; title?: string }> = ({ children, className = '', title }) => (
  <div className={`bg-white dark:bg-slate-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 transition-colors ${className}`}>
    {title && <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">{title}</h3>}
    {children}
  </div>
);

export const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' | 'ghost' }> = ({ 
  children, variant = 'primary', className = '', ...props 
}) => {
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800 shadow-md shadow-primary-500/20',
    secondary: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700',
    danger: 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-900/30',
    ghost: 'bg-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
  };

  return (
    <button 
      className={`px-4 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export const Badge: React.FC<{ children: React.ReactNode; color?: 'green' | 'red' | 'blue' | 'gray' }> = ({ children, color = 'gray' }) => {
  const colors = {
    green: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
    red: 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
    gray: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
  };
  return (
    <span className={`px-2 py-1 rounded-md text-xs font-medium ${colors[color]}`}>
      {children}
    </span>
  );
};