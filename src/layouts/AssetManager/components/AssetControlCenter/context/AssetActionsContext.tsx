import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import type { Asset } from '@polymeshassociation/polymesh-sdk/types';
import useAssetActions from '~/hooks/polymesh/useAssetActions';

// Define the context type based on the return type of useAssetActions
type AssetActionsContextType =
  | (ReturnType<typeof useAssetActions> & {
      refreshAssetDetails?: () => void | Promise<void>;
    })
  | null;

// Create the context
const AssetActionsContext = createContext<AssetActionsContextType>(null);

// Provider props interface
interface AssetActionsProviderProps {
  children: ReactNode;
  assetInstance?: Asset;
  onTransactionSuccess?: () => void | Promise<void>;
  refreshAssetDetails?: () => void | Promise<void>;
}

// Provider component
export const AssetActionsProvider: React.FC<AssetActionsProviderProps> = ({
  children,
  assetInstance,
  onTransactionSuccess,
  refreshAssetDetails,
}) => {
  const assetActions = useAssetActions(assetInstance, onTransactionSuccess);

  const contextValue = useMemo(
    () => ({ ...assetActions, refreshAssetDetails }),
    [assetActions, refreshAssetDetails],
  );

  return (
    <AssetActionsContext.Provider value={contextValue}>
      {children}
    </AssetActionsContext.Provider>
  );
};

// Custom hook to use the context
export const useAssetActionsContext = () => {
  const context = useContext(AssetActionsContext);

  if (context === null) {
    throw new Error(
      'useAssetActionsContext must be used within an AssetActionsProvider',
    );
  }

  return context;
};

// Export the context for advanced use cases
export { AssetActionsContext };
