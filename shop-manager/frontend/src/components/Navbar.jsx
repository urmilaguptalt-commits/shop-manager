import { useAuth } from '../context/AuthContext';
import { 
  UserCircleIcon, 
  ArrowRightOnRectangleIcon,
  MagnifyingGlassIcon,
  BellAlertIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';
import { useState, useEffect } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  return (
    <header className="glass-surface sticky top-0 z-10 w-full px-8 py-4 flex justify-between items-center sm:hidden md:flex border-b border-slate-200/50 dark:border-slate-700/50">
      <div className="flex flex-1 items-center gap-6 max-w-2xl">
        {/* Search Bar */}
        <div className="relative w-full group">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-teal-500 transition-colors" />
          <input 
            type="text" 
            placeholder="Search inventory, serials, or actions (Ctrl+K)..." 
            className="w-full bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-full pl-10 pr-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500 transition-all text-slate-800 dark:text-slate-200"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
            <kbd className="hidden sm:inline-block border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">Ctrl</kbd>
            <kbd className="hidden sm:inline-block border border-slate-300 dark:border-slate-600 rounded px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 dark:text-slate-400">K</kbd>
          </div>
        </div>
      </div>
      
      <div className="flex items-center gap-5 ml-4">
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDark(!isDark)}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition"
          >
            {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
          <button className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition relative">
            <BellAlertIcon className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900 border-2 box-content"></span>
          </button>
        </div>

        <div className="h-6 w-px bg-slate-200 dark:bg-slate-700"></div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <div className="text-right hidden lg:block">
            <p className="text-sm font-semibold text-slate-800 dark:text-white leading-tight">{user?.name || "Premium Admin"}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide uppercase">{user?.role || "Owner"}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-teal-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-teal-500/20 cursor-pointer border border-white dark:border-slate-700">
             <span className="text-white font-bold">{user?.name ? user.name.charAt(0).toUpperCase() : 'A'}</span>
          </div>
          <button onClick={logout} className="p-2 ml-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition" title="Logout">
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
