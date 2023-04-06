import { HeaderContext } from '@tanstack/react-table';
import { Icon } from '~/components';
import { ITokenItem } from '../../constants';
import { StyledSortButton, StyledCell } from './styles';

interface IFilterProps {
  info: HeaderContext<ITokenItem, number>;
}

export const PercentageFilter: React.FC<IFilterProps> = ({
  info: { column, table },
}) => {
  const sortingState = table.getState().sorting[0];

  const handleSort = column.getToggleSortingHandler();

  return (
    <StyledCell>
      Portfolio %
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
    </StyledCell>
  );
};
