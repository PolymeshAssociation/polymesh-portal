import { Modal, Icon, CopyToClipboard } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import {
  StyledAccountWrapper,
  Separator,
  StyledBottomData,
  StyledBottomInfo,
  StyledDidWrapper,
  StyledTopInfo,
  StyledVerifiedLabel,
  IconWrapper,
  StyledDidThumb,
} from './styles';
import { formatDid } from '~/helpers/formatters';

interface IDetailsProps {
  toggleModal: () => void;
  isVerified: boolean;
  identity?: string;
  expiry: string;
  issuer: string;
  primaryKey: string;
  secondaryKeys: string[];
}

export const Details: React.FC<IDetailsProps> = ({
  toggleModal,
  isVerified,
  identity,
  expiry,
  issuer,
  //   primaryKey,
  //   secondaryKeys,
}) => {
  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Account Details
      </Heading>
      <StyledAccountWrapper>
        <StyledTopInfo>
          <IconWrapper size="64px">
            <Icon name="AuthorizationsIcon" className="id-icon" />
          </IconWrapper>
          <div className="did-wrapper">
            <Text color="secondary" marginBottom={8}>
              Your DID
            </Text>
            <StyledDidWrapper>
              <StyledDidThumb>{formatDid(identity, 7, 8)}</StyledDidThumb>
              <IconWrapper className="copy-icon">
                <CopyToClipboard value={identity} />
              </IconWrapper>
            </StyledDidWrapper>
          </div>
          {isVerified && <StyledVerifiedLabel>Verified</StyledVerifiedLabel>}
        </StyledTopInfo>
        <StyledBottomInfo>
          <StyledBottomData>
            Expires on: <span>{expiry}</span>
          </StyledBottomData>
          <Separator />
          <StyledBottomData>
            Verified by: <span>{formatDid(issuer)}</span>
          </StyledBottomData>
        </StyledBottomInfo>
      </StyledAccountWrapper>
      <Button variant="modalSecondary" onClick={toggleModal} marginTop={24}>
        Close
      </Button>
    </Modal>
  );
};
