import { useContext, useState } from 'react';
import { Icon } from '~/components';
import { Text, Heading, Button, SkeletonLoader } from '~/components/UiKit';
import { TransferPolyx } from './components/TransferPolyx';
import { ReceivePolyx } from './components/ReceivePolyx';
import { GetPolyx } from './components/GetPolyx';
import {
  StyledWrapper,
  StyledAsset,
  StyledButtonGroup,
  StyledTotalBalance,
} from './styles';
import { formatBalance } from '~/helpers/formatters';
import { AccountContext } from '~/context/AccountContext';
import { notifyGlobalError } from '~/helpers/notifications';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';

const validateBanxaUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return (
      parsedUrl.protocol === 'https:' &&
      (parsedUrl.hostname.endsWith('banxa.com') ||
        parsedUrl.hostname.endsWith('banxa-sandbox.com'))
    );
  } catch {
    return false;
  }
};

export const BalanceInfo = () => {
  const {
    identityHasValidCdd,
    accountIsMultisigSigner,
    selectedAccountBalance,
    balanceIsLoading,
    isExternalConnection,
  } = useContext(AccountContext);
  const { isTransactionInProgress } = useTransactionStatusContext();
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [getPolyxModalOpen, setGetPolyxModalOpen] = useState(false);

  const toggleTransferModal = () => setTransferModalOpen((prev) => !prev);
  const toggleReceiveModal = () => setReceiveModalOpen((prev) => !prev);
  const toggleGetPolyxModal = () => setGetPolyxModalOpen((prev) => !prev);

  const banxaUrl = import.meta.env.VITE_BANXA_URL;

  const handleGetPolyxClick = () => {
    if (!banxaUrl || !validateBanxaUrl(banxaUrl)) {
      notifyGlobalError('Invalid Banxa URL configuration');
      setGetPolyxModalOpen(false);
      return;
    }
    setGetPolyxModalOpen(true);
  };

  return (
    <>
      <StyledWrapper>
        <div className="balance">
          <div>
            <StyledTotalBalance>
              {!balanceIsLoading && <Icon name="PolymeshSymbol" size="36px" />}
              <Heading type="h2">
                {balanceIsLoading ? (
                  <SkeletonLoader />
                ) : (
                  <>
                    {formatBalance(selectedAccountBalance.total)}{' '}
                    <StyledAsset>POLYX</StyledAsset>
                  </>
                )}
              </Heading>
            </StyledTotalBalance>
            <Text size="large">Total balance</Text>
          </div>
          <div>
            <Heading type="h3">
              {balanceIsLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  {formatBalance(selectedAccountBalance.free)}{' '}
                  <StyledAsset>POLYX</StyledAsset>
                </>
              )}
            </Heading>
            <Text size="large">Unlocked</Text>
          </div>
          <div>
            <Heading type="h3">
              {balanceIsLoading ? (
                <SkeletonLoader />
              ) : (
                <>
                  {formatBalance(selectedAccountBalance.locked)}{' '}
                  <StyledAsset>POLYX</StyledAsset>
                </>
              )}
            </Heading>
            <Text size="large">Locked</Text>
          </div>
        </div>
        <StyledButtonGroup>
          <Button
            onClick={toggleTransferModal}
            disabled={
              !identityHasValidCdd ||
              accountIsMultisigSigner ||
              isExternalConnection ||
              isTransactionInProgress
            }
          >
            <Icon name="ArrowTopRight" />
            Send
          </Button>
          <Button
            variant="secondary"
            onClick={toggleReceiveModal}
            disabled={!identityHasValidCdd || accountIsMultisigSigner}
          >
            <Icon name="ArrowBottomLeft" />
            Receive
          </Button>
          {banxaUrl && (
            <Button
              variant="secondary"
              onClick={handleGetPolyxClick}
              disabled={!identityHasValidCdd || accountIsMultisigSigner}
            >
              <Icon name="Coins" />
              Get POLYX
            </Button>
          )}
        </StyledButtonGroup>
      </StyledWrapper>
      {transferModalOpen && <TransferPolyx toggleModal={toggleTransferModal} />}
      {receiveModalOpen && <ReceivePolyx toggleModal={toggleReceiveModal} />}
      {getPolyxModalOpen && <GetPolyx toggleModal={toggleGetPolyxModal} />}
    </>
  );
};
