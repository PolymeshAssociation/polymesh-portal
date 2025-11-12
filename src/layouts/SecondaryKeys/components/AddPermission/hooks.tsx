import { useState, useCallback } from 'react';
import { EPermissionStep, EPermissionTab } from '../../constants';
import { IPermissionFormData, initialPermissionState } from './constants';

export const useAddPermissionModal = (
  initialData?: IPermissionFormData,
  selectedKeyAddress?: string,
  isEdit?: boolean,
) => {
  const [currentStep, setCurrentStep] = useState<EPermissionStep>(
    EPermissionStep.SET_PERMISSIONS,
  );
  const [activeTab, setActiveTab] = useState<EPermissionTab>(
    EPermissionTab.ASSETS,
  );
  const [selectedKey, setSelectedKey] = useState<string>(
    selectedKeyAddress || '',
  );
  const [permissions, setPermissions] = useState<IPermissionFormData>(
    initialData || initialPermissionState,
  );

  const handleNext = useCallback(() => {
    if (currentStep < EPermissionStep.REVIEW) {
      setCurrentStep((prev) => (prev + 1) as EPermissionStep);
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep === EPermissionStep.REVIEW) {
      setCurrentStep(EPermissionStep.SET_PERMISSIONS);
    }
  }, [currentStep]);

  const updateAssets = useCallback((
    type: 'Whole' | 'These' | 'Except' | 'None',
    values: string[],
  ) => {
    setPermissions((prev) => ({
      ...prev,
      assets: { type, values },
    }));
  }, []);

  const updateTransactions = useCallback((
    type: 'Whole' | 'These' | 'Except' | 'None',
    values: Array<{ pallet: string; extrinsics?: string[] }>,
  ) => {
    setPermissions((prev) => ({
      ...prev,
      transactions: { type, values },
    }));
  }, []);

  const updatePortfolios = useCallback((
    type: 'Whole' | 'These' | 'Except' | 'None',
    values: string[],
  ) => {
    setPermissions((prev) => ({
      ...prev,
      portfolios: { type, values },
    }));
  }, []);

  return {
    currentStep,
    activeTab,
    setActiveTab,
    selectedKey,
    permissions,
    handleNext,
    handleBack,
    updateAssets,
    updateTransactions,
    updatePortfolios,
  };
};
