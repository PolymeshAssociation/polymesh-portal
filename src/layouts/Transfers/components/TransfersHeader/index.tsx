import { useContext, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { InstructionsContext } from '~/context/InstructionsContext';
import { CreateVenue } from './components/CreateVenue';
import { SendAsset } from './components/SendAsset';
import { TABS } from './constants';
import {
  StyledHeader,
  StyledWrapper,
  StyledNavList,
  StyledNavLink,
} from './styles';

export const TransfersHeader = () => {
  const { createdVenues } = useContext(InstructionsContext);
  const [createVenueOpen, setCreateVenueOpen] = useState(false);
  const [sendAssetOpen, setSendAssetOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const type = searchParams.get('type');

  const toggleCreateVenue = () => {
    setCreateVenueOpen((prev) => !prev);
  };
  const toggleSendAsset = () => {
    setSendAssetOpen((prev) => !prev);
  };

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
      <StyledWrapper>
        <Button variant="modalPrimary" onClick={toggleCreateVenue}>
          <Icon name="Plus" />
          Create Venue
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!createdVenues.length}
          onClick={toggleSendAsset}
        >
          <Icon name="ArrowTopRight" />
          Send Asset
        </Button>
      </StyledWrapper>
      {createVenueOpen && <CreateVenue toggleModal={toggleCreateVenue} />}
      {sendAssetOpen && <SendAsset toggleModal={toggleSendAsset} />}
    </StyledHeader>
  );
};
