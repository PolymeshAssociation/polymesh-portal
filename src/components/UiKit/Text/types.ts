export enum ETextSize {
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
}

export enum ETextColor {
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export enum ETextTransform {
  CAPITALIZE = 'capitalize',
  LOWERCASE = 'lowercase',
  UPPERCASE = 'uppercase',
}

export interface ITextProps {
  centered?: boolean;
  marginTop?: number;
  marginBottom?: number;
  width?: number;
  color: ETextColor;
  size: ETextSize;
  bold?: boolean;
  transform?: ETextTransform;
  children: React.ReactNode;
}
