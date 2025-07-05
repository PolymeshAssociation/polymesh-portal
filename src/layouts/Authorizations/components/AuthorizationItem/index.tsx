import { HumanReadable } from '@polymeshassociation/polymesh-sdk/api/entities/AuthorizationRequest';
import {
  AuthorizationRequest,
  NoArgsProcedureMethod,
} from '@polymeshassociation/polymesh-sdk/types';
import { ReactElement, useContext, useEffect, useState } from 'react';
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
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { toParsedDateTime } from '~/helpers/dateTime';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { AccountContext } from '~/context/AccountContext';
import { useWindowWidth } from '~/hooks/utility';
import { AssetDetailsModal } from '~/components/AssetDetailsModal';

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
  const [details, setDetails] = useState<ReactElement | null>(null);
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const { refreshAccountIdentity, isExternalConnection } =
    useContext(AccountContext);
  const [searchParams] = useSearchParams();
  const direction = searchParams.get('direction');
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;

  const handleAssetClick = (assetId: string) => {
    setSelectedAsset(assetId);
    setModalOpen(true);
  };

  useEffect(() => {
    if (!data || !rawData) return;
    (async () => {
      const detailsMarkup = await renderDetails(
        data,
        rawData,
        handleAssetClick,
      );
      setDetails(detailsMarkup);
    })();
  }, [data, rawData]);

  const toggleModal = () => {
    setModalOpen(false);
    setSelectedAsset(null);
  };

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  const handleAccept = async () => {
    if (!accept) return;

    try {
      await executeTransaction(
        (accept as NoArgsProcedureMethod<void, void>)(),
        {
          onSuccess: () => {
            refreshAccountIdentity();
          },
        },
      );
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const handleReject = async () => {
    try {
      await executeTransaction(reject(), {
        onSuccess: () => {
          refreshAccountIdentity();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
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
            {splitCamelCase(data.data.type)}
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
          <StyledInfoItem>
            {isSmallScreen && 'Status'}
            <StyledLabel>Pending</StyledLabel>
          </StyledInfoItem>
        )}
      </StyledInfoWrapper>
      {detailsExpanded && details ? details : null}
      <StyledButtonsWrapper $expanded={detailsExpanded}>
        {direction === EAuthorizationDirections.INCOMING ? (
          <>
            <Button
              onClick={handleReject}
              disabled={isTransactionInProgress || isExternalConnection}
            >
              <Icon name="CloseIcon" size="24px" />
              Reject
            </Button>
            <Button
              variant="success"
              onClick={handleAccept}
              disabled={isTransactionInProgress || isExternalConnection}
            >
              <Icon name="Check" size="24px" />
              Approve
            </Button>
          </>
        ) : (
          <Button
            variant="secondary"
            onClick={handleReject}
            disabled={isTransactionInProgress || isExternalConnection}
          >
            Cancel
          </Button>
        )}
        <Button variant="secondary" onClick={toggleDetails} disabled={!details}>
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>

      {isModalOpen && selectedAsset && (
        <AssetDetailsModal asset={selectedAsset} toggleModal={toggleModal} />
      )}
    </StyledItemWrapper>
  );
};
