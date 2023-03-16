import { useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useInjectedWeb3 } from '~/hooks/polymesh';
import { Footer, Header, Sidebar } from '~/components';
import { StyledMain, StyledPageWrapper } from './styles';

const SharedLayout = ({ children }) => {
  const {
    state: { connecting, initialized },
  } = useContext(PolymeshContext);
  const { pathname } = useLocation();
  const { defaultExtension } = useInjectedWeb3();
  const isLandingPage = pathname === '/';
  const redirectToLanding =
    !defaultExtension && !isLandingPage && !connecting && !initialized;

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
