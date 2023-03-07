import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { StyledHeader, StyledInfoList, StyledInfoItem } from './styles';
import { Heading } from '../UiKit';
import { ROUTES } from '~/constants/routes';

const Header = () => {
  const [pageLabel, setPageLabel] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const currentPage = ROUTES.find(({ path }) => path === pathname);
    setPageLabel(currentPage ? currentPage.label : null);
  }, [pathname]);

  return (
    <StyledHeader>
      <Heading type="h2">{pageLabel}</Heading>
      <StyledInfoList>
        <StyledInfoItem>balance</StyledInfoItem>
        <StyledInfoItem>DID</StyledInfoItem>
      </StyledInfoList>
    </StyledHeader>
  );
};

export default Header;
