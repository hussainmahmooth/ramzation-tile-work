import React from 'react';
import { Sparkles, Database, Plus, LogOut, Phone } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';

interface HeaderProps {
  onQuickNewProject?: () => void;
  currentPage: string;
}

export const Header: React.FC<HeaderProps> = ({ onQuickNewProject, currentPage }) => {
  const { user, isDemoMode, logout } = useAuth();
  const { settings } = useData();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-8 py-3 transition-all">
      <div className="flex items-center justify-between gap-4 max-w-7xl mx-auto">
        {/* Left: Brand & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-indigo-600/20">
              R
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-slate-900 block leading-tight">
                RAMZATION
              </span>
              <span className="text-[10px] text-indigo-600 font-bold tracking-widest block uppercase">
                TILE WORK
              </span>
            </div>
          </div>

          <div className="hidden md:block">
            <h1 className="text-xl font-black text-slate-900 capitalize tracking-tight">
              {currentPage}
            </h1>
            <p className="text-xs text-slate-500">
              {settings.business_name} • Contractor Business System
            </p>
          </div>
        </div>

        {/* Right Actions & User Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Demo Mode / Supabase Live Indicator */}
          {isDemoMode ? (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Demo / Local Mode
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              Supabase Live
            </span>
          )}

          {/* Business Phone Quick Display */}
          {settings.phone && (
            <a
              href={`tel:${settings.phone}`}
              className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 hover:text-indigo-600 bg-slate-100 px-3 py-1.5 rounded-lg font-medium transition"
              title="Call Business Contact"
            >
              <Phone className="w-3.5 h-3.5 text-indigo-600" />
              <span>{settings.phone}</span>
            </a>
          )}

          {/* Quick Create Project Button */}
          {onQuickNewProject && (
            <button
              onClick={onQuickNewProject}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold rounded-xl shadow-md shadow-indigo-600/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">New Project</span>
              <span className="xs:hidden">New</span>
            </button>
          )}

          {/* User Profile & Logout */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="hidden sm:block text-right">
              <span className="text-xs font-bold text-slate-800 block truncate max-w-[130px]">
                {user?.name || 'Owner'}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">Owner / Admin</span>
            </div>
            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
              title="Logout"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
