import { Icon } from '~/components';
import { StyledContainer, StyledIcon, StyledTitle, StyledInfo } from './styles';

export const NotMultiSigView = () => (
  <StyledContainer>
    <StyledIcon>
      <Icon name="MultisigIcon" size="72px" className="icon" />
    </StyledIcon>
    <StyledTitle>The page is only available with a Multisig key</StyledTitle>
    <StyledInfo>Please select a multikey to use this page</StyledInfo>
  </StyledContainer>
);
