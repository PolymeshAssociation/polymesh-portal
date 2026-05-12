import { useSearchParams } from 'react-router-dom';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '../../helpers';
import { StyledBreadcrumb, StyledBreadcrumbsContainer } from './styles';

export const Breadcrumbs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const id = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId');
  const asset = searchParams.get('asset');
  const selectedHolder = getBalanceHolder(holder, id);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? id : null;

  return (
    <StyledBreadcrumbsContainer>
      <StyledBreadcrumb
        onClick={() =>
          setSearchParams(
            buildBalanceSearchParams({ holder: EBalanceHolder.ALL }),
          )
        }
      >
        Balances
      </StyledBreadcrumb>
      {selectedHolder === EBalanceHolder.ACCOUNT && (
        <StyledBreadcrumb
          onClick={() =>
            setSearchParams(
              buildBalanceSearchParams({
                holder: EBalanceHolder.ACCOUNT,
                accountAddress: address,
              }),
            )
          }
        >
          Account
        </StyledBreadcrumb>
      )}
      {selectedPortfolioId && (
        <StyledBreadcrumb
          onClick={() =>
            setSearchParams(
              buildBalanceSearchParams({
                holder: EBalanceHolder.PORTFOLIO,
                portfolioId: selectedPortfolioId,
              }),
            )
          }
        >
          {id}
        </StyledBreadcrumb>
      )}
      {nftCollection && (
        <StyledBreadcrumb
          onClick={() =>
            nftId
              ? setSearchParams(
                  buildBalanceSearchParams({
                    holder: selectedHolder,
                    portfolioId: selectedPortfolioId,
                    accountAddress:
                      selectedHolder === EBalanceHolder.ACCOUNT
                        ? address
                        : undefined,
                    additionalParams: { nftCollection },
                  }),
                )
              : null
          }
        >
          {nftCollection}
        </StyledBreadcrumb>
      )}
      {asset && <StyledBreadcrumb>{asset}</StyledBreadcrumb>}
      {nftId && <StyledBreadcrumb>#{nftId}</StyledBreadcrumb>}
    </StyledBreadcrumbsContainer>
  );
};
