import { useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { Icon } from '~/components';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { StyledWrapper, StyledPriceLabel } from './styles';
import { formatBalance } from '~/helpers/formatters';
import { AccountContext } from '~/context/AccountContext';

export const BalanceInfo = () => {
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { selectedAccountBalance, balanceIsLoading } =
    useContext(AccountContext);
  return (
    <StyledWrapper>
      <Icon name="PolymeshSymbol" size="16px" />
      {connecting || balanceIsLoading ? (
        <SkeletonLoader />
      ) : (
        <Text size="small" bold color="secondary">
          <StyledPriceLabel>
            {formatBalance(selectedAccountBalance.total)}
          </StyledPriceLabel>{' '}
          POLYX
        </Text>
      )}
    </StyledWrapper>
  );
};
