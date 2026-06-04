import { NavLink } from 'react-router-dom';
import { 
  HomeIcon, 
  ArchiveBoxIcon, 
  BanknotesIcon, 
  UserGroupIcon, 
  UsersIcon,
  ChartBarIcon,
  WrenchScrewdriverIcon 
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: HomeIcon },
    { name: 'Inventory Master', path: '/inventory', icon: ArchiveBoxIcon },
    { name: 'POS & Billing', path: '/billing', icon: BanknotesIcon },
    { name: 'Customers', path: '/customers', icon: UsersIcon },
    { name: 'Suppliers & PO', path: '/suppliers', icon: UserGroupIcon },
    { name: 'Reports', path: '/reports', icon: ChartBarIcon },
  ];

  return (
    <aside className="w-64 glass-surface hidden md:flex flex-col h-full z-20 border-r border-slate-200/50 dark:border-slate-700/50 relative">
      <div className="p-6 pb-2">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <ArchiveBoxIcon className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-teal-500 to-emerald-400 bg-clip-text text-transparent">
            Modern & 'Techy'
          </h1>
        </div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest pl-11">Inventory OS</p>
      </div>
      
      <div className="mt-8 px-4 flex-1 space-y-1">
        <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
        {navItems.map((item, idx) => (
          <NavLink
            key={item.name}
            to={item.path}
            className={({ isActive }) => 
              `group relative flex items-center gap-3 px-4 py-3 min-h-[48px] rounded-xl transition-all duration-300 font-medium overflow-hidden ${
                isActive 
                  ? 'text-white'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-teal-500 shadow-md border border-teal-400/30 rounded-xl"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {!isActive && (
                   <div className="absolute inset-0 bg-slate-100/0 dark:bg-slate-800/0 scale-95 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100 group-hover:bg-slate-100 dark:group-hover:bg-slate-800 rounded-xl" />
                )}
                <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-500'}`} />
                <span className="relative z-10 text-sm">{item.name}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </aside>
  );
};

export default Sidebar;
