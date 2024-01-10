import { useEffect, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
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
  const [searchParams] = useSearchParams();
  const nftCollection = searchParams.get('nftCollection');
  const nftId = searchParams.get('nftId');

  useEffect(() => {
    const currentPage = ROUTES.find(({ path }) => path === pathname);
    let currentPageLabel;
    if (nftCollection) {
      currentPageLabel = nftId
        ? `${nftCollection as string} #${nftId as string}`
        : (nftCollection as string);
    } else {
      currentPageLabel = currentPage?.label || null;
    }
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
            <NotificationInfo />
          </StyledInfoItem>
        </StyledInfoList>
      </StyledHeaderContainer>
    </StyledHeader>
  );
};

export default Header;
