import { Icon } from '~/components';
import { ICollectionItemTicker } from '../../constants';
import { StyledCell, StyledImageWrap } from './styles';

interface ITickerCellProps {
  info: ICollectionItemTicker;
}

export const TickerCell: React.FC<ITickerCellProps> = ({ info }) => {
  return (
    <StyledCell>
      <StyledImageWrap>
        {info?.imgUrl ? (
          <img src={info?.imgUrl} alt={info?.imgUrl} />
        ) : (
          <Icon name="Coins" size="24px" />
        )}
      </StyledImageWrap>
      {info?.ticker}
    </StyledCell>
  );
};
