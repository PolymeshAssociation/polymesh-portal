import {
  StyledFooter,
  StyledContainer,
  StyledLinkList,
  StyledLink,
} from './styles';
import { Text } from '~/components/UiKit';

interface IFooterProps {
  isLandingPage: boolean;
}

const Footer: React.FC<IFooterProps> = ({ isLandingPage }) => {
  return (
    <StyledFooter isLandingPage={isLandingPage}>
      <StyledContainer isLandingPage={isLandingPage}>
        <Text>© 2022 Polymesh Association. All rights reserved</Text>
        <StyledLinkList>
          <li>
            <StyledLink href="https://somelink.com" target="_blank">
              Terms of Service
            </StyledLink>
          </li>
          <li>
            <StyledLink href="https://somelink.com" target="_blank">
              Privacy Policy
            </StyledLink>
          </li>
        </StyledLinkList>
      </StyledContainer>
    </StyledFooter>
  );
};

export default Footer;
