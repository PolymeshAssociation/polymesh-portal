import { toFormattedTimestamp } from '~/helpers/dateTime';
import { StyledInfoItem } from '../styles';

export const DateTimeCell = ({ date }: { date: string | Date | null }) => (
  <StyledInfoItem>
    {date ? toFormattedTimestamp(date, 'YYYY-MM-DD / HH:mm:ss') : 'Never'}
  </StyledInfoItem>
);
