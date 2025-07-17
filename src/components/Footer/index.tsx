import { Text } from '~/components/UiKit';
import {
  StyledContainer,
  StyledFooter,
  StyledLink,
  StyledLinkList,
} from './styles';

interface IFooterProps {
  isLandingPage: boolean;
}

const Footer: React.FC<IFooterProps> = ({ isLandingPage }) => {
  return (
    <StyledFooter $isLandingPage={isLandingPage}>
      <StyledContainer $isLandingPage={isLandingPage}>
        <Text color="secondary">
          © {new Date().getFullYear()} Polymesh Labs Ltd. All rights reserved
        </Text>
        <StyledLinkList>
          <li>
            <StyledLink
              href={import.meta.env.VITE_TERMS_OF_SERVICE_URL}
              target="_blank"
            >
              Terms of Service
            </StyledLink>
          </li>
          <li>
            <StyledLink
              href={import.meta.env.VITE_PRIVACY_POLICY_URL}
              target="_blank"
            >
              Privacy Policy
            </StyledLink>
          </li>
        </StyledLinkList>
      </StyledContainer>
    </StyledFooter>
  );
};

export default Footer;
