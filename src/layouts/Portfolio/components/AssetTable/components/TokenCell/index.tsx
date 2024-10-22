import { CellContext } from '@tanstack/react-table';
import { ITokenItem } from '../../constants';
import { StyledCell, StyledIconWrapper } from './styles';
import { stringToColor } from '~/helpers/formatters';
import { Icon } from '~/components';

interface ICellProps {
  info: CellContext<ITokenItem, ITokenItem['tokenDetails']> | undefined;
}

export const TokenCell: React.FC<ICellProps> = ({ info }) => {
  const tokenDetails = info?.getValue();

  if (!tokenDetails) return undefined;

  const { assetId, name, ticker } = tokenDetails;

  return (
    <StyledCell>
      <StyledIconWrapper $background={stringToColor(assetId)}>
        <Icon name="Coins" size="20px" />
      </StyledIconWrapper>
      {name}
      {ticker ? ` (${ticker})` : ''}
    </StyledCell>
  );
};
