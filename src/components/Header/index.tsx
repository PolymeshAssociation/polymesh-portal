import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '~/constants/routes';
import {
  StyledHeader,
  StyledHeaderContainer,
  StyledInfoList,
  StyledInfoItem,
} from './styles';
import { Heading } from '../UiKit';
import { BalanceInfo } from './components/BalanceInfo';
import { DidInfo } from './components/DidInfo';
import { KeysInfo } from './components/KeysInfo';
import { NotificationInfo } from './components/NotificationInfo';

const Header = () => {
  const [pageLabel, setPageLabel] = useState<string | null>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const currentPage = ROUTES.find(({ path }) => path === pathname);
    setPageLabel(currentPage ? currentPage.label : null);
  }, [pathname]);

  return (
    <StyledHeader>
      <StyledHeaderContainer>
        <Heading type="h2">{pageLabel}</Heading>
        <StyledInfoList>
          <StyledInfoItem>
            <BalanceInfo />
          </StyledInfoItem>
          <StyledInfoItem>
            <DidInfo />
          </StyledInfoItem>
          <StyledInfoItem>
            <KeysInfo />
          </StyledInfoItem>
          <StyledInfoItem>
            <NotificationInfo />
          </StyledInfoItem>
        </StyledInfoList>
      </StyledHeaderContainer>
    </StyledHeader>
  );
};

export default Header;
