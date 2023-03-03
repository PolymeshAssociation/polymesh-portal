import { createElement } from 'react';
import { IconWrapper } from './styles';
import * as icons from '~/assets/icons';

interface IIconProps {
  name: string;
  size?: string;
}

const Icon: React.FC<IIconProps> = ({ name, size }) => {
  if (!name) return null;

  const svg = icons[name];

  if (!svg) {
    // console.error(`Requested icon "${name}" not found`);
    return null;
  }

  return <IconWrapper size={size}>{createElement(svg)}</IconWrapper>;
};

export default Icon;
