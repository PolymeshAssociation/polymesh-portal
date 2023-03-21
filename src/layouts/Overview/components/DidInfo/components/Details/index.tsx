import { useContext, useState, useEffect } from 'react';
import { PolymeshContext } from '~/context/PolymeshContext';
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
  StyledButtonsWrapper,
} from './styles';
import { formatDid, formatBalance, formatKey } from '~/helpers/formatters';

interface IDetailsProps {
  toggleModal: () => void;
  isVerified: boolean;
  identity?: string;
  expiry: string;
  issuer: string;
  primaryKey: string;
  secondaryKeys: string[];
}

export const Details: React.FC<IDetailsProps> = ({
  toggleModal,
  isVerified,
  identity,
  expiry,
  issuer,
  primaryKey,
  secondaryKeys,
}) => {
  const [allKeyBalances, setAllKeyBalances] = useState([]);

  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  // Get total balance for all keys associated with current DID
  useEffect(() => {
    if (!primaryKey) return;

    (async () => {
      const balancesByKey = await Promise.all(
        [primaryKey, ...secondaryKeys].map(async (key) => ({
          key,
          totalBalance: (
            await sdk.accountManagement.getAccountBalance({
              account: key,
            })
          ).total?.toString(),
        })),
      );
      setAllKeyBalances(balancesByKey);
    })();
  }, [primaryKey, sdk, secondaryKeys]);

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
              <StyledDidThumb>{formatDid(identity, 7, 8)}</StyledDidThumb>
              <IconWrapper className="copy-icon">
                <CopyToClipboard value={identity} />
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
      {allKeyBalances.length ? (
        <StyledKeysList>
          {allKeyBalances.map(({ key, totalBalance }) => {
            const isPrimaryKey = key === primaryKey;
            return (
              <StyledKeyData key={key}>
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
          })}
        </StyledKeysList>
      ) : (
        'Loading...'
      )}
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={toggleModal} marginTop={24}>
          Close
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
