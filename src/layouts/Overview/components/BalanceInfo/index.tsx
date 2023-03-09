import { useBalance } from '~/hooks/polymesh';
import { Icon } from '~/components';
import { Text, Heading, Button } from '~/components/UiKit';
import {
  StyledWrapper,
  StyledAsset,
  StyledButtonGroup,
  StyledTotalBalance,
} from './styles';
import { formatBalance } from '~/helpers/formatters';

export const BalanceInfo = () => {
  const { balance, balanceIsLoading } = useBalance();

  return (
    <StyledWrapper>
      <div>
        <StyledTotalBalance>
          <Icon name="PolymeshSymbol" size="36px" />
          <Heading type="h2">
            {balanceIsLoading ? 'loading...' : formatBalance(balance.total)}{' '}
            <StyledAsset>POLYX</StyledAsset>
          </Heading>
        </StyledTotalBalance>
        <Text size="large">Total balance</Text>
      </div>
      <div>
        <Heading type="h3">
          {balanceIsLoading ? 'loading...' : formatBalance(balance.free)}{' '}
          <StyledAsset>POLYX</StyledAsset>
        </Heading>
        <Text size="large">Unlocked</Text>
      </div>
      <div>
        <Heading type="h3">
          {balanceIsLoading ? 'loading...' : formatBalance(balance.locked)}{' '}
          <StyledAsset>POLYX</StyledAsset>
        </Heading>
        <Text size="large">Locked</Text>
      </div>
      <StyledButtonGroup>
        <Button variant="accent">Send</Button>
        <Button variant="accent">Receive</Button>
      </StyledButtonGroup>
    </StyledWrapper>
  );
};
