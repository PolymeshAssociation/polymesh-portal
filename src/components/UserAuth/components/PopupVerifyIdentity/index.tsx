import { useState } from 'react';
import { TIdentityModalType } from '../../constants';
import { PopupHeader } from '../PopupHeader';
import { ProviderSelect } from './components/ProviderSelect';
import { ProviderInfo } from './components/ProviderInfo';
import { BusinessAccount } from './components/BusinessAccount';

interface IPopupVerifyIdentityProps {
  handleClose: () => void;
  handleVerify: () => void;
}

export const PopupVerifyIdentity = ({
  handleClose,
  handleVerify,
}: IPopupVerifyIdentityProps) => {
  const [modalType, setModalType] = useState<TIdentityModalType>('providers');

  const handleNavigate = (type: TIdentityModalType) => setModalType(type);

  const renderPopupContent = () => {
    switch (modalType) {
      case 'providers':
        return (
          <ProviderSelect
            handleClose={handleClose}
            handleNavigate={handleNavigate}
          />
        );
      case 'Jumio':
      case 'Netki':
      case 'Fractal':
        return (
          <ProviderInfo
            providerName={modalType}
            navigate={() => handleNavigate('providers')}
          />
        );
      case 'business':
        return (
          <BusinessAccount
            handleClose={() => {
              handleClose();
              handleVerify();
            }}
            handleGoBack={() => handleNavigate('providers')}
          />
        );
      default:
        return (
          <ProviderSelect
            handleClose={handleClose}
            handleNavigate={handleNavigate}
          />
        );
    }
  };

  return (
    <>
      <PopupHeader
        title={
          modalType === 'business'
            ? 'Polymesh for businesses'
            : 'Verify Identity'
        }
        subTitle={
          modalType === 'providers'
            ? 'We are required to verify everyone’s identity on Polymesh to ensure security for all. Please proceed with choosing a third party CDD provider to verify your identity.'
            : ''
        }
        icon="ConnectIdentityIcon"
        handleClick={handleClose}
        isWide={modalType !== 'business'}
      />
      {renderPopupContent()}
    </>
  );
};
