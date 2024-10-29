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

interface IProviderCardProps {
  provider: IIdentityProvider;
  isTestnet: boolean;
}

export const ProviderCard = ({ provider, isTestnet }: IProviderCardProps) => {
  const { windowWidth } = useWindowWidth();
  if (isTestnet && provider.name.toLowerCase() !== MOCKID_IDENTITY_PROVIDER) {
    return (
      <StyledTestnetLabel>
        <Heading type="h4">{provider.name} [Not for TESTNET]</Heading>
      </StyledTestnetLabel>
    );
  }

  return (
    <ActionCard
      hovered
      data-event-category="onboarding"
      data-event-action="cdd-select"
      data-event-name={`${provider.name.toLowerCase()}`}
    >
      <StyledProviderContainer>
        <Icon name={provider.icon} size={windowWidth > 420 ? '88px' : '60px'} />
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
  );
};
