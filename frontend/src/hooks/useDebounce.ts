import { useState, useEffect } from 'react';
import { debounce } from '@/utils';

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = debounce(() => {
      setDebouncedValue(value);
    }, delay);

    handler();

    return () => {
      // Cleanup function to cancel the debounced call
    };
  }, [value, delay]);

  return debouncedValue;
}
