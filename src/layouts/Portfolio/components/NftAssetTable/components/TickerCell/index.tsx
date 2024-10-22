import { Icon } from '~/components';
import { ICollectionItemTicker } from '../../constants';
import { StyledCell, StyledIconWrapper, StyledImageWrap } from './styles';
import { stringToColor } from '~/helpers/formatters';

interface ITickerCellProps {
  info: ICollectionItemTicker;
}

export const TickerCell: React.FC<ITickerCellProps> = ({ info }) => {
  if (!info || !info.assetId) return undefined;

  const { assetId, imgUrl, ticker, name } = info;

  return (
    <StyledCell>
      <StyledImageWrap>
        {imgUrl ? (
          <img src={info?.imgUrl} alt={info?.imgUrl} />
        ) : (
          <StyledIconWrapper $background={stringToColor(assetId)}>
            <Icon name="Coins" size="20px" />
          </StyledIconWrapper>
        )}
      </StyledImageWrap>
      {name}
      {ticker ? ` (${ticker})` : ''}
    </StyledCell>
  );
};
