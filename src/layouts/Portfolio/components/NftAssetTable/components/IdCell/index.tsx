import { Icon } from '~/components';
import { IdCellWrapper, IconWrapper } from './styles';

interface IIdCellProps {
  link: string;
  label: string;
}

export const IdCell: React.FC<IIdCellProps> = ({ link, label }) => {
  const handleClick = () => window.open(link, '_blank');
  return (
    <IdCellWrapper onClick={handleClick}>
      <IconWrapper>
        <Icon name="ArrowTopRight" />
      </IconWrapper>
      {label}
    </IdCellWrapper>
  );
};
