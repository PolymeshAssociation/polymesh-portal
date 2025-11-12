import { Icon } from '~/components';
import { PATHS } from '~/constants/routes';
import {
  StyledContainer,
  StyledIcon,
  StyledInfo,
  StyledLink,
  StyledLinkGroup,
  StyledNavLink,
  StyledTitle,
} from './styles';

export const NoSecondaryKeysView = () => (
  <StyledContainer>
    <StyledIcon>
      <Icon name="KeyIcon" size="72px" className="icon" />
    </StyledIcon>
    <StyledTitle>No secondary keys attached</StyledTitle>
    <StyledInfo>
      No secondary keys are currently associated with this identity.
      <br />
      First, add a secondary key from the Authorizations page. Then return here
      to set its permissions.
    </StyledInfo>
    <StyledLinkGroup>
      <StyledNavLink to={PATHS.AUTHORIZATIONS}>
        Go to Authorizations
      </StyledNavLink>
      <StyledLink
        href="https://developers.polymesh.network/identity/advanced/secondary-keys/"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more about secondary keys
      </StyledLink>
    </StyledLinkGroup>
  </StyledContainer>
);
