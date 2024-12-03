import { useEffect, useState, Suspense, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Footer,
  Header,
  Sidebar,
  LoadingFallback,
  UserAuth,
} from '~/components';
import { PopupConnectWallet } from '~/components/UserAuth/components/PopupConnectWallet';
import { PopupVerifyIdentity } from '~/components/UserAuth/components/PopupVerifyIdentity';
import { StyledMain, StyledPageWrapper } from './styles';
import { useWindowWidth } from '~/hooks/utility';
import { Heading } from '~/components/UiKit';
import { ROUTES } from '~/constants/routes';
import { AccountContext } from '~/context/AccountContext';
import { useExternalKeyWarningToast } from '~/hooks/polymesh/UseExternalKeyWarningToast';

interface ILayoutProps {
  children: React.ReactNode;
}

const SharedLayout: React.FC<ILayoutProps> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isMobile } = useWindowWidth();
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';

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

  const { isExternalConnection, identityLoading } = useContext(AccountContext);
  const { showExternalKeyWarningToast, hideExternalKeyWarningToast } =
    useExternalKeyWarningToast();

  useEffect(() => {
    if (identityLoading) return;

    if (isExternalConnection) {
      showExternalKeyWarningToast();
    } else {
      hideExternalKeyWarningToast();
    }
  }, [
    hideExternalKeyWarningToast,
    identityLoading,
    isExternalConnection,
    showExternalKeyWarningToast,
  ]);

  return (
    <>
      <StyledPageWrapper>
        <Sidebar
          mobileMenuOpen={mobileMenuOpen}
          toggleMobileMenu={toggleMobileMenu}
        />
        <div className="main-wrapper">
          <Header toggleMobileMenu={toggleMobileMenu} />
          <StyledMain $isLandingPage={isLandingPage}>
            {pathname !== '/settings' && <UserAuth />}
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
      <PopupConnectWallet />
      <PopupVerifyIdentity />
    </>
  );
};

export default SharedLayout;
