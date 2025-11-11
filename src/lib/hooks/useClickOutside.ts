import { useState, useEffect } from 'react';

export function useClickOutside<T extends HTMLElement>(
  handler: () => void,
  ignoreElements?: (HTMLElement | null)[]
) {
  const [ref, setRef] = useState<T | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref && !ref.contains(event.target as Node)) {
        // Check if clicked element should be ignored
        if (ignoreElements) {
          const shouldIgnore = ignoreElements.some(
            (element) => element && element.contains(event.target as Node)
          );
          if (shouldIgnore) return;
        }
        
        handler();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [ref, handler, ignoreElements]);

  return setRef;
}