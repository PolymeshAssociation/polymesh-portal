import { Icon } from '~/components';
import { Text, Heading } from '~/components/UiKit';
import { StyledTopInfo, StyledTextWrapper, IconWrapper } from '../../styles';

export const NoStakingInfo = () => (
  <>
    <StyledTopInfo>
      <IconWrapper $size="48px">
        <Icon name="StakingIcon" size="32px" className="staking-icon" />
      </IconWrapper>
      <div className="heading-wrapper">
        <Heading type="h4">No staking information</Heading>
      </div>
    </StyledTopInfo>
    <StyledTextWrapper>
      <Text size="medium">
        The selected key is not currently staking. Click the button below to
        open the staking interface where you can bond POLYX tokens to a stash
        key, nominate them to node operators and start earning staking rewards.
      </Text>
    </StyledTextWrapper>
  </>
);
