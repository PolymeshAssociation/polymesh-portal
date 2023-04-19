import { useEffect, useState } from 'react';
import { TransactionStatus } from '@polymeshassociation/polymesh-sdk/types';
import { Icon, CopyToClipboard } from '~/components';
import { Text } from '~/components/UiKit';
import {
  StyledStatusWrapper,
  StyledStatusLabel,
  StyledDetailsWrapper,
  StyledDetail,
  StyledLink,
  StyledError,
  StyledTimestamp,
} from './styles';
import { formatDid } from '~/helpers/formatters';
import { toRelativeTime } from '~/helpers/dateTime';

interface ITxToastProps {
  txHash?: string;
  message?: string;
  status: `${TransactionStatus}`;
  tag: string;
  error?: string;
  timestamp: number;
}

const TransactionToast: React.FC<ITxToastProps> = ({
  txHash,
  message,
  status,
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
      <StyledStatusWrapper>
        <div>
          <Text bold transform="capitalize" color="secondary">
            {tag.split('.')[0]}
          </Text>
          <Text bold transform="capitalize">
            {tag.split('.')[1]}
          </Text>
        </div>
        <StyledStatusLabel status={status}>{status}</StyledStatusLabel>
      </StyledStatusWrapper>
      {!!message && <Text>{message}</Text>}
      {!!txHash && (
        <StyledDetailsWrapper>
          <StyledDetail>{formatDid(txHash, 10, 9)}</StyledDetail>
          <StyledDetail isIcon>
            <CopyToClipboard value={txHash} />
          </StyledDetail>
          <StyledLink
            href={`${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Icon name="GotoIcon" />
          </StyledLink>
        </StyledDetailsWrapper>
      )}
      {!!error && <StyledError>{error}</StyledError>}
      <StyledTimestamp>{formattedTime}</StyledTimestamp>
    </div>
  );
};

export default TransactionToast;
