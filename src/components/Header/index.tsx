import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ROUTES } from '~/constants/routes';
import {
  StyledHeader,
  StyledHeaderContainer,
  StyledInfoList,
  StyledInfoItem,
  StyledCloseMenuButton,
} from './styles';
import { Heading } from '../UiKit';
import { BalanceInfo } from './components/BalanceInfo';
import { DidInfo } from './components/DidInfo';
import { KeysInfo } from './components/KeysInfo';
import { NotificationInfo } from './components/NotificationInfo';
import { useWindowWidth } from '~/hooks/utility';
import Icon from '../Icon';

interface IHeaderProps {
  toggleMobileMenu: () => void;
}

const Header: React.FC<IHeaderProps> = ({ toggleMobileMenu }) => {
  const [pageLabel, setPageLabel] = useState<string | null>(null);
  const { pathname } = useLocation();
  const { isMobile } = useWindowWidth();

  useEffect(() => {
    const currentPage = ROUTES.find(({ path }) => path === pathname);
    setPageLabel(currentPage ? currentPage.label : null);
  }, [pathname]);

  return (
    <StyledHeader>
      <StyledHeaderContainer>
        {isMobile ? (
          <StyledCloseMenuButton onClick={toggleMobileMenu}>
            <Icon name="CloseIcon" size="24px" />
          </StyledCloseMenuButton>
        ) : (
          <Heading type="h2">{pageLabel}</Heading>
        )}
        <StyledInfoList>
          {!isMobile && (
            <>
              <StyledInfoItem>
                <BalanceInfo />
              </StyledInfoItem>
              <StyledInfoItem>
                <DidInfo />
              </StyledInfoItem>
            </>
          )}
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
