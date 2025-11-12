import { useCallback, useMemo, useState } from 'react';
import {
  EPermissionStep,
  ExtrinsicPermissionScopeType,
  IPermissionFormData,
  PermissionScopeType,
} from '../../types';
import { AssetDetails } from '../../utils';

const VALIDATION_MESSAGES = {
  ASSET_THESE_REQUIRED:
    'At least one asset must be selected when using "These" permission type',
  ASSET_EXCLUDE_REQUIRED:
    'At least one asset must be selected when using "Exclude" permission type',
  EXTRINSIC_THESE_REQUIRED:
    'At least one extrinsic must be selected when using "Specific modules and/or methods" permission type',
  PORTFOLIO_EXCLUDE_REQUIRED:
    'At least one portfolio must be selected when using "Exclude" permission type',
  PORTFOLIO_THESE_REQUIRED:
    'At least one portfolio must be selected when using "Specific portfolios only" permission type',
} as const;

export const useEditPermissionModal = (
  initialData: IPermissionFormData,
  selectedKeyAddress: string,
) => {
  const [currentStep, setCurrentStep] = useState<EPermissionStep>(
    EPermissionStep.ASSETS,
  );
  const [selectedKey] = useState<string>(selectedKeyAddress);
  const [permissions, setPermissions] =
    useState<IPermissionFormData>(initialData);
  const [resolvedAssets, setResolvedAssets] = useState<AssetDetails[]>([]);
  const validationError = useMemo(() => {
    if (currentStep === EPermissionStep.ASSETS) {
      if (
        permissions.assets.type === 'Except' &&
        permissions.assets.values.length === 0
      ) {
        return VALIDATION_MESSAGES.ASSET_EXCLUDE_REQUIRED;
      }
      if (
        permissions.assets.type === 'These' &&
        permissions.assets.values.length === 0
      ) {
        return VALIDATION_MESSAGES.ASSET_THESE_REQUIRED;
      }
    }

    if (currentStep === EPermissionStep.EXTRINSICS) {
      if (
        permissions.transactions.type === 'These' &&
        permissions.transactions.values.length === 0
      ) {
        return VALIDATION_MESSAGES.EXTRINSIC_THESE_REQUIRED;
      }
    }

    if (currentStep === EPermissionStep.PORTFOLIOS) {
      if (
        permissions.portfolios.type === 'Except' &&
        permissions.portfolios.values.length === 0
      ) {
        return VALIDATION_MESSAGES.PORTFOLIO_EXCLUDE_REQUIRED;
      }
      if (
        permissions.portfolios.type === 'These' &&
        permissions.portfolios.values.length === 0
      ) {
        return VALIDATION_MESSAGES.PORTFOLIO_THESE_REQUIRED;
      }
    }

    return '';
  }, [
    currentStep,
    permissions.assets,
    permissions.portfolios,
    permissions.transactions,
  ]);

  const handleNext = useCallback(() => {
    if (currentStep < EPermissionStep.REVIEW) {
      setCurrentStep((prev) => (prev + 1) as EPermissionStep);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > EPermissionStep.ASSETS) {
      setCurrentStep((prev) => (prev - 1) as EPermissionStep);
    }
  }, [currentStep]);

  const updateAssets = useCallback(
    (type: PermissionScopeType, values: string[]) => {
      setPermissions((prev) => ({
        ...prev,
        assets: { type, values },
      }));
    },
    [],
  );

  const updateTransactions = useCallback(
    (
      type: ExtrinsicPermissionScopeType,
      values: Array<{ pallet: string; extrinsics?: string[] | null }>,
    ) => {
      setPermissions((prev) => ({
        ...prev,
        transactions: { type, values },
      }));
    },
    [],
  );

  const updatePortfolios = useCallback(
    (
      type: PermissionScopeType,
      values: Array<{ id: string; name?: string; ownerDid?: string }>,
    ) => {
      setPermissions((prev) => ({
        ...prev,
        portfolios: { type, values },
      }));
    },
    [],
  );

  const addResolvedAsset = useCallback((asset: AssetDetails) => {
    setResolvedAssets((prev) => {
      const existingIndex = prev.findIndex((item) => item.id === asset.id);
      if (existingIndex === -1) {
        return [...prev, asset];
      }

      const updated = [...prev];
      const existing = updated[existingIndex];
      updated[existingIndex] = {
        ...existing,
        name: asset.name || existing.name,
        ticker: asset.ticker || existing.ticker,
      };
      return updated;
    });
  }, []);

  return {
    currentStep,
    selectedKey,
    permissions,
    handleNext,
    handleBack,
    updateAssets,
    updateTransactions,
    updatePortfolios,
    resolvedAssets,
    addResolvedAsset,
    validationError,
  };
};
