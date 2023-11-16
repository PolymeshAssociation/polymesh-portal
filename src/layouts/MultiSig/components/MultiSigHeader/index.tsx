import { useSearchParams } from 'react-router-dom';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { useWindowWidth } from '~/hooks/utility';
import {
  DropdownSelect,
  SkeletonLoader,
  RefreshButton,
} from '~/components/UiKit';
import { Icon, CopyToClipboard } from '~/components';
import { formatDid } from '~/helpers/formatters';
import { ESortOptions, EMultiSigTypes } from '../../types';
import { TABS } from './constants';
import {
  StyledHeader,
  StyledLabelWrapper,
  StyledMultisig,
  StyledNavLink,
  StyledNavList,
  StyledSigners,
  StyledSort,
  StyledWrapper,
  StyledButtonsWrapper,
} from './styles';

interface IMultiSigHeaderProps {
  setSortBy: (sortBy: ESortOptions) => void;
  sortBy: ESortOptions;
}

export const MultiSigHeader: React.FC<IMultiSigHeaderProps> = ({
  setSortBy,
  sortBy,
}) => {
  const {
    multiSigAccountKey,
    signers,
    refreshProposals,
    pendingProposalsLoading,
  } = useMultiSigContext();
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
        <StyledLabelWrapper>
          {!signers?.length ? (
            <SkeletonLoader width={70} />
          ) : (
            <>
              Signers:
              <StyledSigners>{signers.length}</StyledSigners>
            </>
          )}
        </StyledLabelWrapper>

        <StyledLabelWrapper>
          {!multiSigAccountKey ? (
            <SkeletonLoader width={170} />
          ) : (
            <>
              Multisig:
              <StyledMultisig>{formatDid(multiSigAccountKey)}</StyledMultisig>
              <CopyToClipboard value={multiSigAccountKey} />
            </>
          )}
        </StyledLabelWrapper>
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
