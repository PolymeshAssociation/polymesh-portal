import { HeaderContext } from '@tanstack/react-table';
import { Icon } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { IHistoricalMultiSigProposals } from '../../constants';
import { StyledSortButton, StyledIdCell } from './styles';

interface ICellIdFilterProps {
  info: HeaderContext<IHistoricalMultiSigProposals, number>;
}

export const CellIdFilter: React.FC<ICellIdFilterProps> = ({
  info: { table, column },
}) => {
  const { isMobile, isTablet } = useWindowWidth();
  const isSmallScreen = isMobile || isTablet;

  const sortingState = table.getState().sorting[0];
  const handleSort = column.getToggleSortingHandler();
  return (
    <StyledIdCell>
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
    </StyledIdCell>
  );
};
