import { useEffect, useState } from 'react';

const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
): [
  storedValue: T,
  setStoredValue: React.Dispatch<React.SetStateAction<T>>,
] => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  useEffect(() => {
    if (storedValue == null || typeof window === 'undefined') return;

    window.localStorage.setItem(key, JSON.stringify(storedValue));
  }, [key, storedValue]);

  return [storedValue, setStoredValue];
};

export default useLocalStorage;
