import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';
import { useData } from '../../context/DataContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useData();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0 pointer-events-none">
      {toasts.map((toast) => {
        let bg = 'bg-slate-900 border-slate-700 text-white';
        let icon = <Info className="w-5 h-5 text-sky-400 shrink-0" />;

        if (toast.type === 'success') {
          bg = 'bg-emerald-900/90 border-emerald-700 text-white';
          icon = <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
        } else if (toast.type === 'error') {
          bg = 'bg-rose-900/90 border-rose-700 text-white';
          icon = <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 ${bg}`}
          >
            {icon}
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold tracking-tight">{toast.title}</h4>
              {toast.message && (
                <p className="text-xs text-slate-200/90 mt-0.5 leading-relaxed break-words">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
              aria-label="Close toast"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
