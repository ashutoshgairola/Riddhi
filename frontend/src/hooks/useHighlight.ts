// src/hooks/useHighlight.ts
import { useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * Reads `?highlight=<id>` from the URL, scrolls to the element with
 * `id="highlight-<id>"` once it appears in the DOM, then removes the param.
 *
 * Elements that want to be highlightable should set `id={`highlight-${item.id}`}`.
 */
export function useHighlight(isLoading: boolean) {
  const [searchParams, setSearchParams] = useSearchParams();
  const highlightId = searchParams.get('highlight');
  const triedRef = useRef(false);

  useEffect(() => {
    if (!highlightId || isLoading || triedRef.current) return;

    // Small delay to let the list render
    const timer = setTimeout(() => {
      const el = document.getElementById(`highlight-${highlightId}`);
      if (el) {
        triedRef.current = true;
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('ring-2', 'ring-green-500', 'ring-offset-2', 'transition-all');
        // Remove highlight ring after 2.5 s
        setTimeout(() => {
          el.classList.remove('ring-2', 'ring-green-500', 'ring-offset-2', 'transition-all');
          // Clean up the URL param
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('highlight');
              return next;
            },
            { replace: true },
          );
        }, 2500);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [highlightId, isLoading, setSearchParams]);

  return highlightId;
}
