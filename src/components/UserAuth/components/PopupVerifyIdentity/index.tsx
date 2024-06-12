import { useAuthContext } from '~/context/AuthContext';
import { Modal } from '~/components';
import { PopupHeader } from '../PopupHeader';
import { ProviderSelect } from './components/ProviderSelect';
import { ProviderInfo } from './components/ProviderInfo';
import { PendingInfo } from './components/PendingInfo';
import { StyledModalContent } from './styles';

export const PopupVerifyIdentity = () => {
  const { identityPopup, setIdentityPopup } = useAuthContext();

  const renderPopupContent = () => {
    switch (identityPopup) {
      case 'providers':
        return <ProviderSelect />;
      case 'Jumio':
      case 'Netki':
      case 'Fractal':
      case 'MockID':
        return <ProviderInfo providerName={identityPopup} />;
      // case 'business':
      //   return (
      //     <BusinessAccount
      //       handleClose={() => {
      //         handleClose();
      //         handleVerify();
      //       }}
      //       handleGoBack={() => handleNavigate('providers')}
      //     />
      //   );
      case 'pending':
        return <PendingInfo />;

      default:
        return <ProviderSelect />;
    }
  };

  if (!identityPopup) {
    return null;
  }

  return (
    <Modal handleClose={() => setIdentityPopup(null)} customWidth="fit-content">
      <StyledModalContent>
        <PopupHeader
          title="Verify Identity"
          subTitle={
            identityPopup === 'providers'
              ? 'We are required to verify everyone’s identity on Polymesh to ensure security for all. Please proceed with choosing a third party CDD provider to verify your identity.'
              : ''
          }
          icon="ConnectIdentityIcon"
          handleClick={() => setIdentityPopup(null)}
          isWide
        />
        {renderPopupContent()}
      </StyledModalContent>
    </Modal>
  );
};
