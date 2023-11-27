import { Icon } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { handleImgUrlClick } from '../../../../helpers';
import { StyledCell, StyledImgUrl, StyledIconWrap } from './styles';

interface IUrlCellProps {
  imgUrl: string;
}

export const UrlCell: React.FC<IUrlCellProps> = ({ imgUrl }) => {
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  return (
    <StyledCell>
      {!isSmallScreen ? (
        <StyledImgUrl onClick={(e) => handleImgUrlClick(e, imgUrl)}>
          {imgUrl}
        </StyledImgUrl>
      ) : (
        <StyledIconWrap onClick={(e) => handleImgUrlClick(e, imgUrl)}>
          <Icon name="Link" size="18px" />
        </StyledIconWrap>
      )}
    </StyledCell>
  );
};
