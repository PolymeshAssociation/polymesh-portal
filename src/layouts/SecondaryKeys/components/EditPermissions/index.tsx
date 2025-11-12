import { Modal } from '~/components';
import { Button } from '~/components/UiKit';
import { StyledLink } from '~/layouts/AssetManager/components/CreateAssetWizard/styles';
import { EPermissionStep, IPermissionFormData } from '../../types';
import { AssetsPermissions } from './components/AssetsPermissions';
import { ExtrinsicsPermissions } from './components/ExtrinsicsPermissions';
import { PermissionSummary } from './components/PermissionSummary';
import { PortfoliosPermissions } from './components/PortfoliosPermissions';
import { useEditPermissionModal } from './hooks';
import {
  ModalContent,
  ModalFooter,
  ModalHeader,
  StepDescription,
  StepIndicator,
} from './styles';

interface IEditPermissionsModalProps {
  onClose: () => void;
  onConfirm?: (key: string, permissions: IPermissionFormData) => Promise<void>;
  initialData: IPermissionFormData;
  selectedKeyAddress: string;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export const EditPermissionsModal = ({
  onClose,
  onConfirm,
  initialData,
  selectedKeyAddress,
  isEdit = false,
  isSubmitting = false,
}: IEditPermissionsModalProps) => {
  const {
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
  } = useEditPermissionModal(initialData, selectedKeyAddress);

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(selectedKey, permissions);
    }
  };

  const getStepLabel = () => {
    const totalSteps = EPermissionStep.REVIEW;
    const stepNames: Record<EPermissionStep, string> = {
      [EPermissionStep.ASSETS]: 'Assets',
      [EPermissionStep.EXTRINSICS]: 'Transactions',
      [EPermissionStep.PORTFOLIOS]: 'Portfolios',
      [EPermissionStep.REVIEW]: 'Review',
    };
    return `Step ${currentStep} of ${totalSteps} - ${stepNames[currentStep]}`;
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case EPermissionStep.ASSETS:
        return 'Define which assets this key can interact with. The asset permissions combine with transaction and portfolio permissions to determine what this key can actually do.';
      case EPermissionStep.EXTRINSICS:
        return 'Specify which blockchain functions (pallets and methods) this key is allowed to execute. Combined with asset and portfolio permissions.';
      case EPermissionStep.PORTFOLIOS:
        return 'Choose which portfolios this key can access and manage. Portfolio permissions are intersected with asset and transaction permissions.';
      case EPermissionStep.REVIEW:
        return 'Review your settings and confirm the permissions for this secondary key before signing.';
      default:
        return '';
    }
  };

  return (
    <Modal handleClose={onClose} customWidth="800px">
      <ModalHeader>
        <h2>{isEdit ? 'Edit Permissions' : 'Add Secondary Key Permissions'}</h2>
        <StepIndicator>{getStepLabel()}</StepIndicator>
      </ModalHeader>

      <ModalContent>
        <StepDescription>
          {getStepDescription()}
          <div style={{ marginTop: '12px' }}>
            <StyledLink
              href="https://developers.polymesh.network/identity/advanced/secondary-keys/#secondary-key-permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about secondary key permissions
            </StyledLink>
          </div>
        </StepDescription>
        {currentStep === EPermissionStep.ASSETS && (
          <AssetsPermissions
            value={permissions.assets}
            onChange={updateAssets}
            validationError={validationError}
            resolvedAssets={resolvedAssets}
            onResolveAsset={addResolvedAsset}
          />
        )}

        {currentStep === EPermissionStep.EXTRINSICS && (
          <ExtrinsicsPermissions
            value={permissions.transactions}
            onChange={updateTransactions}
            validationError={validationError}
          />
        )}

        {currentStep === EPermissionStep.PORTFOLIOS && (
          <PortfoliosPermissions
            value={permissions.portfolios}
            onChange={updatePortfolios}
            validationError={validationError}
          />
        )}

        {currentStep === EPermissionStep.REVIEW && (
          <PermissionSummary
            secondaryKey={selectedKey}
            permissions={permissions}
            resolvedAssets={resolvedAssets}
          />
        )}
      </ModalContent>

      <ModalFooter>
        {currentStep !== EPermissionStep.ASSETS && (
          <Button variant="modalSecondary" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button onClick={onClose} variant="modalSecondary">
          Cancel
        </Button>
        {currentStep !== EPermissionStep.REVIEW ? (
          <Button
            variant="modalPrimary"
            onClick={handleNext}
            disabled={!!validationError}
            title={validationError || 'Proceed to next step'}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="modalPrimary"
            onClick={handleConfirm}
            disabled={isSubmitting}
          >
            Confirm & Sign
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
};
