import { HeaderContext } from '@tanstack/react-table';
import { Icon } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { INftTableItem, INftIdData } from '../../constants';
import { StyledSortButton, StyledCell } from './styles';

interface IIdFilterProps {
  info: HeaderContext<INftTableItem, INftIdData>;
}

export const IdFilter: React.FC<IIdFilterProps> = ({
  info: { column, table },
}) => {
  const { isMobile, isTablet } = useWindowWidth();
  const sortingState = table.getState().sorting[0];

  const handleSort = column.getToggleSortingHandler();

  const isSmallScreen = isMobile || isTablet;

  return (
    <StyledCell>
      ID
      {!isSmallScreen && (
        <StyledSortButton onClick={handleSort}>
          {sortingState ? (
            <Icon
              name={sortingState.desc ? 'SortDescending' : 'SortAscending'}
              size="18px"
            />
          ) : (
            <Icon name="Sort" size="18px" />
          )}
        </StyledSortButton>
      )}
    </StyledCell>
  );
};
