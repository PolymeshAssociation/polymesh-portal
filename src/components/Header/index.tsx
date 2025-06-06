import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { ROUTES } from '~/constants/routes';
import {
  StyledHeader,
  StyledHeaderContainer,
  StyledInfoList,
  StyledInfoItem,
  StyledCloseMenuButton,
  StyledIconGroup,
} from './styles';
import { Heading } from '../UiKit';
import { BalanceInfo } from './components/BalanceInfo';
import { DidInfo } from './components/DidInfo';
import { KeysInfo } from './components/KeysInfo';
import { NotificationInfo } from './components/NotificationInfo';
import { useWindowWidth } from '~/hooks/utility';
import Icon from '../Icon';
import { WalletConnectInfo } from './components/WalletConnectInfo';
import { WalletSelectButton } from './components/WalletSelectButton';

interface IHeaderProps {
  toggleMobileMenu: () => void;
}

const Header: React.FC<IHeaderProps> = ({ toggleMobileMenu }) => {
  const [pageLabel, setPageLabel] = useState<string | null>(null);
  const { pathname } = useLocation();
  const { isMobile } = useWindowWidth();
  const [searchParams] = useSearchParams();
  const nftCollection = searchParams.get('nftCollection');
  const nftId = searchParams.get('nftId');

  useEffect(() => {
    const currentPage = ROUTES.find(({ path }) => {
      if (path === pathname) return true;

      // Handle parameterized routes by converting :param to a regex pattern
      if (path.includes(':')) {
        const pathPattern = path.replace(/:[^/]+/g, '[^/]+');
        const regex = new RegExp(`^${pathPattern}$`);
        return regex.test(pathname);
      }

      return false;
    });
    const currentPageLabel = currentPage?.label || null;
    setPageLabel(currentPageLabel);
  }, [nftCollection, nftId, pathname]);

  return (
    <StyledHeader>
      <StyledHeaderContainer>
        {isMobile ? (
          <StyledCloseMenuButton onClick={toggleMobileMenu}>
            <Icon name="BurgerMenu" size="24px" />
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
          <StyledIconGroup>
            <WalletSelectButton />
            <WalletConnectInfo />
            <NotificationInfo />
          </StyledIconGroup>
        </StyledInfoList>
      </StyledHeaderContainer>
    </StyledHeader>
  );
};

export default Header;
