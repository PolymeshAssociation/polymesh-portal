import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { StyledPaginationButton, StyledPaginationWrapper } from './styles';

interface IPaginationProps {
  totalItems: number;
  currentItems: {
    first: number;
    last: number;
  };
  isPrevDisabled: boolean;
  isNextDisabled: boolean;
  onFirstPageClick: () => void;
  onPrevPageClick: () => void;
  onNextPageClick: () => void;
  onLastPageClick: () => void;
}

const Pagination: React.FC<IPaginationProps> = ({
  totalItems,
  currentItems,
  isNextDisabled,
  isPrevDisabled,
  onFirstPageClick,
  onLastPageClick,
  onNextPageClick,
  onPrevPageClick,
}) => {
  return (
    <StyledPaginationWrapper>
      <StyledPaginationButton
        type="button"
        onClick={onFirstPageClick}
        disabled={isPrevDisabled}
      >
        <Icon name="FirstPage" />
      </StyledPaginationButton>
      <StyledPaginationButton
        type="button"
        onClick={onPrevPageClick}
        disabled={isPrevDisabled}
      >
        <Icon name="PrevPage" />
      </StyledPaginationButton>
      <Text>
        {currentItems.first}-{currentItems.last} of {totalItems}
      </Text>
      <StyledPaginationButton
        type="button"
        onClick={onNextPageClick}
        disabled={isNextDisabled}
      >
        <Icon name="NextPage" />
      </StyledPaginationButton>
      <StyledPaginationButton
        type="button"
        onClick={onLastPageClick}
        disabled={isNextDisabled}
      >
        <Icon name="LastPage" />
      </StyledPaginationButton>
    </StyledPaginationWrapper>
  );
};

export default Pagination;
