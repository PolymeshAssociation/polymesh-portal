import { createElement } from 'react';
import { IconWrapper } from './styles';
import * as icons from '~/assets/icons';
import { TIcons } from '~/assets/icons/types';

interface IIconProps {
  name: TIcons;
  size?: string;
  className?: string;
}

const Icon: React.FC<IIconProps> = ({ name, size, className }) => {
  if (!name) return null;

  const svg = icons[name];

  if (!svg) {
    // console.error(`Requested icon "${name}" not found`);
    return null;
  }

  return (
    <IconWrapper size={size} className={className}>
      {createElement(svg)}
    </IconWrapper>
  );
};

export default Icon;
