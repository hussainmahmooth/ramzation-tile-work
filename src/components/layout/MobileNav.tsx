import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CreditCard,
  FileText,
  BarChart3,
  Settings,
  Plus,
  X,
  UserPlus,
  FolderPlus,
  Receipt,
  FileSpreadsheet,
} from 'lucide-react';
import { NavPage } from './Sidebar';

interface MobileNavProps {
  currentPage: NavPage;
  onNavigate: (page: NavPage) => void;
  onNewCustomer: () => void;
  onNewProject: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentPage,
  onNavigate,
  onNewCustomer,
  onNewProject,
}) => {
  const [quickMenuOpen, setQuickMenuOpen] = useState(false);

  const mainTabs = [
    { id: 'dashboard' as NavPage, label: 'Home', icon: LayoutDashboard },
    { id: 'customers' as NavPage, label: 'Customers', icon: Users },
    { id: 'projects' as NavPage, label: 'Projects', icon: Briefcase },
    { id: 'payments' as NavPage, label: 'Payments', icon: CreditCard },
    { id: 'bills' as NavPage, label: 'Bills', icon: FileText },
  ];

  return (
    <>
      {/* Quick Action Speed Dial Overlay */}
      {quickMenuOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/70 backdrop-blur-xs flex flex-col justify-end p-4 pb-24 animate-in fade-in duration-200"
          onClick={() => setQuickMenuOpen(false)}
        >
          <div 
            className="bg-white rounded-3xl p-5 shadow-2xl space-y-3 transform animate-in slide-in-from-bottom-8 duration-200 border border-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500">Quick Actions</span>
              <button 
                onClick={() => setQuickMenuOpen(false)} 
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onNewProject();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-indigo-50/80 hover:bg-indigo-100 text-indigo-900 transition text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20">
                  <FolderPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold leading-tight">Create Project</span>
              </button>

              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onNewCustomer();
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-emerald-50/80 hover:bg-emerald-100 text-emerald-900 transition text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold leading-tight">Add Customer</span>
              </button>

              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onNavigate('reports');
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-amber-50/80 hover:bg-amber-100 text-amber-900 transition text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-600/20">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold leading-tight">Reports</span>
              </button>

              <button
                onClick={() => {
                  setQuickMenuOpen(false);
                  onNavigate('settings');
                }}
                className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-900 transition text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-slate-700 text-white flex items-center justify-center shadow-md shadow-slate-700/20">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold leading-tight">Settings</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button (FAB) on Mobile */}
      <div className="md:hidden fixed bottom-20 right-4 z-30">
        <button
          onClick={() => setQuickMenuOpen(!quickMenuOpen)}
          className="w-13 h-13 rounded-full bg-gradient-to-tr from-indigo-700 to-indigo-500 text-white flex items-center justify-center shadow-xl shadow-indigo-600/40 transform active:scale-95 transition-all border-2 border-white cursor-pointer"
          aria-label="Quick Action Menu"
        >
          {quickMenuOpen ? <X className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
        </button>
      </div>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-2 py-2 flex items-center justify-around shadow-lg">
        {mainTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentPage === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onNavigate(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition cursor-pointer ${
                isActive ? 'text-indigo-600 font-bold' : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 stroke-[2.5]' : 'text-slate-400'}`} />
              <span className="text-[10px] mt-0.5 tracking-tight">{tab.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
