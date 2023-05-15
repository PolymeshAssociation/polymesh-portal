import { useContext } from 'react';
import QRCode from 'react-qr-code';
import { AccountContext } from '~/context/AccountContext';
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
import { useWindowWidth } from '~/hooks/utility';

interface IReceivePolyxProps {
  toggleModal: () => void;
}

export const ReceivePolyx: React.FC<IReceivePolyxProps> = ({ toggleModal }) => {
  const { selectedAccount } = useContext(AccountContext);
  const { isMobile } = useWindowWidth();
  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Receive POLYX
      </Heading>
      <StyledWrapper>
        <QRWrapper>
          <QRCode value={selectedAccount} bgColor="transparent" />
        </QRWrapper>
        <Text color="secondary" marginTop={8}>
          You can scan the QR-code to get POLYX
        </Text>
        <TextWithDelimeter>Or</TextWithDelimeter>
        <Text color="secondary">Copy your key</Text>
        <StyledAddressWrapper>
          {formatKey(selectedAccount, 11, 12)}
          <CopyToClipboard value={selectedAccount} />
        </StyledAddressWrapper>
      </StyledWrapper>
      {!isMobile && (
        <StyledButtonsWrapper>
          <Button variant="modalSecondary" marginTop={40} onClick={toggleModal}>
            Close
          </Button>
        </StyledButtonsWrapper>
      )}
    </Modal>
  );
};
