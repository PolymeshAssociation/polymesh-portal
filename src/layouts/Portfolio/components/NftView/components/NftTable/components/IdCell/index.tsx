import { Icon } from '~/components';
import { INftIdData } from '../../constants';
import { StyledCell, StyledImageWrap } from './styles';

interface IIdCellProps {
  info: INftIdData;
}

export const IdCell: React.FC<IIdCellProps> = ({ info: { id, imgUrl } }) => {
  return (
    <StyledCell>
      <StyledImageWrap>
        {imgUrl ? (
          <img src={imgUrl} alt={imgUrl} />
        ) : (
          <Icon name="Coins" size="24px" />
        )}
      </StyledImageWrap>
      {id}
    </StyledCell>
  );
};
