import { useEffect, useRef, type RefObject } from 'react';

/**
 * Close on outside click (not mousedown) so menu item clicks complete first.
 * Deferred by one tick so the same click that opened the panel does not close it.
 */
export function useDismissOnOutsideClick(
  ref: RefObject<HTMLElement | null>,
  open: boolean,
  onDismiss: () => void,
) {
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;

  useEffect(() => {
    if (!open) return;

    const handler = (event: MouseEvent) => {
      const root = ref.current;
      if (!root || root.contains(event.target as Node)) return;
      onDismissRef.current();
    };

    const id = window.setTimeout(() => {
      document.addEventListener('click', handler, true);
    }, 0);

    return () => {
      window.clearTimeout(id);
      document.removeEventListener('click', handler, true);
    };
  }, [open, ref]);
}
