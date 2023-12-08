import { Icon } from '~/components';
import { Text, Heading, Button } from '~/components/UiKit';
import {
  StyledTopInfo,
  StyledTextWrapper,
  IconWrapper,
  StyledButtonWrapper,
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
        <Heading type="h4">Your account is incomplete</Heading>
      </div>
    </StyledTopInfo>
    <StyledTextWrapper>
      <Text size="medium">
        Your key must be linked to a Polymesh Account before you can start
        staking. To stake with this key, you can either onboard it through a
        Polymesh Customer Due Diligence Provider to create a new Polymesh
        Account, or assign the key to an existing Polymesh Account.
      </Text>
    </StyledTextWrapper>
    <StyledButtonWrapper $cardWidth={cardWidth}>
      <Button
        onClick={() =>
          window.open(import.meta.env.VITE_ONBOARDING_URL, '_blank')
        }
      >
        Create account
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          window.open(import.meta.env.VITE_ASSIGN_KEY_URL, '_blank')
        }
      >
        Assign key to account
      </Button>
    </StyledButtonWrapper>
  </>
);
