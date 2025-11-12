import { Modal } from '~/components';
import { Button, Text } from '~/components/UiKit';
import {
  ModalHeader,
  StepIndicator,
  DocumentationSection,
  ModalContent,
  ModalFooter,
  TabContainer,
  Tabs,
  Tab,
  TabContent,
  StyledDocumentation,
} from './styles';
import { EPermissionStep, EPermissionTab } from '../../constants';
import { useAddPermissionModal } from './hooks';
import { IPermissionFormData } from './constants';
import { AssetsPermissions } from './components/AssetsPermissions';
import { ExtrinsicsPermissions } from './components/ExtrinsicsPermissions';
import { PortfoliosPermissions } from './components/PortfoliosPermissions';
import { PermissionSummary } from './components/PermissionSummary';

interface IAddPermissionModalProps {
  onClose: () => void;
  onConfirm?: (key: string, permissions: IPermissionFormData) => Promise<void>;
  initialData?: IPermissionFormData;
  selectedKeyAddress?: string;
  isEdit?: boolean;
  isSubmitting?: boolean;
}

export const AddPermissionModal = ({
  onClose,
  onConfirm,
  initialData,
  selectedKeyAddress,
  isEdit = false,
  isSubmitting = false,
}: IAddPermissionModalProps) => {
  const {
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
  } = useAddPermissionModal(initialData, selectedKeyAddress, isEdit);

  const handleConfirm = async () => {
    if (onConfirm) {
      await onConfirm(selectedKey, permissions);
    }
  };

  const getStepLabel = () => {
    return currentStep === EPermissionStep.SET_PERMISSIONS ? 'Step 1 of 2' : 'Step 2 of 2';
  };

  return (
    <Modal handleClose={onClose} customWidth="800px">
      <ModalHeader>
        <h2>{isEdit ? 'Edit Permissions' : 'Add Secondary Key Permissions'}</h2>
        <StepIndicator>
          {getStepLabel()}
        </StepIndicator>
      </ModalHeader>

      <DocumentationSection>
        <StyledDocumentation>
          <Text>
            Control which assets, functions, and portfolios this secondary key can interact with. The effective permissions are determined by the intersection of Assets, Extrinsics, and Portfolios permissions.{' '}
            <a 
              href="https://developers.polymesh.network/identity/advanced/secondary-keys/#secondary-key-permissions"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more about secondary key permissions
            </a>
          </Text>
        </StyledDocumentation>
      </DocumentationSection>

      <ModalContent>
        {currentStep === EPermissionStep.SET_PERMISSIONS && (
          <TabContainer>
            <Tabs>
              <Tab
                $active={activeTab === EPermissionTab.ASSETS}
                onClick={() => setActiveTab(EPermissionTab.ASSETS)}
              >
                Assets
              </Tab>
              <Tab
                $active={activeTab === EPermissionTab.EXTRINSICS}
                onClick={() => setActiveTab(EPermissionTab.EXTRINSICS)}
              >
                Extrinsics
              </Tab>
              <Tab
                $active={activeTab === EPermissionTab.PORTFOLIOS}
                onClick={() => setActiveTab(EPermissionTab.PORTFOLIOS)}
              >
                Portfolios
              </Tab>
            </Tabs>

            <TabContent>
              {activeTab === EPermissionTab.ASSETS && (
                <AssetsPermissions
                  value={permissions.assets}
                  onChange={updateAssets}
                />
              )}
              {activeTab === EPermissionTab.EXTRINSICS && (
                <ExtrinsicsPermissions
                  value={permissions.transactions}
                  onChange={updateTransactions}
                />
              )}
              {activeTab === EPermissionTab.PORTFOLIOS && (
                <PortfoliosPermissions
                  value={permissions.portfolios}
                  onChange={updatePortfolios}
                />
              )}
            </TabContent>
          </TabContainer>
        )}

        {currentStep === EPermissionStep.REVIEW && (
          <PermissionSummary
            secondaryKey={selectedKey}
            permissions={permissions}
          />
        )}
      </ModalContent>

      <ModalFooter>
        {currentStep === EPermissionStep.REVIEW && (
          <Button variant="modalSecondary" onClick={handleBack}>
            Back
          </Button>
        )}
        <Button onClick={onClose} variant="modalSecondary">
          Cancel
        </Button>
        {currentStep === EPermissionStep.SET_PERMISSIONS ? (
          <Button variant="modalPrimary" onClick={handleNext}>
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
