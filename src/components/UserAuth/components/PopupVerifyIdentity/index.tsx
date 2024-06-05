import { useAuthContext } from '~/context/AuthContext';
import { Modal } from '~/components';
import { PopupHeader } from '../PopupHeader';
import { ProviderSelect } from './components/ProviderSelect';
import { ProviderInfo } from './components/ProviderInfo';
import { PendingInfo } from './components/PendingInfo';
import { BusinessAccount } from './components/BusinessAccount';
import { StyledModalContent } from './styles';

export const PopupVerifyIdentity = () => {
  const { identityPopup, setIdentityPopup } = useAuthContext();

  const renderPopupContent = () => {
    const normalizedPopup = identityPopup.type?.toLowerCase();
    switch (normalizedPopup) {
      case 'providers':
        return <ProviderSelect />;
      case 'jumio':
      case 'netki':
      case 'fractal':
      case 'mockid':
        return (
          <ProviderInfo
            providerName={normalizedPopup}
            applicationUrl={identityPopup.applicationUrl}
          />
        );
      case 'business':
        return <BusinessAccount />;
      case 'pending':
        return <PendingInfo />;

      default:
        return <ProviderSelect />;
    }
  };

  if (!identityPopup.type) {
    return null;
  }

  return (
    <Modal
      handleClose={() => setIdentityPopup({ type: null })}
      customWidth="fit-content"
    >
      <StyledModalContent>
        <PopupHeader
          title="Verify Identity"
          subTitle={
            identityPopup.type === 'providers'
              ? 'We are required to verify everyone’s identity on Polymesh to ensure security for all. Please proceed with choosing a third party CDD provider to verify your identity.'
              : ''
          }
          icon="ConnectIdentityIcon"
          isWide
        />
        {renderPopupContent()}
      </StyledModalContent>
    </Modal>
  );
};
