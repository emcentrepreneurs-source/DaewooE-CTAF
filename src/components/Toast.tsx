import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, X, Database } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info';
  title: string;
  message?: string;
  showDatabaseBadge?: boolean;
  duration?: number;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="polite"
      id="toast-container"
      className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0"
    >
      <AnimatePresence>
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
};

const ToastItem: React.FC<{
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, onDismiss]);

  const type = toast.type || 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 15, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 350 }}
      className={`pointer-events-auto rounded-xl border p-3.5 shadow-xl backdrop-blur-md transition-all ${
        type === 'success'
          ? 'bg-zinc-900/95 border-emerald-500/30 shadow-emerald-950/20 text-zinc-100'
          : type === 'error'
          ? 'bg-zinc-900/95 border-rose-500/30 shadow-rose-950/20 text-zinc-100'
          : 'bg-zinc-900/95 border-zinc-700/80 shadow-black/40 text-zinc-100'
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`p-1.5 rounded-lg flex-shrink-0 ${
            type === 'success'
              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
              : type === 'error'
              ? 'bg-rose-500/15 text-rose-400 border border-rose-500/20'
              : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'
          }`}
        >
          {type === 'success' ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : type === 'error' ? (
            <AlertCircle className="w-4 h-4" />
          ) : (
            <Info className="w-4 h-4" />
          )}
        </div>

        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2">
            <h5 className="text-xs font-semibold text-zinc-100 truncate">
              {toast.title}
            </h5>
            {toast.showDatabaseBadge && (
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 font-mono">
                <Database className="w-2.5 h-2.5" />
                DB Synced
              </span>
            )}
          </div>
          {toast.message && (
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        <button
          onClick={() => onDismiss(toast.id)}
          className="p-1 rounded-md text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};
