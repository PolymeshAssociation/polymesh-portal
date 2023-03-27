import { CellContext } from '@tanstack/react-table';
import { ITokenItem } from '../../constants';
import { StyledCell, StyledIconWrapper } from './styles';
import { stringToColor } from '~/helpers/formatters';
import { Icon } from '~/components';

interface ICellProps {
  info: CellContext<ITokenItem, string>;
}

export const TickerCell: React.FC<ICellProps> = ({ info }) => {
  const ticker = info.getValue();
  return (
    <StyledCell>
      <StyledIconWrapper background={stringToColor(ticker)}>
        <Icon name="Coins" size="20px" />
      </StyledIconWrapper>
      {ticker}
    </StyledCell>
  );
};
