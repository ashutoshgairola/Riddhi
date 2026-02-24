// src/components/common/Modal.tsx
import { FC, ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';

import { useBreakpoint } from '../../hooks/useBreakpoint';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

// ── Focus trap ────────────────────────────────────────────────────────────────

function useFocusTrap(ref: React.RefObject<HTMLElement | null>, active: boolean) {
  useEffect(() => {
    if (!active || !ref.current) return;
    const el = ref.current;

    const focusable = Array.from(
      el.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((n) => !n.closest('[aria-hidden="true"]'));

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const trap = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      if (focusable.length <= 1) {
        e.preventDefault();
        return;
      }
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    el.addEventListener('keydown', trap);
    return () => el.removeEventListener('keydown', trap);
  }, [active, ref]);
}

// ── Shared sub-components ─────────────────────────────────────────────────────

/** Header for form modals — back arrow (←) on mobile, ✕ on tablet/desktop. */
export const ModalHeader: FC<{ title: ReactNode; onClose: () => void }> = ({ title, onClose }) => {
  const bp = useBreakpoint();

  if (bp === 'mobile') {
    return (
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b border-gray-200 dark:border-gray-700 shrink-0">
        <button
          type="button"
          onClick={onClose}
          className="p-2 -ml-1 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 active:scale-95 transition-transform shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft size={22} />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex-1 truncate">
          {title}
        </h2>
      </div>
    );
  }

  return (
    <div className="flex justify-between items-center px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
      <button
        type="button"
        onClick={onClose}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Close"
      >
        <X size={20} />
      </button>
    </div>
  );
};

/**
 * Footer row for form modals.
 * Mobile: stacked, full-width buttons, safe-area bottom padding.
 * Tablet/Desktop: right-aligned, horizontal button row.
 */
export const ModalFooter: FC<{ children: ReactNode }> = ({ children }) => {
  const bp = useBreakpoint();

  return (
    <div
      className={[
        'shrink-0 px-6 pt-4 border-t border-gray-200 dark:border-gray-700',
        'pb-[max(1.25rem,env(safe-area-inset-bottom))]',
        'flex gap-3',
        bp === 'mobile'
          ? '[&>button]:w-full [&>button]:min-h-[48px] [&>button]:text-base flex-col'
          : 'flex-row justify-end',
      ].join(' ')}
    >
      {children}
    </div>
  );
};

// ── Modal ─────────────────────────────────────────────────────────────────────

const Modal: FC<ModalProps> = ({ isOpen, onClose, children, size = 'md' }) => {
  const bp = useBreakpoint();
  const prefersReducedMotion = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Lock body scroll
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // Escape key — desktop only
  useEffect(() => {
    if (bp !== 'desktop' || !isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, bp, onClose]);

  useFocusTrap(panelRef, isOpen);

  const desktopWidthClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }[
    size
  ];

  const panelClass = [
    'fixed z-50 bg-white dark:bg-gray-800 flex flex-col overflow-hidden shadow-2xl',
    bp === 'mobile'
      ? 'inset-0 rounded-none'
      : bp === 'tablet'
        ? 'bottom-0 inset-x-0 max-h-[85vh] rounded-t-2xl'
        : `inset-0 m-auto w-full ${desktopWidthClass} max-h-[90vh] h-fit rounded-xl`,
  ].join(' ');

  const backdropVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const panelVariants = prefersReducedMotion
    ? { hidden: { opacity: 0 }, visible: { opacity: 1 }, exit: { opacity: 0 } }
    : bp === 'desktop'
      ? {
          hidden: { opacity: 0, scale: 0.96, y: 8 },
          visible: { opacity: 1, scale: 1, y: 0 },
          exit: { opacity: 0, scale: 0.97, y: 4 },
        }
      : { hidden: { y: '100%' }, visible: { y: 0 }, exit: { y: '100%' } };

  const transition = prefersReducedMotion
    ? { duration: 0.12 }
    : bp === 'desktop'
      ? { type: 'spring' as const, stiffness: 380, damping: 32 }
      : { type: 'spring' as const, stiffness: 280, damping: 34 };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            aria-hidden="true"
            className={[
              'fixed inset-0 z-40',
              bp === 'mobile' ? 'bg-transparent' : 'bg-black/50 backdrop-blur-sm',
            ].join(' ')}
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: prefersReducedMotion ? 0.1 : 0.2 }}
            onClick={bp === 'desktop' ? onClose : undefined}
          />

          {/* Panel */}
          <motion.div
            key="panel"
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            className={panelClass}
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle — tablet only */}
            {bp === 'tablet' && (
              <div className="flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
                <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {children}
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
};

export default Modal;
