import { TIcons } from '~/assets/icons/types';
import { Icon } from '~/components';
import {
  IconWrapper,
  StyledDescription,
  StyledValue,
  StyledWrapper,
} from './styles';

interface IMenuItemProps {
  iconName: TIcons;
  description: string;
  value: React.ReactNode;
}

export const MenuItem: React.FC<IMenuItemProps> = ({
  iconName,
  description,
  value,
}) => {
  return (
    <StyledWrapper>
      <StyledDescription>
        <IconWrapper>
          <Icon name={iconName} size="24px" />
        </IconWrapper>
        {description}
      </StyledDescription>
      <StyledValue>{value}</StyledValue>
    </StyledWrapper>
  );
};
