import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { EClaimsType, EScopeSortOptions } from '../../constants';
import { Button, RefreshButton } from '~/components/UiKit';
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
import { ClaimsContext } from '~/context/ClaimsContext';

interface IClaimsNavigationProps {
  sortBy: EScopeSortOptions;
  setSortBy: React.Dispatch<React.SetStateAction<EScopeSortOptions>>;
}

export const ClaimsNavigation: React.FC<IClaimsNavigationProps> = ({
  sortBy,
  setSortBy,
}) => {
  const { refreshClaims } = useContext(ClaimsContext);
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
        <RefreshButton onClick={refreshClaims} />
      </StyledActionsWrapper>
      {createModalOpen && <CreateNewClaim toggleModal={toggleModal} />}
    </StyledNavBar>
  );
};
