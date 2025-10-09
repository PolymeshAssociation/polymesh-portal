import { useContext } from 'react';
import QRCode from 'react-qr-code';
import { CopyToClipboard, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { AccountContext } from '~/context/AccountContext';
import { formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import {
  QRWrapper,
  StyledAddressWrapper,
  StyledButtonsWrapper,
  StyledWrapper,
  TextWithDelimeter,
} from './styles';

interface IReceivePolyxProps {
  toggleModal: () => void;
  accountAddress?: string;
  accountType?: 'signing-key' | 'multisig';
}

export const ReceivePolyx: React.FC<IReceivePolyxProps> = ({
  toggleModal,
  accountAddress,
  accountType = 'signing-key',
}) => {
  const { selectedAccount } = useContext(AccountContext);
  const { isMobile } = useWindowWidth();
  const address = accountAddress || selectedAccount;
  const addressLabel = accountType === 'multisig' ? 'multisig address' : 'key';

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Receive POLYX
      </Heading>
      <StyledWrapper>
        <QRWrapper>
          <QRCode value={address} bgColor="transparent" />
        </QRWrapper>
        <Text color="secondary" marginTop={8}>
          You can scan the QR-code to get POLYX
        </Text>
        <TextWithDelimeter>Or</TextWithDelimeter>
        <Text color="secondary">Copy your {addressLabel}</Text>
        <StyledAddressWrapper>
          {formatKey(address, isMobile ? 15 : 24, isMobile ? 15 : 24)}
          <CopyToClipboard value={address} />
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
