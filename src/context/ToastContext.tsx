import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  showToast: (title: string, message?: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (title: string, message?: string, type: ToastType = 'success', duration: number = 5000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const newToast: ToastItem = { id, type, title, message, duration };
      
      setToasts((prev) => [...prev.slice(-3), newToast]); // keep max 4 toasts

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, removeToast }}>
      {children}
      
      {/* Toast Render Portal / Container */}
      <aside
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-md w-[calc(100vw-2.5rem)] sm:w-96 pointer-events-none"
      >
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isInfo = toast.type === 'info';

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto rounded-2xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
                isSuccess
                  ? 'bg-slate-900/95 border-emerald-500/50 shadow-emerald-950/40 text-slate-100'
                  : isError
                  ? 'bg-slate-900/95 border-red-500/50 shadow-red-950/40 text-slate-100'
                  : 'bg-slate-900/95 border-cyan-500/50 shadow-cyan-950/40 text-slate-100'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`mt-0.5 rounded-xl p-2 shrink-0 ${
                    isSuccess
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : isError
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                  }`}
                >
                  {isSuccess && <CheckCircle2 className="h-5 w-5" aria-hidden="true" />}
                  {isError && <AlertCircle className="h-5 w-5" aria-hidden="true" />}
                  {isInfo && <Sparkles className="h-5 w-5" aria-hidden="true" />}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <h4 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5 font-['Space_Grotesk']">
                    {toast.title}
                  </h4>
                  {toast.message && (
                    <p className="mt-1 text-xs text-slate-300 leading-relaxed font-sans">
                      {toast.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeToast(toast.id)}
                  className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors focus:outline-hidden focus-visible:ring-2 focus-visible:ring-emerald-500 min-h-[32px] min-w-[32px] flex items-center justify-center"
                  aria-label="Dismiss notification"
                >
                  <X className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>

              {/* Subtle visual timer line */}
              <div className="mt-3 h-1 w-full bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full animate-[progress_5s_linear] ${
                    isSuccess ? 'bg-emerald-400' : isError ? 'bg-red-400' : 'bg-cyan-400'
                  }`}
                  style={{ animationDuration: `${toast.duration || 5000}ms` }}
                />
              </div>
            </div>
          );
        })}
      </aside>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
