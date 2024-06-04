import { useState } from 'react';

export const useInput = () => {
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (newValue: string) => {
    if (error) {
      setError('');
    }
    setValue(newValue);
  };

  const handleErrorChange = (newError: string) => {
    setError(newError);
  };

  return {
    value,
    error,
    handleInputChange,
    handleErrorChange,
  };
};
