import { useContext } from 'react';
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
  StyledButtonsWrapper,
} from './styles';
import { formatDid, formatBalance, formatKey } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';

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
  const { allKeyBalances, primaryKey } = useContext(AccountContext);
  const { isMobile } = useWindowWidth();

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
      {allKeyBalances.length ? (
        <StyledKeysList>
          {allKeyBalances.map(({ key, totalBalance, available }) => {
            const isPrimaryKey = key === primaryKey;
            return (
              <StyledKeyData key={key}>
                {available && (
                  <StyledLabel available>
                    <Icon name="Check" size="16px" />
                    Available
                  </StyledLabel>
                )}
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
      {!isMobile && (
        <StyledButtonsWrapper>
          <Button variant="modalSecondary" onClick={toggleModal} marginTop={24}>
            Close
          </Button>
        </StyledButtonsWrapper>
      )}
    </Modal>
  );
};
