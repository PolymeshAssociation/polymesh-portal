export enum EButtonVariants {
  ACCENT = 'accent',
  TRANSPARENT = 'transparent',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  MODAL_PRIMARY = 'modalPrimary',
  MODAL_SECONDARY = 'modalSecondary',
}

export interface IButtonProps {
  variant: EButtonVariants;
  marginTop?: number;
  marginBottom?: number;
  children: React.ReactNode;
  onClick?: () => void;
  disabled: boolean;
}
