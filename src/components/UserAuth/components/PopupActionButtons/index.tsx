import { Button } from '~/components/UiKit';
import { StyledActionButtonsWrap } from './styles';

interface IPopupActionButtonsProps {
  proceedLabel?: string;
  goBackLabel?: string;
  aligned?: boolean;
  canProceed?: boolean;
  onProceed?: () => void;
  onGoBack?: () => void;
  proceedTag?: string;
  goBackTag?: string;
  [key: string]: any; // Accept any additional props
}

export const PopupActionButtons = ({
  proceedLabel = 'Proceed',
  goBackLabel = 'Back',
  aligned = false,
  canProceed = true,
  onProceed = undefined,
  onGoBack = undefined,
  proceedTag = undefined,
  goBackTag = undefined,
  ...props
}: IPopupActionButtonsProps) => {
  return (
    <StyledActionButtonsWrap $aligned={aligned}>
      {onGoBack && (
        <Button
          onClick={onGoBack}
          variant="modalSecondary"
          {...props}
          data-event-action={goBackTag ?? goBackLabel.toLowerCase()}
        >
          {goBackLabel}
        </Button>
      )}

      {onProceed && (
        <Button
          onClick={onProceed}
          variant="modalPrimary"
          disabled={!canProceed}
          {...props}
          data-event-action={proceedTag ?? proceedLabel.toLowerCase()}
        >
          {proceedLabel}
        </Button>
      )}
    </StyledActionButtonsWrap>
  );
};
