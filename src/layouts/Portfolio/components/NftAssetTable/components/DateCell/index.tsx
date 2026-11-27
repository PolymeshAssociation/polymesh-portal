import { StyledDateTimeCell, StyledTime } from './styles';

interface IDateCellProps {
  data: string;
  // Drops the reserved width, for tables that need every column to fit
  compact?: boolean;
}

export const DateCell: React.FC<IDateCellProps> = ({ data, compact }) => {
  if (!data) return '';
  const [date, time] = data.split(' ');
  return (
    <StyledDateTimeCell $compact={compact}>
      {date} /<StyledTime>{time}</StyledTime>
    </StyledDateTimeCell>
  );
};
