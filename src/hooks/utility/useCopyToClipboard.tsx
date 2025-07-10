import { useCallback, useEffect, useState } from 'react';

function useCopyToClipboard(timeout = 2000) {
  const [isCopied, setIsCopied] = useState(false);
  const [copySuccess, setCopySuccess] = useState(true); // true = success, false = failure

  const copy = useCallback(async (text: string | number | undefined) => {
    if (text === undefined || text === null) {
      setCopySuccess(false);
      setIsCopied(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(text.toString());
      setCopySuccess(true);
    } catch {
      setCopySuccess(false);
    }

    setIsCopied(true);
  }, []);

  useEffect(() => {
    if (!isCopied) return undefined;

    const id = setTimeout(() => {
      setIsCopied(false);
    }, timeout);

    return () => clearTimeout(id);
  }, [isCopied, timeout]);

  return { copy, isCopied, copySuccess };
}

export default useCopyToClipboard;
