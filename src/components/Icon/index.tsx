import { createElement } from 'react';
import { IconWrapper } from './styles';
import * as icons from '~/assets/icons';
import { TIcons } from '~/assets/icons/types';

interface IIconProps {
  name: TIcons;
  size?: string;
  className?: string;
}

function isSupportedImageFile(filename: string): boolean {
  const supportedExtensions: string[] = [
    '.jpg',
    '.jpeg',
    '.png',
    '.gif',
    '.bmp',
    '.svg',
  ];
  const fileExtension: string = filename
    .substring(filename.lastIndexOf('.'))
    .toLowerCase();
  return supportedExtensions.includes(fileExtension);
}
const Icon: React.FC<IIconProps> = ({ name, size, className }) => {
  if (!name) return null;

  const icon = icons[name];

  if (!icon) {
    // console.error(`Requested icon "${name}" not found`);
    return null;
  }

  if (typeof icon === 'string') {
    if (isSupportedImageFile(icon)) {
      return (
        <IconWrapper $size={size} className={className}>
          <img src={icon} alt={name} style={{ width: size, height: size }} />
        </IconWrapper>
      );
    }
    return null;
  }

  return (
    <IconWrapper $size={size} className={className}>
      {createElement(icon)}
    </IconWrapper>
  );
};

export default Icon;
