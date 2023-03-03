// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '~/hooks/utility';

interface IPersistedExtension {
  name: string;
  authorized: boolean;
  recent: boolean;
}

const win = window as Window & InjectedWindow;

const useInjectedWeb3 = () => {
  const [persistedExtensions, setPersistedExtensions] = useLocalStorage<
    IPersistedExtension[]
  >('extensions', []);
  const [injectedExtensions, setInjectedExtensions] = useState<string[]>([]);

  const extensionsInstalled = !!injectedExtensions.length;
  const recentExtension = useMemo(
    () =>
      persistedExtensions.find(
        (extension) => extension?.recent && extension?.authorized,
      ),
    [persistedExtensions],
  );

  useEffect(() => {
    if (!win) return;

    setInjectedExtensions(Object.keys(win.injectedWeb3) || []);
  }, []);

  // Function is being triggered after sdk is successfully created
  const connectExtension = (name: string) => {
    // Case 1: There are no previously authorized extensions
    if (!persistedExtensions.length) {
      setPersistedExtensions([{ name, authorized: true, recent: true }]);
      return;
    }

    // Case 2: First time connecting current extension
    if (!persistedExtensions.some((extension) => extension.name === name)) {
      setPersistedExtensions([
        ...persistedExtensions,
        { name, authorized: true, recent: true },
      ]);
      return;
    }
    // Case 3: Current extension previously connected, updating its data
    const updatedExtensions = persistedExtensions.map((extension) => {
      if (extension.name === name) {
        return { ...extension, authorized: true, recent: true };
      }
      return { ...extension, recent: false };
    });

    setPersistedExtensions(updatedExtensions);
  };

  return {
    connectExtension,
    extensionsInstalled,
    recentExtension,
  };
};

export default useInjectedWeb3;
