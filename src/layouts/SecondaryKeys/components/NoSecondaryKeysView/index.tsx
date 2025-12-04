import { Icon } from '~/components';
import { StyledContainer, StyledIcon, StyledTitle, StyledInfo, StyledLink } from './styles';

export const NoSecondaryKeysView = () => (
  <StyledContainer>
    <StyledIcon>
      <Icon name="KeyIcon" size="72px" className="icon" />
    </StyledIcon>
    <StyledTitle>The page is only available with a primary key that has secondary key(s) attached</StyledTitle>
    <StyledInfo>Please select a primary key with attached secondary keys to use this page</StyledInfo>
    <StyledLink
      href="https://developers.polymesh.network/identity/advanced/secondary-keys/"
      target="_blank"
      rel="noopener noreferrer"
    >
      Learn more about secondary keys
    </StyledLink>
  </StyledContainer>
);
