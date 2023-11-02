import { StyledInfoItem } from '../styles';

export const CallCell = ({ call }: { call: string }) => (
  <StyledInfoItem className="capitalize">{call}</StyledInfoItem>
);
