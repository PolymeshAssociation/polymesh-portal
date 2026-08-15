import { useContext, useState } from 'react';
import { Icon, Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  StyledButtonWrapper,
  StyledDescription,
  StyledHeading,
  StyledModalContent,
  StyledWrapper,
} from './styles';

/**
 * Warns when the connected Ethereum wallet is pointed at a different chain than the Polymesh node.
 *
 * MetaMask signs *and broadcasts* the transaction through whichever network it is currently on, so
 * on the wrong one the calldata would go to an unrelated chain — spending gas there while the
 * Polymesh transaction never happens. The Signing Manager refuses to sign in that state, so this is
 * not the thing standing between the user and a lost transaction; it is what tells them why nothing
 * works, and offers the one-click fix, before they hit that error.
 */
export const EvmNetworkInfo = () => {
  const { evmNetworkMismatch, switchEvmNetwork } = useContext(PolymeshContext);
  const [expanded, setExpanded] = useState(false);

  if (!evmNetworkMismatch) return null;

  return (
    <>
      <StyledWrapper onClick={() => setExpanded(true)}>
        <Icon size="24px" name="MetaMaskSymbol" />
        <Icon size="18px" name="Alert" className="sub-icon" />
      </StyledWrapper>
      {expanded && (
        <Modal handleClose={() => setExpanded(false)} customWidth="fit-content">
          <StyledModalContent>
            <Heading type="h4">
              <StyledHeading>
                <Icon size="32px" name="MetaMaskSymbol" />
                Wrong network selected
              </StyledHeading>
            </Heading>
            <StyledDescription>
              Your wallet is connected to a different network than this
              application. Transactions are broadcast by your wallet, so they
              cannot reach Polymesh until you switch networks.
            </StyledDescription>
            <StyledButtonWrapper>
              <Button
                variant="modalSecondary"
                onClick={() => setExpanded(false)}
              >
                Close
              </Button>
              <Button
                variant="modalPrimary"
                onClick={async () => {
                  await switchEvmNetwork();
                  setExpanded(false);
                }}
              >
                Switch Network
              </Button>
            </StyledButtonWrapper>
          </StyledModalContent>
        </Modal>
      )}
    </>
  );
};
