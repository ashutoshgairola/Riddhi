/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';

import { useBreakpoint } from '../hooks/useBreakpoint';

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
  const counter = useRef(0);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const dismissAll = useCallback(() => setToasts([]), []);

  // Auto-dismiss timer has moved to ToastItem to support hover-pause.
  const toast = useCallback(
    (opts: Omit<Toast, 'id'>): string => {
      const id = `toast-${++counter.current}`;
      const duration = opts.duration ?? DEFAULT_DURATION[opts.type];
      setToasts((prev) => [...prev, { ...opts, id, duration }]);
      return id;
    },
    [],
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
  const bp = useBreakpoint();
  const prefersReducedMotion = useReducedMotion();
  const duration = toast.duration ?? DEFAULT_DURATION[toast.type];

  // Progress bar (1 → 0 over duration ms)
  const [progress, setProgress] = useState(1);
  const pausedRef = useRef(false);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  // Auto-dismiss + progress tracking
  useEffect(() => {
    if (!duration) return;
    startTimeRef.current = Date.now();

    const tick = setInterval(() => {
      if (pausedRef.current) return;
      const totalElapsed = elapsedRef.current + (Date.now() - startTimeRef.current);
      const pct = Math.max(0, 1 - totalElapsed / duration);
      setProgress(pct);
      if (pct <= 0) {
        clearInterval(tick);
        onDismiss(toast.id);
      }
    }, 40);

    return () => clearInterval(tick);
  }, [duration, toast.id, onDismiss]);

  // Hover-pause — desktop only
  const handleMouseEnter = () => {
    if (bp !== 'desktop') return;
    pausedRef.current = true;
    elapsedRef.current += Date.now() - startTimeRef.current;
  };
  const handleMouseLeave = () => {
    if (bp !== 'desktop') return;
    pausedRef.current = false;
    startTimeRef.current = Date.now();
  };

  // Framer Motion per-breakpoint variants
  const variants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : bp === 'desktop'
      ? {
          hidden: { opacity: 0, x: 64, scale: 0.95 },
          visible: { opacity: 1, x: 0, scale: 1 },
          exit: { opacity: 0, x: 32, scale: 0.95 },
        }
      : {
          hidden: { opacity: 0, y: 48 },
          visible: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: 16 },
        };

  const swipeProps =
    bp !== 'desktop'
      ? {
          drag: 'x' as const,
          dragConstraints: { left: 0, right: 0 },
          dragElastic: 0.4,
          onDragEnd: (_: unknown, info: { offset: { x: number } }) => {
            if (Math.abs(info.offset.x) > 72) onDismiss(toast.id);
          },
        }
      : {};

  const isFullWidth = bp === 'mobile';

  return (
    <motion.div
      layout
      variants={variants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...swipeProps}
      className={[
        'relative flex items-start gap-3 overflow-hidden rounded-xl border shadow-lg',
        'px-4 py-3 cursor-grab active:cursor-grabbing',
        bg,
        border,
        isFullWidth ? 'w-full' : 'w-full max-w-sm',
      ].join(' ')}
      role="alert"
      aria-live="polite"
      style={{ touchAction: bp !== 'desktop' ? 'pan-y' : undefined }}
    >
      {/* Left accent bar */}
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
          className={[
            'text-sm leading-snug',
            isFullWidth ? 'truncate' : '',
            toast.title
              ? 'text-zinc-500 dark:text-zinc-400'
              : 'text-zinc-700 dark:text-zinc-200 font-medium',
          ].join(' ')}
        >
          {toast.message}
        </p>
      </div>

      {/* Dismiss — desktop only */}
      {bp === 'desktop' && (
        <button
          onClick={() => onDismiss(toast.id)}
          className="shrink-0 rounded-md p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400"
          aria-label="Dismiss notification"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* Progress bar */}
      {!!duration && !prefersReducedMotion && (
        <div className="absolute bottom-0 left-1 right-0 h-0.5 overflow-hidden rounded-br-xl">
          <div
            className={`h-full ${bar} transition-none`}
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      )}
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
  const bp = useBreakpoint();

  if (toasts.length === 0) return null;

  const maxVisible = bp === 'mobile' ? 2 : 3;
  const visible = toasts.slice(-maxVisible);

  const containerClass =
    bp === 'mobile'
      ? // Full-width, anchored to bottom, safe area padding
        'fixed bottom-0 left-0 right-0 z-[60] flex flex-col-reverse gap-2 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pointer-events-none'
      : bp === 'tablet'
        ? // Bottom-right, fixed width
          'fixed bottom-6 right-6 z-[60] flex flex-col-reverse gap-2 w-full max-w-sm pointer-events-none'
        : // Top-right desktop
          'fixed top-6 right-6 z-[60] flex flex-col-reverse gap-2 w-full max-w-sm pointer-events-none';

  return (
    <div aria-label="Notifications" className={containerClass}>
      <AnimatePresence mode="popLayout">
        {visible.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
