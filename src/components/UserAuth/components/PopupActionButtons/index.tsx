import { Button } from '~/components/UiKit';
import { StyledActionButtonsWrap } from './styles';

interface IPopupActionButtonsProps {
  proceedLabel?: string;
  goBackLabel?: string;
  aligned?: boolean;
  canProceed?: boolean;
  onProceed?: () => void;
  onGoBack?: () => void;
}

export const PopupActionButtons = ({
  proceedLabel = 'Proceed',
  goBackLabel = 'Back',
  aligned = false,
  canProceed = true,
  onProceed = undefined,
  onGoBack = undefined,
}: IPopupActionButtonsProps) => {
  return (
    <StyledActionButtonsWrap $aligned={aligned}>
      {onGoBack && (
        <Button onClick={onGoBack} variant="modalSecondary">
          {goBackLabel}
        </Button>
      )}

      {onProceed && (
        <Button
          onClick={onProceed}
          variant="modalPrimary"
          disabled={!canProceed}
        >
          {proceedLabel}
        </Button>
      )}
    </StyledActionButtonsWrap>
  );
};
