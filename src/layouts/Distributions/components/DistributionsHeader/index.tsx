import { useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import {
  RefreshButton,
  DropdownSelect,
  SkeletonLoader,
} from '~/components/UiKit';
import { DistributionsContext } from '~/context/DistributionsContext';
import { useWindowWidth } from '~/hooks/utility';
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
  const { refreshDistributions, distributionsLoading } =
    useContext(DistributionsContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile } = useWindowWidth();

  return (
    <StyledHeader>
      {isMobile ? (
        <div>
          {distributionsLoading ? (
            <SkeletonLoader height={36} />
          ) : (
            <DropdownSelect
              options={TABS.map(({ label }) => label)}
              onChange={(option) => {
                const tab = TABS.find(({ label }) => label === option);
                if (tab) {
                  setSearchParams(tab.searchParam);
                }
              }}
              selected={type || undefined}
              borderRadius={24}
              error={undefined}
              placeholder={type || ''}
            />
          )}
        </div>
      ) : (
        <StyledNavList>
          {TABS.map(({ label, searchParam }) => (
            <li key={label}>
              <StyledNavLink
                className={type === label ? 'active' : ''}
                onClick={() => setSearchParams(searchParam)}
              >
                {distributionsLoading ? <SkeletonLoader width={58} /> : label}
              </StyledNavLink>
            </li>
          ))}
        </StyledNavList>
      )}

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
          <RefreshButton
            onClick={refreshDistributions}
            disabled={distributionsLoading}
          />
        </StyledWrapper>
      )}
    </StyledHeader>
  );
};
