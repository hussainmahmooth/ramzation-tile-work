import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Hammer,
} from 'lucide-react';
import { useData } from '../../context/DataContext';

export type NavPage = 'dashboard' | 'customers' | 'projects' | 'payments' | 'bills' | 'reports' | 'settings';

interface SidebarProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate }) => {
  const { settings, projects, customers } = useData();

  const activeProjectsCount = projects.filter((p) => p.status === 'In Progress').length;
  const customersCount = customers.length;

  const navItems = [
    {
      id: 'dashboard' as NavPage,
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      id: 'customers' as NavPage,
      label: 'Customers',
      icon: Users,
      badge: customersCount > 0 ? customersCount : undefined,
    },
    {
      id: 'projects' as NavPage,
      label: 'Projects',
      icon: Briefcase,
      badge: activeProjectsCount > 0 ? `${activeProjectsCount} Active` : undefined,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'payments' as NavPage,
      label: 'Payments',
      icon: CreditCard,
    },
    {
      id: 'bills' as NavPage,
      label: 'Bills',
      icon: FileText,
    },
    {
      id: 'reports' as NavPage,
      label: 'Reports',
      icon: BarChart3,
    },
    {
      id: 'settings' as NavPage,
      label: 'Settings',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen border-r border-slate-800 shrink-0 select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-black shadow-lg shadow-indigo-500/20">
          <Hammer className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-extrabold text-sm tracking-wide text-white uppercase leading-none">
            {settings.business_name || 'RAMZATION'}
          </h2>
          <span className="text-[11px] font-bold text-indigo-400 tracking-widest block uppercase mt-1">
            TILE WORK SYSTEM
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Owner Info Footer */}
      <div className="p-4 m-3 rounded-2xl bg-slate-800/60 border border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-indigo-500/20 text-indigo-400 font-bold flex items-center justify-center text-sm border border-indigo-500/30">
            {settings.owner_name?.charAt(0) || 'R'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-200 truncate">
              {settings.owner_name || 'Mohamed Ramzan'}
            </p>
            <p className="text-[11px] text-slate-400 truncate">Tile Contractor</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
