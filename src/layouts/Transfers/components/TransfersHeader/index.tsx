import { Icon } from '~/components';
import { Heading, Button } from '~/components/UiKit';
import { StyledHeader, StyledWrapper } from './styles';

export const TransfersHeader = () => {
  return (
    <StyledHeader>
      <Heading type="h3">Pending Instructions</Heading>
      <StyledWrapper>
        <Button variant="modalPrimary" disabled>
          <Icon name="Plus" />
          Create Venue
        </Button>
        <Button variant="modalPrimary" disabled>
          <Icon name="ArrowTopRight" />
          Send Asset
        </Button>
      </StyledWrapper>
    </StyledHeader>
  );
};
