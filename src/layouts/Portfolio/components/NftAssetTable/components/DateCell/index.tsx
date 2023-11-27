import { StyledDateTimeCell, StyledTime } from './styles';

interface IDateCellProps {
  data: string;
}

export const DateCell: React.FC<IDateCellProps> = ({ data }) => {
  if (!data) return '';
  const [date, time] = data.split(' ');
  return (
    <StyledDateTimeCell>
      {date} /<StyledTime>{time}</StyledTime>
    </StyledDateTimeCell>
  );
};
