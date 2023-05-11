import { useContext, useEffect, useState } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useInjectedWeb3 } from '~/hooks/polymesh';
import { Footer, Header, Sidebar } from '~/components';
import { StyledMain, StyledPageWrapper } from './styles';
import { useWindowWidth } from '~/hooks/utility';

interface ILayoutProps {
  children: React.ReactNode;
}

const SharedLayout: React.FC<ILayoutProps> = ({ children }) => {
  const {
    state: { connecting, initialized },
  } = useContext(PolymeshContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useWindowWidth();
  const { pathname } = useLocation();
  const { defaultExtension } = useInjectedWeb3();
  const isLandingPage = pathname === '/';
  const redirectToLanding =
    !defaultExtension && !isLandingPage && !connecting && !initialized;

  useEffect(() => {
    if (!isMobile) return;

    setMobileMenuOpen(false);
  }, [isMobile]);

  const toggleMobileMenu = () => setMobileMenuOpen((prev) => !prev);

  return (
    <>
      {isLandingPage ? (
        <>
          <StyledMain isLandingPage={isLandingPage}>{children}</StyledMain>
          <Footer isLandingPage={isLandingPage} />
        </>
      ) : (
        <StyledPageWrapper>
          <Sidebar
            mobileMenuOpen={mobileMenuOpen}
            toggleMobileMenu={toggleMobileMenu}
          />
          <div className="main-wrapper">
            <Header toggleMobileMenu={toggleMobileMenu} />
            <StyledMain isLandingPage={isLandingPage}>{children}</StyledMain>
            <Footer isLandingPage={isLandingPage} />
          </div>
        </StyledPageWrapper>
      )}
      {!isLandingPage && redirectToLanding && <Navigate to="/" replace />}
    </>
  );
};

export default SharedLayout;
