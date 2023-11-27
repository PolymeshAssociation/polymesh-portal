import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import {
  Button,
  DropdownSelect,
  RefreshButton,
  SkeletonLoader,
} from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { useWindowWidth } from '~/hooks/utility';
import { ESortOptions } from '../../types';
import { CreateVenue } from './components/CreateVenue';
import { SendAsset } from './components/SendAsset';
import { TABS } from './constants';
import {
  StyledHeader,
  StyledWrapper,
  StyledNavList,
  StyledNavLink,
  StyledSortWrapper,
  StyledSort,
  StyledButtonWrapper,
} from './styles';

interface ITransfersHeaderProps {
  sortBy: ESortOptions;
  setSortBy: React.Dispatch<React.SetStateAction<ESortOptions>>;
}

export const TransfersHeader: React.FC<ITransfersHeaderProps> = ({
  sortBy,
  setSortBy,
}) => {
  const { createdVenues, refreshInstructions, instructionsLoading } =
    useContext(InstructionsContext);
  const { identityLoading, identity } = useContext(AccountContext);
  const [createVenueOpen, setCreateVenueOpen] = useState(false);
  const [sendAssetOpen, setSendAssetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');
  const { isMobile, isWidescreen } = useWindowWidth();

  const toggleCreateVenue = () => {
    setCreateVenueOpen((prev) => !prev);
  };
  const toggleSendAsset = () => {
    setSendAssetOpen((prev) => !prev);
  };

  return (
    <StyledHeader>
      {isMobile ? (
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
      ) : (
        <StyledNavList>
          {TABS.map(({ label, searchParam }) => (
            <li key={label}>
              <StyledNavLink
                className={type === label ? 'active' : ''}
                onClick={() => setSearchParams(searchParam)}
              >
                {instructionsLoading ? <SkeletonLoader width={48} /> : label}
              </StyledNavLink>
            </li>
          ))}
        </StyledNavList>
      )}
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
                <option className="options" key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <Icon name="DropdownIcon" className="dropdown-icon" />
          </StyledSort>
        </StyledSortWrapper>
        <StyledButtonWrapper>
          <Button
            variant="modalPrimary"
            onClick={toggleCreateVenue}
            round={!isWidescreen}
            disabled={identityLoading || !identity}
          >
            <Icon name="Plus" />
            {isWidescreen && ' Create Venue'}
          </Button>
          <Button
            variant="modalPrimary"
            disabled={identityLoading || !createdVenues.length}
            onClick={toggleSendAsset}
            round={!isWidescreen}
          >
            <Icon name="ArrowTopRight" />
            {isWidescreen && 'Send Asset'}
          </Button>
          <RefreshButton
            onClick={refreshInstructions}
            disabled={instructionsLoading}
          />
        </StyledButtonWrapper>
      </StyledWrapper>
      {createVenueOpen && <CreateVenue toggleModal={toggleCreateVenue} />}
      {sendAssetOpen && <SendAsset toggleModal={toggleSendAsset} />}
    </StyledHeader>
  );
};
