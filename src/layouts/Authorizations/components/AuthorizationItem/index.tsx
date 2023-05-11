import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import {
  AuthorizationRequest,
  NoArgsProcedureMethod,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useEffect, useState } from 'react';
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
import { formatExpiry, renderDetails } from './helpers';
import { formatDid } from '~/helpers/formatters';
import { toParsedDateTime } from '~/helpers/dateTime';
import { notifyError } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';

interface IAuthorizationItemProps {
  data: HumanReadable;
  rawData: AuthorizationRequest;
  accept?: NoArgsProcedureMethod<void, void>;
  reject: NoArgsProcedureMethod<void, void>;
}

export const AuthorizationItem: React.FC<IAuthorizationItemProps> = ({
  data,
  rawData,
  accept,
  reject,
}) => {
  const [details, setDetails] = useState<JSX.Element | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [acceptInProgress, setAcceptInProgress] = useState(false);
  const [rejectInProgress, setRejectInProgress] = useState(false);
  const { handleStatusChange } = useTransactionStatus();
  const { refreshAuthorizations } = useContext(AuthorizationsContext);
  const [searchParams] = useSearchParams();
  const direction = searchParams.get('direction');

  // Async render details for getting portfolio name
  useEffect(() => {
    if (!data || !rawData) return;
    (async () => {
      const detailsMarkup = await renderDetails(data, rawData);
      setDetails(detailsMarkup);
    })();
  }, [data, rawData]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);
  const handleAccept = async () => {
    if (!accept) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setAcceptInProgress(true);
      const acceptTx = await (accept as NoArgsProcedureMethod<void, void>)();
      unsubCb = await acceptTx.onStatusChange(handleStatusChange);
      await acceptTx.run();
      refreshAuthorizations();
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
      refreshAuthorizations();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setRejectInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

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
        {direction === EAuthorizationDirections.INCOMING ? (
          <StyledInfoItem>
            Issuing DID
            <StyledTextWithCopy>
              {formatDid(data.issuer)}
              <CopyToClipboard value={data.issuer} />
            </StyledTextWithCopy>
          </StyledInfoItem>
        ) : (
          <StyledInfoItem>
            Target {data.target.type}
            <StyledTextWithCopy>
              {formatDid(data.target.value)}
              <CopyToClipboard value={data.target.value} />
            </StyledTextWithCopy>
          </StyledInfoItem>
        )}
        <StyledInfoItem>
          Expiry Date
          <Text size="large" bold>
            {data.expiry
              ? formatExpiry(toParsedDateTime(data.expiry))
              : 'Never'}
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
              <Icon name="CloseIcon" size="24px" />
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
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
