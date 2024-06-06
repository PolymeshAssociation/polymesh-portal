import { TIdentityModalType, IDENTITY_PROVIDERS } from '../../../../constants';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { SecondaryButton } from '../../../SecondaryButton';
import { ProviderCard } from '../ProviderCard';
import { StyledProvidersContainer, StyleProviderBox } from './styles';

interface IProviderSelectProps {
  handleClose: () => void;
  handleNavigate: (type: TIdentityModalType) => void;
}

export const ProviderSelect = ({
  handleClose,
  handleNavigate,
}: IProviderSelectProps) => {
  return (
    <>
      <StyledProvidersContainer>
        {Object.values(IDENTITY_PROVIDERS).map((provider) => (
          <StyleProviderBox
            key={provider.name}
            onClick={() => handleNavigate(provider.name as TIdentityModalType)}
          >
            <ProviderCard provider={provider} />
          </StyleProviderBox>
        ))}
      </StyledProvidersContainer>
      <SecondaryButton
        label="I need to onboard as a business"
        handleClick={() => handleNavigate('business')}
      />
      <PopupActionButtons goBackLabel="Close" onGoBack={handleClose} />
    </>
  );
};
