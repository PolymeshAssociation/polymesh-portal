import { MatomoData } from '~/helpers/matomo';

export enum EButtonVariants {
  ACCENT = 'accent',
  TRANSPARENT = 'transparent',
  PRIMARY = 'primary',
  SECONDARY = 'secondary',
  MODAL_PRIMARY = 'modalPrimary',
  MODAL_SECONDARY = 'modalSecondary',
  SUCCESS = 'success',
  OUTLINE = 'outline',
}

export interface IButtonProps {
  variant?: `${EButtonVariants}`;
  marginTop?: number;
  marginBottom?: number;
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  round?: boolean;
  square?: boolean;
  matomoData?: MatomoData;
}
