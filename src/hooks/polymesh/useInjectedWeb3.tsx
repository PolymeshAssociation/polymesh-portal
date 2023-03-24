// eslint-disable-next-line import/no-extraneous-dependencies
import { InjectedWindow } from '@polkadot/extension-inject/types';
import { useEffect, useMemo, useState } from 'react';
import { useLocalStorage } from '~/hooks/utility';

interface IPersistedExtension {
  extensionName: string;
  isDefault: boolean;
  authorized: boolean;
}

const win = window as Window & InjectedWindow;

const useInjectedWeb3 = () => {
  const [persistedExtensions, setPersistedExtensions] = useLocalStorage<
    IPersistedExtension[]
  >('extensions', []);
  const [injectedExtensions, setInjectedExtensions] = useState<string[]>([]);

  const extensionsInstalled = !!injectedExtensions.length;
  const defaultExtension = useMemo(
    () => persistedExtensions.find((extension) => extension?.isDefault),
    [persistedExtensions],
  );

  useEffect(() => {
    if (!win) return;

    setInjectedExtensions(Object.keys(win.injectedWeb3) || []);
  }, []);

  // Function is being triggered after sdk is successfully created
  const connectExtension = (extensionName: string, isDefault: boolean) => {
    // Case 1: There are no previously authorized extensions
    if (!persistedExtensions.length) {
      setPersistedExtensions([{ extensionName, isDefault }]);
      return;
    }

    // Case 2: Storing recently connected extension if it doesn't exist in the list
    if (
      !persistedExtensions.some(
        (extension) => extension.extensionName === extensionName,
      )
    ) {
      setPersistedExtensions([
        ...persistedExtensions,
        { extensionName, isDefault },
      ]);
      return;
    }

    // Case 3: Updating isDefault property if extension exists in the list
    setPersistedExtensions(
      persistedExtensions.map((extension) => {
        if (extension.extensionName === extensionName) {
          return { extensionName, isDefault };
        }
        return extension;
      }),
    );
  };

  return {
    connectExtension,
    extensionsInstalled,
    injectedExtensions,
    defaultExtension,
  };
};

export default useInjectedWeb3;
