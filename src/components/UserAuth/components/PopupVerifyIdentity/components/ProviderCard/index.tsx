import { useWindowWidth } from '~/hooks/utility';
import { Text, Heading } from '~/components/UiKit';
import { Icon } from '~/components';
import { IIdentityProvider } from '../../../../constants';
import { ActionCard } from '../../../ActionCard';
import {
  StyledProviderContainer,
  StyledProviderInfo,
  StyledProviderRegList,
} from './styles';

interface IProviderCardProps {
  provider: IIdentityProvider;
}

export const ProviderCard = ({ provider }: IProviderCardProps) => {
  const { windowWidth } = useWindowWidth();
  return (
    <ActionCard hovered>
      <StyledProviderContainer>
        <Icon name={provider.icon} size={windowWidth > 420 ? '88px' : '60px'} />
        <StyledProviderInfo>
          <Heading type="h4">{provider.name}</Heading>
          <div>
            <Text size="small" bold>
              REQUIREMENTS
            </Text>
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
