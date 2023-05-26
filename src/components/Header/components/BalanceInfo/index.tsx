import { useContext } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useBalance } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { SkeletonLoader, Text } from '~/components/UiKit';
import { StyledWrapper, StyledPriceLabel } from './styles';
import { formatBalance } from '~/helpers/formatters';

export const BalanceInfo = () => {
  const {
    state: { connecting },
  } = useContext(PolymeshContext);
  const { balance, balanceIsLoading } = useBalance();
  return (
    <StyledWrapper>
      <Icon name="PolymeshSymbol" size="16px" />
      {connecting || balanceIsLoading ? (
        <SkeletonLoader />
      ) : (
        <Text size="small" bold color="secondary">
          <StyledPriceLabel>{formatBalance(balance.total)}</StyledPriceLabel>{' '}
          POLYX
        </Text>
      )}
    </StyledWrapper>
  );
};
