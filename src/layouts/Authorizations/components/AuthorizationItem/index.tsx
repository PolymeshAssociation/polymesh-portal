import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import {
  NoArgsProcedureMethod,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CopyToClipboard, Icon } from '~/components';
import { Button, Text } from '~/components/UiKit';
import { EAuthorizationDirections } from '../../constants';
import {
  StyledItemWrapper,
  StyledInfoItem,
  StyledInfoWrapper,
  StyledButtonsWrapper,
  StyledLabel,
  StyledTextWithCopy,
} from './styles';
import { renderDetails } from './helpers';
import { formatDid } from '~/helpers/formatters';
import { toParsedDateTime } from '~/helpers/dateTime';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';

interface IAuthorizationItemProps {
  data: HumanReadable;
  accept?: NoArgsProcedureMethod<void, void>;
  reject: NoArgsProcedureMethod<void, void>;
}

export const AuthorizationItem: React.FC<IAuthorizationItemProps> = ({
  data,
  accept,
  reject,
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [acceptInProgress, setAcceptInProgress] = useState(false);
  const [rejectInProgress, setRejectInProgress] = useState(false);
  const { handleStatusChange } = useTransactionStatus();
  const [searchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);
  const handleAccept = async () => {
    if (!accept) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setAcceptInProgress(true);
      const acceptTx = await (accept as NoArgsProcedureMethod<void, void>)();
      unsubCb = await acceptTx.onStatusChange(handleStatusChange);
      await acceptTx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setAcceptInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };
  const handleReject = async () => {
    let unsubCb: UnsubCallback | undefined;
    try {
      setRejectInProgress(true);
      const rejectTx = await reject();
      unsubCb = await rejectTx.onStatusChange(handleStatusChange);
      await rejectTx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setRejectInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  const details = renderDetails(data);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        <StyledInfoItem>
          Id
          <Text size="large" bold>
            {data.id}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Auth Type
          <Text size="large" bold>
            {data.data.type}
          </Text>
        </StyledInfoItem>
        <StyledInfoItem>
          Issuing DID
          <StyledTextWithCopy>
            {formatDid(data.issuer)}
            <CopyToClipboard value={data.issuer} />
          </StyledTextWithCopy>
        </StyledInfoItem>
        <StyledInfoItem>
          Expiry Date
          <Text size="large" bold>
            {data.expiry ? toParsedDateTime(data.expiry) : 'Never'}
          </Text>
        </StyledInfoItem>
        {direction === EAuthorizationDirections.OUTGOING && (
          <StyledLabel>Pending</StyledLabel>
        )}
      </StyledInfoWrapper>
      {detailsExpanded && details ? details : null}
      <StyledButtonsWrapper expanded={detailsExpanded}>
        {direction === EAuthorizationDirections.INCOMING ? (
          <>
            <Button onClick={handleReject} disabled={rejectInProgress}>
              Reject
            </Button>
            <Button
              variant="success"
              onClick={handleAccept}
              disabled={acceptInProgress}
            >
              <Icon name="Check" size="24px" />
              Approve
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={rejectInProgress}
          >
            Cancel
          </Button>
        )}
        <Button variant="secondary" onClick={toggleDetails} disabled={!details}>
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
