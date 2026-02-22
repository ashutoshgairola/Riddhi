import React, { createContext, useCallback, useContext, useRef, useState } from 'react';

import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

// ── Types ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // ms – 0 means persist until dismissed
}

interface ToastContextValue {
  toasts: Toast[];
  toast: (opts: Omit<Toast, 'id'>) => string;
  success: (message: string, title?: string) => string;
  error: (message: string, title?: string) => string;
  warning: (message: string, title?: string) => string;
  info: (message: string, title?: string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
}

// ── Context ──────────────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>');
  return ctx;
}

// ── Config ───────────────────────────────────────────────────────────────────

const DEFAULT_DURATION: Record<ToastType, number> = {
  success: 3500,
  error: 5000,
  warning: 4500,
  info: 4000,
};

// ── Provider ─────────────────────────────────────────────────────────────────

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  // Use a counter for stable IDs without useId per toast
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  const toast = useCallback(
    (opts: Omit<Toast, 'id'>): string => {
      const id = `toast-${++counter.current}`;
      const duration = opts.duration ?? DEFAULT_DURATION[opts.type];

      setToasts((prev) => [...prev, { ...opts, id, duration }]);

      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }

      return id;
    },
    [dismiss],
  );

  const success = useCallback(
    (message: string, title?: string) => toast({ type: 'success', message, title }),
    [toast],
  );
  const error = useCallback(
    (message: string, title?: string) => toast({ type: 'error', message, title }),
    [toast],
  );
  const warning = useCallback(
    (message: string, title?: string) => toast({ type: 'warning', message, title }),
    [toast],
  );
  const info = useCallback(
    (message: string, title?: string) => toast({ type: 'info', message, title }),
    [toast],
  );

  return (
    <ToastContext.Provider
      value={{ toasts, toast, success, error, warning, info, dismiss, dismissAll }}
    >
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

// ── Visual config per type ────────────────────────────────────────────────────

const TOAST_STYLES: Record<
  ToastType,
  { icon: React.ElementType; bar: string; iconColor: string; bg: string; border: string }
> = {
  success: {
    icon: CheckCircle2,
    bar: 'bg-emerald-500',
    iconColor: 'text-emerald-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-emerald-200 dark:border-emerald-800',
  },
  error: {
    icon: AlertCircle,
    bar: 'bg-red-500',
    iconColor: 'text-red-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-red-200 dark:border-red-800',
  },
  warning: {
    icon: AlertTriangle,
    bar: 'bg-amber-400',
    iconColor: 'text-amber-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-amber-200 dark:border-amber-800',
  },
  info: {
    icon: Info,
    bar: 'bg-blue-500',
    iconColor: 'text-blue-500',
    bg: 'bg-white dark:bg-zinc-900',
    border: 'border-blue-200 dark:border-blue-800',
  },
};

// ── ToastItem ─────────────────────────────────────────────────────────────────

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: (id: string) => void }) {
  const { icon: Icon, bar, iconColor, bg, border } = TOAST_STYLES[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -12, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={`relative flex w-full max-w-sm items-start gap-3 overflow-hidden rounded-xl border shadow-lg ${bg} ${border} px-4 py-3`}
      role="alert"
      aria-live="polite"
    >
      {/* Colour bar */}
      <span className={`absolute inset-y-0 left-0 w-1 rounded-l-xl ${bar}`} />

      {/* Icon */}
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${iconColor}`} strokeWidth={2} />

      {/* Body */}
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 leading-snug">
            {toast.title}
          </p>
        )}
        <p
          className={`text-sm leading-snug ${
            toast.title
              ? 'text-zinc-500 dark:text-zinc-400'
              : 'text-zinc-700 dark:text-zinc-200 font-medium'
          }`}
        >
          {toast.message}
        </p>
      </div>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="shrink-0 rounded-md p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </motion.div>
  );
}

// ── ToastContainer ────────────────────────────────────────────────────────────

function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: string) => void;
}) {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-label="Notifications"
      className="fixed bottom-6 right-6 z-[9999] flex flex-col-reverse gap-2 w-full max-w-sm pointer-events-none"
    >
      <AnimatePresence mode="popLayout">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
