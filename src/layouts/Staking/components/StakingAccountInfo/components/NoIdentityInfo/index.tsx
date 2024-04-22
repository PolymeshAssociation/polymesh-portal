import { Icon } from '~/components';
import { Text, Heading, Button } from '~/components/UiKit';
import {
  StyledTopInfo,
  StyledTextWrapper,
  IconWrapper,
  StyledButtonWrapper,
  StyledLink,
} from '../../styles';

interface INoIdentityInfoProps {
  cardWidth: number;
  isMobile: boolean;
}

export const NoIdentityInfo: React.FC<INoIdentityInfoProps> = ({
  cardWidth,
  isMobile,
}) => (
  <>
    <StyledTopInfo>
      {!isMobile && (
        <IconWrapper $size="48px">
          <Icon name="IdCard" size="32px" className="id-icon" />
        </IconWrapper>
      )}
      <div className="heading-wrapper">
        <Heading type="h4">This key is not linked to an account</Heading>
      </div>
    </StyledTopInfo>
    <StyledTextWrapper>
      <Text size="medium">
        Your key must be linked to a Polymesh Account before you can start
        staking. Complete onboarding to link this key to a new Polymesh account.
        If you have already completed onboarding and want to assign this key to
        an existing account,{' '}
        <StyledLink
          href={import.meta.env.VITE_ASSIGN_KEY_URL}
          target="_blank"
          rel="noopener noreferrer"
        >
          click here
        </StyledLink>{' '}
        to learn how.
      </Text>
    </StyledTextWrapper>
    <StyledButtonWrapper $cardWidth={cardWidth}>
      <Button
        onClick={() =>
          window.open(import.meta.env.VITE_ONBOARDING_URL, '_blank')
        }
      >
        Complete onboarding
      </Button>
    </StyledButtonWrapper>
  </>
);
