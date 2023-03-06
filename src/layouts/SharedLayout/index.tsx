import { useLocation } from 'react-router-dom';
import { Footer, Header } from '~/components';
import { StyledMain } from './styles';

const SharedLayout = ({ children }) => {
  const { pathname } = useLocation();
  const isLandingPage = pathname === '/';

  return (
    <>
      {!isLandingPage && <Header />}
      <StyledMain isLandingPage={isLandingPage}>{children}</StyledMain>
      <Footer isLandingPage={isLandingPage} />
    </>
  );
};

export default SharedLayout;
