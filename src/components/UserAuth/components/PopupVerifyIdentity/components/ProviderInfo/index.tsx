import { Text, Heading } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  TIdentityProviderNames,
  IDENTITY_PROVIDERS,
} from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import { PopupActionButtons } from '../../../PopupActionButtons';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderNameContainer,
  StyledProviderName,
  StyledProviderStepsList,
} from './styles';

interface IProvideInfoProps {
  providerName: TIdentityProviderNames;
  navigate: () => void;
}

export const ProviderInfo = ({ providerName, navigate }: IProvideInfoProps) => {
  const provider = IDENTITY_PROVIDERS[providerName];
  return (
    <>
      <StyledProviderContainer>
        <StyledProviderInfo>
          <StyledProviderNameContainer>
            <Icon name={provider.icon} size="88px" />
            <StyledProviderName>
              <Heading type="h4">{provider.name}</Heading>
              <Text size="large">
                Please use the QR Code to continue verification with{' '}
                {provider.name} <br /> on your phone or continue with desktop.
              </Text>
            </StyledProviderName>
          </StyledProviderNameContainer>
          <Text>Scan QR code with your phone to continue</Text>
        </StyledProviderInfo>
        <ActionCard>
          <Heading type="h4">You will be asked to:</Heading>
          <StyledProviderStepsList>
            {provider.steps.map((step) => (
              <li key={step}>
                <Text>{step}</Text>
              </li>
            ))}
          </StyledProviderStepsList>
        </ActionCard>
      </StyledProviderContainer>
      <PopupActionButtons onGoBack={navigate} />
    </>
  );
};
