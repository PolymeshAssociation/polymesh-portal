import { Modal } from '~/components';
import { useAuthContext } from '~/context/AuthContext';
import { PopupHeader } from '../PopupHeader';
import { BusinessAccount } from './components/BusinessAccount';
import { PendingInfo } from './components/PendingInfo';
import { ProviderInfo } from './components/ProviderInfo';
import { ProviderSelect } from './components/ProviderSelect';
import { StyledModalContent } from './styles';
import { BusinessProviderSelect } from './components/BusinessProviderSelect';

export const PopupVerifyIdentity = () => {
  const { identityPopup, setIdentityPopup } = useAuthContext();

  const renderPopupContent = () => {
    const normalizedPopup = identityPopup.type?.toLowerCase();
    switch (normalizedPopup) {
      case 'providers':
        return <ProviderSelect />;
      case 'business-providers':
        return <BusinessProviderSelect />;
      case 'jumio':
      case 'netki':
      case 'fractal':
      case 'finclusive':
      case 'mockid':
      case 'finclusive-kyb':
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

  let subTitle = '';
  let title = 'Verify Identity';
  if (identityPopup.type === 'providers') {
    subTitle =
      'We are required to verify everyone’s identity on Polymesh to ensure security for all. Please proceed with choosing a third party CDD provider to verify your identity.';
  } else if (identityPopup.type === 'business-providers') {
    title = 'Verify Business Identity';
    subTitle =
      "We are required to verify all the businesses' onboarding on Polymesh to ensure security for all. Please proceed with choosing a third party CDD provider to verify your business.";
  } else if (identityPopup.type === 'finclusive-kyb') {
    title = 'Verify Business Identity';
  }

  return (
    <Modal
      handleClose={() => setIdentityPopup({ type: null })}
      customWidth="fit-content"
    >
      <StyledModalContent>
        <PopupHeader
          title={title}
          subTitle={subTitle}
          icon="ConnectIdentityIcon"
          isWide
        />
        {renderPopupContent()}
      </StyledModalContent>
    </Modal>
  );
};
