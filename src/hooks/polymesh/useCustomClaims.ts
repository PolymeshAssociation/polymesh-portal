import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useCallback, useContext, useState } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';

export interface CustomClaim {
  id: BigNumber;
  name: string;
}

export interface UseCustomClaimsReturn {
  validateCustomClaim: (claimNameOrId: string) => Promise<CustomClaim | null>;
  createModalState: {
    isOpen: boolean;
    pendingName: string;
    pendingCallback: ((claim: CustomClaim) => void) | null;
  };
  handleCreateModalClose: () => void;
  handleCreateModalOpen: (
    name: string,
    callback: (claim: CustomClaim) => void,
  ) => void;
  handleCustomClaimCreated: (claim: CustomClaim) => void;
  getClaimName: (id: BigNumber) => Promise<string>;
  claimNames: Record<string, string>;
}

export const useCustomClaims = (): UseCustomClaimsReturn => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  const [claimNames, setClaimNames] = useState<Record<string, string>>({});
  const [createModalState, setCreateModalState] = useState({
    isOpen: false,
    pendingName: '',
    pendingCallback: null as ((claim: CustomClaim) => void) | null,
  });

  const getClaimName = useCallback(
    async (id: BigNumber): Promise<string> => {
      if (!sdk) {
        return 'Unknown';
      }

      const idString = id.toString();
      if (claimNames[idString]) {
        return claimNames[idString];
      }

      try {
        const claim = await sdk.claims.getCustomClaimTypeById(id);
        if (!claim) {
          return 'Unknown';
        }

        setClaimNames((prev) => ({ ...prev, [idString]: claim.name }));
        return claim.name;
      } catch (error) {
        notifyError(`Failed to fetch claim name:${(error as Error).message}`);
        return 'Unknown';
      }
    },
    [sdk, claimNames],
  );

  const validateCustomClaim = async (
    claimNameOrId: string,
  ): Promise<CustomClaim | null> => {
    if (!sdk) {
      throw new Error('Failed to get custom claim. SDK not available');
    }

    try {
      if (Number.isNaN(Number(claimNameOrId))) {
        const claim = await sdk.claims.getCustomClaimTypeByName(claimNameOrId);
        if (!claim) {
          return null;
        }
        // Cache the name when we validate a claim
        setClaimNames((prev) => ({
          ...prev,
          [claim.id.toString()]: claim.name,
        }));
        return { id: claim.id, name: claim.name };
      }
      const claim = await sdk.claims.getCustomClaimTypeById(
        new BigNumber(claimNameOrId),
      );
      if (!claim) {
        throw new Error(`Custom claim ID ${claimNameOrId} does not exist`);
      }
      // Cache the name when we validate a claim
      setClaimNames((prev) => ({
        ...prev,
        [claim.id.toString()]: claim.name,
      }));
      return { id: claim.id, name: claim.name };
    } catch (error) {
      notifyError((error as Error).message);
      return null;
    }
  };

  const handleCreateModalClose = () => {
    setCreateModalState({
      isOpen: false,
      pendingName: '',
      pendingCallback: null,
    });
  };

  const handleCreateModalOpen = (
    name: string,
    callback: (claim: CustomClaim) => void,
  ) => {
    setCreateModalState({
      isOpen: true,
      pendingName: name,
      pendingCallback: callback,
    });
  };

  const handleCustomClaimCreated = (claim: CustomClaim) => {
    // Cache the name when a new claim is created
    setClaimNames((prev) => ({
      ...prev,
      [claim.id.toString()]: claim.name,
    }));

    if (createModalState.pendingCallback) {
      createModalState.pendingCallback(claim);
    }
    handleCreateModalClose();
  };

  return {
    validateCustomClaim,
    createModalState,
    handleCreateModalClose,
    handleCreateModalOpen,
    handleCustomClaimCreated,
    getClaimName,
    claimNames,
  };
};
