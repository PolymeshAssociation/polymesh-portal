import QRCode from 'react-qr-code';
import { Modal, CopyToClipboard } from '~/components';
import { Heading, Text, Button } from '~/components/UiKit';
import {
  StyledWrapper,
  TextWithDelimeter,
  StyledAddressWrapper,
  StyledButtonsWrapper,
  QRWrapper,
} from './styles';
import { formatKey } from '~/helpers/formatters';

interface IReceivePolyxProps {
  toggleModal: () => void;
  account: string;
}

export const ReceivePolyx: React.FC<IReceivePolyxProps> = ({
  toggleModal,
  account,
}) => {
  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Receive POLYX
      </Heading>
      <StyledWrapper>
        <QRWrapper>
          <QRCode value={account} bgColor="transparent" fgColor="#ffffff" />
        </QRWrapper>
        <Text color="secondary" marginTop={8}>
          You can scan the QR-code to get POLYX
        </Text>
        <TextWithDelimeter>Or</TextWithDelimeter>
        <Text color="secondary">Copy your key</Text>
        <StyledAddressWrapper>
          {formatKey(account, 11, 12)}
          <CopyToClipboard value={account} />
        </StyledAddressWrapper>
      </StyledWrapper>
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" marginTop={40} onClick={toggleModal}>
          Close
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
