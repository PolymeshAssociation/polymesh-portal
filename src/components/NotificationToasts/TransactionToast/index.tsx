import { useEffect, useState } from 'react';
import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';
import { Icon, CopyToClipboard } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledInfoWrapper,
  StyledStatusLabel,
  StyledBatchLabel,
  StyledStatusWrapper,
  StyledDetailsWrapper,
  StyledDetail,
  StyledHashLabel,
  StyledLink,
  StyledError,
  StyledTimestamp,
} from './styles';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { toRelativeTime } from '~/helpers/dateTime';

interface ITxToastProps {
  txHash?: string;
  /**
   * Whether `txHash` is an Ethereum transaction hash rather than a Substrate extrinsic hash. True
   * when an Ethereum wallet signed *and* broadcast the transaction, which is the only hash it — and
   * so the user — ever sees. Used to label the hash, since it is the one MetaMask shows as its
   * Transaction ID and looks nothing like the extrinsic hashes the Portal otherwise displays
   */
  isEthTxHash?: boolean;
  /**
   * How the block explorer identifies this extrinsic — either its hash, or `blockNumber-txIndex`.
   * Omitted while the transaction has no on-chain location yet, in which case the hash is shown
   * without a link
   */
  explorerExtrinsicId?: string;
  message?: string;
  status: `${TransactionStatus}`;
  isTxBatch: boolean;
  batchSize: number;
  tag: string;
  error?: string;
  timestamp: number;
}

const TransactionToast: React.FC<ITxToastProps> = ({
  txHash,
  isEthTxHash,
  explorerExtrinsicId,
  message,
  status,
  isTxBatch,
  batchSize,
  tag,
  error,
  timestamp,
}) => {
  const [formattedTime, setFormattedTime] = useState(toRelativeTime(timestamp));

  useEffect(() => {
    if (!timestamp || !formattedTime) return undefined;

    const intervalId = setInterval(() => {
      setFormattedTime(toRelativeTime(timestamp));
    }, 30000);

    return () => clearInterval(intervalId);
  }, [timestamp, formattedTime]);

  return (
    <div className="custom-toast">
      <StyledInfoWrapper>
        <div>
          <Text bold transform="capitalize" color="secondary">
            {tag.split('.')[0]}
          </Text>
          <Text bold transform="capitalize">
            {splitCamelCase(tag.split('.')[1])}
          </Text>
        </div>
        <StyledStatusWrapper>
          {isTxBatch && (
            <StyledBatchLabel>Batch size: {batchSize}</StyledBatchLabel>
          )}
          <StyledStatusLabel $status={status}>{status}</StyledStatusLabel>
        </StyledStatusWrapper>
      </StyledInfoWrapper>
      {!!message && <Text>{message}</Text>}
      {!!txHash && (
        <>
          {isEthTxHash && (
            <StyledHashLabel>Ethereum transaction hash</StyledHashLabel>
          )}
          <StyledDetailsWrapper>
            <StyledDetail>{formatDid(txHash, 10, 9)}</StyledDetail>
            <StyledDetail $isIcon>
              <CopyToClipboard value={txHash} />
            </StyledDetail>
            {!!explorerExtrinsicId && (
              <StyledLink
                href={`${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${explorerExtrinsicId}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon name="GotoIcon" />
              </StyledLink>
            )}
          </StyledDetailsWrapper>
        </>
      )}
      {!!error && <StyledError>{error}</StyledError>}
      <StyledTimestamp>{formattedTime}</StyledTimestamp>
    </div>
  );
};

export default TransactionToast;
