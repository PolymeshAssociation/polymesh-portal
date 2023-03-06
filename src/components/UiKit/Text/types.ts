export enum ETextSize {
  LARGE = 'large',
  MEDIUM = 'medium',
  SMALL = 'small',
}

export interface ITextProps {
  centered?: boolean;
  marginTop?: number;
  marginBottom?: number;
  width?: number;
  color?: string;
  size: ETextSize;
  bold?: boolean;
  children: React.ReactNode;
}
