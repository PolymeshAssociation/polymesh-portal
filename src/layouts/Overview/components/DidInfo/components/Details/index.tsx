import { useContext, useState } from 'react';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';
import { Modal, Icon, CopyToClipboard } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import {
  StyledAccountWrapper,
  Separator,
  StyledBottomData,
  StyledBottomInfo,
  StyledDidWrapper,
  StyledTopInfo,
  StyledVerifiedLabel,
  IconWrapper,
  StyledDidThumb,
  StyledBalance,
  StyledKeysList,
  StyledKeyData,
  StyledLabel,
  KeyDetails,
  KeyInfo,
  StyledButtonsWrapper,
  StyledSelect,
} from './styles';
import { formatDid, formatBalance, formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError } from '~/helpers/notifications';
import { PolymeshContext } from '~/context/PolymeshContext';

interface IDetailsProps {
  toggleModal: () => void;
  isVerified: boolean;
  did?: string;
  expiry: string;
  issuer: string | null;
}

export const Details: React.FC<IDetailsProps> = ({
  toggleModal,
  isVerified,
  did,
  expiry,
  issuer,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const {
    allKeyInfo,
    primaryKey,
    allAccountsWithMeta,
    selectedAccount,
    refreshAccountIdentity,
  } = useContext(AccountContext);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { handleStatusChange } = useTransactionStatus();
  const { isMobile } = useWindowWidth();

  const handleKeySelect = (key: string) => {
    setSelectedKeys((prev) => {
      if (!prev.length) {
        return [key];
      }
      if (prev.some((selectedKey) => selectedKey === key)) {
        return prev.filter((selectedKey) => selectedKey !== key);
      }
      return [...prev, key];
    });
  };

  const handleLeaveIdentity = async () => {
    if (!sdk) return;
    let unsubCb: UnsubCallback | undefined;
    try {
      toggleModal();
      const tx = await sdk.accountManagement.leaveIdentity();
      unsubCb = tx.onStatusChange(handleStatusChange);
      await tx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      refreshAccountIdentity();
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  const handleRemoveAccounts = async () => {
    if (!sdk) return;
    let unsubCb: UnsubCallback | undefined;
    try {
      toggleModal();
      const accounts = await Promise.all(
        selectedKeys.map(async (key) =>
          sdk.accountManagement.getAccount({ address: key }),
        ),
      );
      const tx = await sdk.accountManagement.removeSecondaryAccounts({
        accounts,
      });
      unsubCb = tx.onStatusChange(handleStatusChange);
      await tx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setSelectedKeys([]);
      refreshAccountIdentity();
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  const primaryIsSelected = selectedAccount === primaryKey;

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Account Details
      </Heading>
      <StyledAccountWrapper>
        <StyledTopInfo>
          <IconWrapper size="64px">
            <Icon name="AuthorizationsIcon" className="id-icon" />
          </IconWrapper>
          <div className="did-wrapper">
            <Text color="secondary" marginBottom={8}>
              Your DID
            </Text>
            <StyledDidWrapper>
              <StyledDidThumb>{formatDid(did, 7, 8)}</StyledDidThumb>
              <IconWrapper className="copy-icon">
                <CopyToClipboard value={did} />
              </IconWrapper>
            </StyledDidWrapper>
          </div>
          {isVerified && <StyledVerifiedLabel>Verified</StyledVerifiedLabel>}
        </StyledTopInfo>
        <StyledBottomInfo>
          <StyledBottomData>
            Expires on: <span>{expiry}</span>
          </StyledBottomData>
          <Separator />
          <StyledBottomData>
            Verified by: <span>{formatDid(issuer)}</span>
          </StyledBottomData>
        </StyledBottomInfo>
      </StyledAccountWrapper>
      <Text bold size="large" marginTop={36} marginBottom={22}>
        Your keys
      </Text>
      <StyledKeysList>
        {allKeyInfo
          .sort((a, b) => {
            if (a.key === selectedAccount) return -1;
            if (b.key === selectedAccount) return 1;
            return 0;
          })
          .map(
            ({ key, totalBalance, available, isMultiSig, multisigDetails }) => {
              const isPrimaryKey = key === primaryKey;
              const keyName = allAccountsWithMeta.find(
                ({ address }) => address === key,
              )?.meta.name;
              return (
                <StyledKeyData key={key}>
                  <KeyInfo>
                    <div className="name-container">
                      {keyName && (
                        <Text transform="uppercase" bold>
                          {keyName}
                        </Text>
                      )}
                    </div>
                    <div className="status-container">
                      {available && (
                        <StyledLabel available>
                          {key === selectedAccount ? (
                            <>
                              <Icon name="Check" size="16px" />
                              Selected
                            </>
                          ) : (
                            'Available'
                          )}
                        </StyledLabel>
                      )}
                      {isMultiSig && multisigDetails && (
                        <StyledLabel>
                          {multisigDetails.requiredSignatures.toNumber()} of{' '}
                          {multisigDetails.signers.length} MultiSig
                        </StyledLabel>
                      )}
                      {primaryIsSelected && !isPrimaryKey && (
                        <StyledSelect
                          isSelected={selectedKeys.includes(key)}
                          onClick={() => handleKeySelect(key)}
                        >
                          <Icon name="Check" size="16px" />
                        </StyledSelect>
                      )}
                    </div>
                  </KeyInfo>
                  <KeyDetails>
                    <StyledDidThumb className="key-wrapper">
                      {formatKey(key)}
                    </StyledDidThumb>
                    <IconWrapper>
                      <CopyToClipboard value={key} />
                    </IconWrapper>
                    <StyledBalance>
                      {formatBalance(totalBalance)}
                      <span> POLYX</span>
                    </StyledBalance>
                    <StyledLabel isPrimary={isPrimaryKey}>
                      {isPrimaryKey ? 'Primary' : 'Secondary'}
                    </StyledLabel>
                  </KeyDetails>
                </StyledKeyData>
              );
            },
          )}
      </StyledKeysList>
      <StyledButtonsWrapper>
        {primaryIsSelected ? (
          <Button
            variant="modalPrimary"
            disabled={!selectedKeys.length}
            onClick={handleRemoveAccounts}
          >
            Remove Accounts
          </Button>
        ) : (
          <Button variant="modalPrimary" onClick={handleLeaveIdentity}>
            Leave Identity
          </Button>
        )}
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Close
          </Button>
        )}
      </StyledButtonsWrapper>
    </Modal>
  );
};
