import { useState } from 'react';
import { AuthorizationRequest } from '@polymeshassociation/polymesh-sdk/types';
import { CopyToClipboard } from '~/components';
import { Button } from '~/components/UiKit';
import { StyledButtonWrapper, StyledDataWrapper } from './styles';
import { formatDid, formatKey } from '~/helpers/formatters';

interface IJoinIdentityProps {
  authorizationRequest: AuthorizationRequest;
  approveRequest: () => void;
  rejectRequest: () => void;
}

const PendingJoinIdentityRequest: React.FC<IJoinIdentityProps> = ({
  authorizationRequest,
  approveRequest,
  rejectRequest,
}) => {
  const { issuer, target } = authorizationRequest.toHuman();
  const [isRunning, setIsRunning] = useState(false);

  const handleApprove = () => {
    setIsRunning(true);
    approveRequest();
  };
  const handleReject = () => {
    setIsRunning(true);
    rejectRequest();
  };

  return (
    <div>
      Key request. Another user{' '}
      <StyledDataWrapper>
        ({formatDid(issuer)}
        <CopyToClipboard value={issuer} />)
      </StyledDataWrapper>{' '}
      has requested to assign your key{' '}
      <StyledDataWrapper>
        ({formatKey(target.value)} <CopyToClipboard value={target.value} />)
      </StyledDataWrapper>{' '}
      to their Polymesh Account. Please accept if you wish to sign on their
      behalf.
      <StyledButtonWrapper>
        <Button onClick={handleReject} disabled={isRunning}>
          Reject
        </Button>
        <Button onClick={handleApprove} disabled={isRunning}>
          Accept
        </Button>
      </StyledButtonWrapper>
    </div>
  );
};

export default PendingJoinIdentityRequest;
