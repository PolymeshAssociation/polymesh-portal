import { ERawMultiSigStatus } from '~/constants/queries/types';
import { StyledStatus } from '../styles';

export const StatusCell = ({ status }: { status: ERawMultiSigStatus }) => (
  <StyledStatus className={status.toLocaleLowerCase()}>{status}</StyledStatus>
);
