import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { RefreshButton } from '~/components/UiKit';
import { DistributionsContext } from '~/context/DistributionsContext';
import { ESortOptions, EDistributionTypes } from '../../types';
import { TABS } from './constants';
import {
  StyledHeader,
  StyledWrapper,
  StyledNavList,
  StyledNavLink,
  StyledSortWrapper,
  StyledSort,
} from './styles';

interface IDistributionsHeaderProps {
  sortBy: ESortOptions;
  setSortBy: React.Dispatch<React.SetStateAction<ESortOptions>>;
}

export const DistributionsHeader: React.FC<IDistributionsHeaderProps> = ({
  sortBy,
  setSortBy,
}) => {
  const { refreshDistributions } = useContext(DistributionsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  return (
    <StyledHeader>
      <StyledNavList>
        {TABS.map(({ label, searchParam }) => (
          <li key={label}>
            <StyledNavLink
              className={type === label ? 'active' : ''}
              onClick={() => setSearchParams(searchParam)}
            >
              {label}
            </StyledNavLink>
          </li>
        ))}
      </StyledNavList>
      {type === EDistributionTypes.PENDING && (
        <StyledWrapper>
          <StyledSortWrapper>
            Sort by:
            <StyledSort>
              <select
                onChange={({ target }) => {
                  setSortBy(target.value as ESortOptions);
                }}
                value={sortBy}
              >
                {Object.values(ESortOptions).map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
              <Icon name="DropdownIcon" className="dropdown-icon" />
            </StyledSort>
          </StyledSortWrapper>
          <RefreshButton onClick={refreshDistributions} />
        </StyledWrapper>
      )}
    </StyledHeader>
  );
};
