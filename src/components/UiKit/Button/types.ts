export enum EButtonVariants {
  ACCENT = 'accent',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
}

export interface IButtonProps {
  variant: EButtonVariants;
  marginTop?: number;
  marginBottom?: number;
  children: React.ReactNode;
  onClick?: () => void;
  disabled: boolean;
}
