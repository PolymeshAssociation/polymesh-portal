import { useState } from 'react';

const useLocalStorage = <T,>(
  key: string,
  initialValue: T,
): [storedValue: T, setValue: (value: unknown) => void] => {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      return initialValue;
    }
  });

  const setValue = (value: unknown) => {
    setStoredValue(value);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(key, JSON.stringify(value));
    }
  };
  return [storedValue, setValue];
};

export default useLocalStorage;
