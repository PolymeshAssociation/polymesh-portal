import { useContext, useEffect } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useInjectedWeb3 } from '~/hooks/polymesh';
import { Footer, Header, Sidebar } from '~/components';
import { StyledMain, StyledPageWrapper } from './styles';
import { notifyGlobalError } from '~/helpers/notifications';

interface ILayoutProps {
  children: React.ReactNode;
}

const SharedLayout: React.FC<ILayoutProps> = ({ children }) => {
  const {
    state: { connecting, initialized, walletError },
  } = useContext(PolymeshContext);
  const { pathname } = useLocation();
  const { defaultExtension } = useInjectedWeb3();
  const isLandingPage = pathname === '/';
  const redirectToLanding =
    !defaultExtension && !isLandingPage && !connecting && !initialized;

  useEffect(() => {
    if (!walletError) return;

    notifyGlobalError(walletError);
  }, [walletError, isLandingPage]);

  return (
    <>
      {isLandingPage ? (
        <>
          <StyledMain isLandingPage={isLandingPage}>{children}</StyledMain>
          <Footer isLandingPage={isLandingPage} />
        </>
      ) : (
        <StyledPageWrapper>
          <Sidebar />
          <div className="main-wrapper">
            <Header />
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
