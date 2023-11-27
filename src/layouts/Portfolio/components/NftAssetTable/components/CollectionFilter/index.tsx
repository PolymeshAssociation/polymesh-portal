import { HeaderContext } from '@tanstack/react-table';
import { Icon } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import {
  ICollectionItem,
  INftAssetItem,
  ICollectionItemTicker,
} from '../../constants';
import { StyledSortButton, StyledCell } from './styles';

interface ICollectionFilterProps {
  info:
    | HeaderContext<ICollectionItem, ICollectionItemTicker>
    | HeaderContext<INftAssetItem, string>;
  name: string;
}

export const CollectionFilter: React.FC<ICollectionFilterProps> = ({
  info: { column, table },
  name,
}) => {
  const { isMobile, isTablet } = useWindowWidth();
  const sortingState = table.getState().sorting[0];

  const handleSort = column.getToggleSortingHandler();

  const isSmallScreen = isMobile || isTablet;

  return (
    <StyledCell>
      {name}
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
