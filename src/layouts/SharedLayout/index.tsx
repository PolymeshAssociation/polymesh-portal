import { useContext } from 'react';
import { useLocation, Navigate } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useInjectedWeb3 } from '~/hooks/polymesh';
import { Footer, Header } from '~/components';
import { StyledMain } from './styles';

const SharedLayout = ({ children }) => {
  const {
    state: { connecting, initialized },
  } = useContext(PolymeshContext);
  const { pathname } = useLocation();
  const { defaultAuthorizedExtension } = useInjectedWeb3();
  const isLandingPage = pathname === '/';
  const redirectToLanding =
    !defaultAuthorizedExtension &&
    !isLandingPage &&
    !connecting &&
    !initialized;

  return (
    <>
      {!isLandingPage && <Header />}
      {!isLandingPage && redirectToLanding && <Navigate to="/" replace />}
      <StyledMain isLandingPage={isLandingPage}>{children}</StyledMain>
      <Footer isLandingPage={isLandingPage} />
    </>
  );
};

export default SharedLayout;
