import styled from 'styled-components';
import { useWindowWidth } from '~/hooks/utility';
import { Text, Heading } from '~/components/UiKit';
import { Icon } from '~/components';
import { MOCKID_IDENTITY_PROVIDER } from '~/context/AuthContext/constants';
import { IIdentityProvider } from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderRegList,
  StyledTestnetLabel,
} from './styles';

// Create a wrapper to handle disabled state
const DisabledWrapper = styled.div<{ $isDisabled: boolean }>`
  position: relative;
  opacity: ${({ $isDisabled }) => ($isDisabled ? 0.5 : 1)};
  pointer-events: ${({ $isDisabled }) => ($isDisabled ? 'none' : 'auto')};
`;

interface IProviderCardProps {
  provider: IIdentityProvider;
  isTestnet: boolean;
  disabled?: boolean;
}

export const ProviderCard: React.FC<IProviderCardProps> = ({
  provider,
  isTestnet,
  disabled = false,
}) => {
  const { windowWidth } = useWindowWidth();

  // Apply the wrapper regardless of the rendering path
  return (
    <DisabledWrapper $isDisabled={disabled}>
      {isTestnet && provider.name.toLowerCase() !== MOCKID_IDENTITY_PROVIDER ? (
        // Render the Testnet label INSIDE the wrapper
        <StyledTestnetLabel>
          <Heading type="h4">{provider.name} [Not for TESTNET]</Heading>
        </StyledTestnetLabel>
      ) : (
        // Render the ActionCard INSIDE the wrapper (as before)
        <ActionCard
          hovered
          matomoData={{
            eventCategory: 'onboarding',
            eventAction: 'cdd-select',
            eventName: `${provider.name.toLowerCase()}`,
          }}
        >
          <StyledProviderContainer>
            <Icon
              name={provider.icon}
              size={windowWidth > 420 ? '88px' : '60px'}
            />
            <StyledProviderInfo>
              <Heading type="h4">
                {provider.name}{' '}
                {provider.name.toLowerCase() === MOCKID_IDENTITY_PROVIDER &&
                  '[TESTNET]'}
              </Heading>
              <div>
                {provider.name.toLowerCase() !== MOCKID_IDENTITY_PROVIDER && (
                  <Text size="small" bold>
                    REQUIREMENTS
                  </Text>
                )}
                <StyledProviderRegList>
                  {provider.requirements.map((reg) => (
                    <li key={reg}>
                      <Text size="small">{reg}</Text>
                    </li>
                  ))}
                </StyledProviderRegList>
              </div>
            </StyledProviderInfo>
          </StyledProviderContainer>
        </ActionCard>
      )}
    </DisabledWrapper>
  );
};
