import { StyledWrapper } from './styles';

interface ICounterProps {
  count: number;
  className: string;
}

const NotificationCounter: React.FC<ICounterProps> = ({ count, className }) => {
  return (
    <StyledWrapper className={className}>
      {count < 10 ? count : '+'}
    </StyledWrapper>
  );
};

export default NotificationCounter;
