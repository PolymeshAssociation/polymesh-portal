import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EClaimsType, EScopeSortOptions } from '../../constants';
import { Button } from '~/components/UiKit';
import { Icon } from '~/components';
import {
  StyledActionsWrapper,
  StyledNavBar,
  StyledNavLink,
  StyledNavList,
  StyledSort,
  StyledSortSelect,
} from './styles';
import { CreateNewClaim } from '../CreateNewClaim';

interface IClaimsNavigationProps {
  sortBy: EScopeSortOptions;
  setSortBy: React.Dispatch<React.SetStateAction<EScopeSortOptions>>;
}

export const ClaimsNavigation: React.FC<IClaimsNavigationProps> = ({
  sortBy,
  setSortBy,
}) => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const claimType = searchParams.get('type');

  const toggleModal = () => setCreateModalOpen((prev) => !prev);

  return (
    <StyledNavBar>
      <StyledNavList>
        {Object.values(EClaimsType).map((type) => (
          <StyledNavLink
            key={type}
            className={type === claimType ? 'active' : ''}
            onClick={() => setSearchParams({ type })}
          >
            {type}
          </StyledNavLink>
        ))}
      </StyledNavList>
      <StyledActionsWrapper>
        <StyledSort>
          Sort by:
          <StyledSortSelect>
            <select
              onChange={({ target }) => {
                setSortBy(target.value as EScopeSortOptions);
              }}
              value={sortBy}
            >
              {Object.values(EScopeSortOptions).map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon name="DropdownIcon" className="dropdown-icon" />
          </StyledSortSelect>
        </StyledSort>
        <Button variant="modalPrimary" onClick={toggleModal}>
          <Icon name="Plus" />
          Create New Claim
        </Button>
      </StyledActionsWrapper>
      {createModalOpen && <CreateNewClaim toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
