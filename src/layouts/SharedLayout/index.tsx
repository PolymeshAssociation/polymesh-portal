import { useLocation } from 'react-router-dom';
import { Footer, Header } from '~/components';
import { StyledMain } from './styles';

const SharedLayout = ({ children }) => {
  const { pathname } = useLocation();

  return (
    <>
      {pathname !== '/' && <Header />}
      <StyledMain>{children}</StyledMain>
      <Footer />
    </>
  );
};

export default SharedLayout;
