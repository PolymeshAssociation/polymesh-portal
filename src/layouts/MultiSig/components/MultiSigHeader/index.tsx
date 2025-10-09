import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import {
  DropdownSelect,
  RefreshButton,
  SkeletonLoader,
} from '~/components/UiKit';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { useWindowWidth } from '~/hooks/utility';
import { EMultiSigTypes, ESortOptions } from '../../types';
import { TABS } from './constants';
import {
  StyledButtonsWrapper,
  StyledHeader,
  StyledLabelWrapper,
  StyledNavLink,
  StyledNavList,
  StyledSort,
  StyledWrapper,
} from './styles';

interface IMultiSigHeaderProps {
  setSortBy: (sortBy: ESortOptions) => void;
  sortBy: ESortOptions;
}

export const MultiSigHeader: React.FC<IMultiSigHeaderProps> = ({
  setSortBy,
  sortBy,
}) => {
  const { multiSigAccountKey, refreshProposals, pendingProposalsLoading } =
    useMultiSigContext();
  const { isMobile } = useWindowWidth();

  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  return (
    <StyledHeader>
      {isMobile ? (
        <div>
          {!multiSigAccountKey ? (
            <SkeletonLoader height={36} />
          ) : (
            <DropdownSelect
              options={TABS.map(({ label }) => `${label} Transactions`)}
              onChange={(option) => {
                const tab = TABS.find(
                  ({ label }) => `${label} Transactions` === option,
                );

                if (tab) {
                  setSearchParams(tab.searchParam);
                }
              }}
              selected={`${type} Transactions` || undefined}
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
                {!multiSigAccountKey ? (
                  <SkeletonLoader width={160} />
                ) : (
                  `${label} Transactions`
                )}
              </StyledNavLink>
            </li>
          ))}
        </StyledNavList>
      )}

      <StyledWrapper>
        {type === EMultiSigTypes.PENDING && (
          <StyledLabelWrapper>
            {!multiSigAccountKey ? (
              <SkeletonLoader width={126} />
            ) : (
              <>
                Sort by:
                <StyledSort>
                  <select
                    onChange={({ target }) => {
                      setSortBy(target.value as ESortOptions);
                    }}
                    value={sortBy}
                  >
                    {Object.values(ESortOptions).map((option) => (
                      <option className="options" key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Icon name="DropdownIcon" className="dropdown-icon" />
                </StyledSort>
              </>
            )}
          </StyledLabelWrapper>
        )}
        <StyledButtonsWrapper>
          <RefreshButton
            onClick={refreshProposals}
            disabled={pendingProposalsLoading}
          />
        </StyledButtonsWrapper>
      </StyledWrapper>
    </StyledHeader>
  );
};
