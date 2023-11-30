import { ProposalStatus } from '@polymeshassociation/polymesh-sdk/types';
import { ERawMultiSigStatus } from '~/constants/queries/types';
import { StyledStatus } from '../styles';

export const StatusCell = ({
  status,
}: {
  status: ERawMultiSigStatus | ProposalStatus;
}) => (
  <StyledStatus className={status.toLocaleLowerCase()}>{status}</StyledStatus>
);
