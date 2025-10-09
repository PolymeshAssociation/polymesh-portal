import { useMemo, useState } from 'react';
import { CopyToClipboard, Icon } from '~/components';
import { Button, SkeletonLoader } from '~/components/UiKit';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { formatBalance, formatKey } from '~/helpers/formatters';
import { notifyGlobalError } from '~/helpers/notifications';
import { useBalance } from '~/hooks/polymesh';
import { GetPolyx } from '~/layouts/Overview/components/BalanceInfo/components/GetPolyx';
import { ReceivePolyx } from '~/layouts/Overview/components/BalanceInfo/components/ReceivePolyx';
import { TransferPolyx } from '~/layouts/Overview/components/BalanceInfo/components/TransferPolyx';
import {
  StyledAsset,
  StyledButtonsWrapper,
  StyledCard,
  StyledCopyWrap,
  StyledInfo,
  StyledInfoBlock,
  StyledInfoValue,
} from './styles';

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

export const MultiSigBalanceCard = () => {
  const { multiSigAccountKey, signers, multiSigLoading, requiredSignatures } =
    useMultiSigContext();
  const { isTransactionInProgress } = useTransactionStatusContext();
  const { balance, balanceIsLoading } = useBalance(multiSigAccountKey);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [getPolyxModalOpen, setGetPolyxModalOpen] = useState(false);

  const toggleTransferModal = () => setTransferModalOpen((prev) => !prev);
  const toggleReceiveModal = () => setReceiveModalOpen((prev) => !prev);
  const toggleGetPolyxModal = () => setGetPolyxModalOpen((prev) => !prev);

  const banxaUrl = import.meta.env.VITE_BANXA_URL;

  const isBanxaAvailable = useMemo(
    () => banxaUrl && banxaUrl !== 'undefined' && validateBanxaUrl(banxaUrl),
    [banxaUrl],
  );

  const handleGetPolyxClick = () => {
    if (!isBanxaAvailable) {
      notifyGlobalError('Invalid Banxa URL configuration');
      setGetPolyxModalOpen(false);
      return;
    }
    setGetPolyxModalOpen(true);
  };

  const selectedMultisig = multiSigAccountKey || '';
  const totalSigners = signers?.length || 0;
  const isLoading = multiSigLoading || balanceIsLoading;

  return (
    <>
      <StyledCard>
        <StyledInfo>
          <StyledInfoBlock>
            Total Balance
            <StyledInfoValue>
              {isLoading ? (
                <SkeletonLoader width={150} height={24} />
              ) : (
                <>
                  {formatBalance(balance.total)}{' '}
                  <StyledAsset>POLYX</StyledAsset>
                </>
              )}
            </StyledInfoValue>
          </StyledInfoBlock>

          <StyledInfoBlock>
            Unlocked
            <StyledInfoValue>
              {isLoading ? (
                <SkeletonLoader width={120} height={24} />
              ) : (
                <>
                  {formatBalance(balance.free)} <StyledAsset>POLYX</StyledAsset>
                </>
              )}
            </StyledInfoValue>
          </StyledInfoBlock>

          <StyledInfoBlock>
            Locked
            <StyledInfoValue>
              {isLoading ? (
                <SkeletonLoader width={120} height={24} />
              ) : (
                <>
                  {formatBalance(balance.locked)}{' '}
                  <StyledAsset>POLYX</StyledAsset>
                </>
              )}
            </StyledInfoValue>
          </StyledInfoBlock>

          <StyledInfoBlock>
            MultiSig Address
            <StyledCopyWrap>
              <StyledInfoValue>
                {multiSigLoading ? (
                  <SkeletonLoader width={160} height={21} />
                ) : (
                  formatKey(selectedMultisig, 8, 8)
                )}
              </StyledInfoValue>
              {!multiSigLoading && <CopyToClipboard value={selectedMultisig} />}
            </StyledCopyWrap>
          </StyledInfoBlock>

          <StyledInfoBlock>
            Signers
            <StyledInfoValue>
              {multiSigLoading ? (
                <SkeletonLoader width={60} height={21} />
              ) : (
                `${requiredSignatures} of ${totalSigners}`
              )}
            </StyledInfoValue>
          </StyledInfoBlock>
        </StyledInfo>

        <StyledButtonsWrapper>
          <Button
            variant="primary"
            onClick={toggleTransferModal}
            disabled={isTransactionInProgress}
          >
            <Icon name="ArrowTopRight" />
            Send
          </Button>
          <Button variant="secondary" onClick={toggleReceiveModal}>
            <Icon name="ArrowBottomLeft" />
            Receive
          </Button>
          {isBanxaAvailable && (
            <Button variant="outline" onClick={handleGetPolyxClick}>
              <Icon name="Coins" />
              Get POLYX
            </Button>
          )}
        </StyledButtonsWrapper>
      </StyledCard>
      {transferModalOpen && (
        <TransferPolyx toggleModal={toggleTransferModal} useMultisigAccount />
      )}
      {receiveModalOpen && (
        <ReceivePolyx
          toggleModal={toggleReceiveModal}
          accountAddress={multiSigAccountKey}
          accountType="multisig"
        />
      )}
      {getPolyxModalOpen && <GetPolyx toggleModal={toggleGetPolyxModal} />}
    </>
  );
};
