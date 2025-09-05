import { useState } from 'react';
import { Text } from '~/components/UiKit';
import { CookieDeclarationModal } from '~/components';
import {
  StyledContainer,
  StyledFooter,
  StyledFooterLink,
  StyledLinkList,
} from './styles';

interface IFooterProps {
  isLandingPage: boolean;
}

const Footer: React.FC<IFooterProps> = ({ isLandingPage }) => {
  const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);

  const handleOpenCookieModal = () => {
    setIsCookieModalOpen(true);
  };

  const handleCloseCookieModal = () => {
    setIsCookieModalOpen(false);
  };

  return (
    <>
      <StyledFooter $isLandingPage={isLandingPage}>
        <StyledContainer $isLandingPage={isLandingPage}>
          <Text color="secondary">
            © {new Date().getFullYear()} Polymesh Labs Ltd. All rights reserved
          </Text>
          <StyledLinkList>
            <li>
              <StyledFooterLink
                href={import.meta.env.VITE_TERMS_OF_SERVICE_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Terms of Service
              </StyledFooterLink>
            </li>
            <li>
              <StyledFooterLink
                href={import.meta.env.VITE_PRIVACY_POLICY_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                Privacy Policy
              </StyledFooterLink>
            </li>
            <li>
              <StyledFooterLink as="button" onClick={handleOpenCookieModal}>
                Cookie Declaration
              </StyledFooterLink>
            </li>
          </StyledLinkList>
        </StyledContainer>
      </StyledFooter>

      <CookieDeclarationModal
        isOpen={isCookieModalOpen}
        onClose={handleCloseCookieModal}
      />
    </>
  );
};

export default Footer;
