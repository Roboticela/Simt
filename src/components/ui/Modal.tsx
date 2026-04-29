import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const SIZE = { sm: 'max-w-md', md: 'max-w-xl', lg: 'max-w-3xl' };

export function Modal({ open, onClose, title, children, size = 'md' }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/30 p-0 backdrop-blur-sm sm:items-center sm:p-4"
          onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            key="modal-panel"
            initial={{ opacity: 0, y: 40, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.97 }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            className={[
              'flex max-h-[90vh] w-full flex-col border border-border/60 bg-card',
              'rounded-t-3xl sm:rounded-3xl',
              SIZE[size],
            ].join(' ')}
          >
            {title && (
              <header className="flex items-center justify-between gap-3 border-b border-border/50 px-5 py-4">
                <h2 className="text-base font-bold text-foreground">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-2xl text-foreground/50 hover:bg-accent hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>
            )}
            <div className="overflow-y-auto custom-scrollbar p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
