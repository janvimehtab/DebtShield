import React, { useEffect } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const typeConfig = {
    error: {
      bg: 'bg-rose-950/90 border-rose-600/50 text-rose-200',
      icon: <XCircle className="w-5 h-5 text-rose-400 shrink-0" />
    },
    success: {
      bg: 'bg-emerald-950/90 border-emerald-600/50 text-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
    },
    warning: {
      bg: 'bg-amber-950/90 border-amber-600/50 text-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
    },
    info: {
      bg: 'bg-slate-900/90 border-slate-700 text-slate-200',
      icon: <Info className="w-5 h-5 text-sky-400 shrink-0" />
    }
  };

  const current = typeConfig[toast.type] || typeConfig.info;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div
        className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md ${current.bg}`}
      >
        {current.icon}
        <div className="flex-1 text-sm">
          {toast.title && <div className="font-semibold text-white mb-0.5">{toast.title}</div>}
          <div className="text-xs leading-relaxed opacity-90">{toast.message}</div>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white transition p-1"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
