import { useContext, useEffect, useState, Suspense } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { Footer, Header, Sidebar, LoadingFallback } from '~/components';
import { StyledMain, StyledPageWrapper } from './styles';
import { useWindowWidth } from '~/hooks/utility';
import { Heading } from '~/components/UiKit';
import { ROUTES } from '~/constants/routes';

interface ILayoutProps {
  children: React.ReactNode;
}

const SharedLayout: React.FC<ILayoutProps> = ({ children }) => {
  const {
    state: { connecting, initialized },
    settings: { defaultExtension },
  } = useContext(PolymeshContext);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useWindowWidth();
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';
  const redirectToLanding =
    !defaultExtension && !isLandingPage && !connecting && !initialized;

  useEffect(() => {
    if (!isMobile) {
      document.body.classList.remove('no-scroll');
      return;
    }

    setMobileMenuOpen((prev) => {
      if (prev) {
        document.body.classList.remove('no-scroll');
      }
      return false;
    });
  }, [isMobile]);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => {
      if (prev) {
        document.body.classList.remove('no-scroll');
      } else {
        document.body.classList.add('no-scroll');
      }
      return !prev;
    });
  };

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
            <StyledMain isLandingPage={isLandingPage}>
              {isMobile && (
                <Heading type="h2" marginBottom={24}>
                  {ROUTES.find(({ path }) => path === pathname)?.label || null}
                </Heading>
              )}
              <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
            </StyledMain>
            <Footer isLandingPage={isLandingPage} />
          </div>
        </StyledPageWrapper>
      )}
      {!isLandingPage && redirectToLanding && <Navigate to="/" replace />}
    </>
  );
};

export default SharedLayout;
