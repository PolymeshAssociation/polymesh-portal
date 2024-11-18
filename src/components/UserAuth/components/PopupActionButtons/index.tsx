import { Button } from '~/components/UiKit';
import { StyledActionButtonsWrap } from './styles';
import { MatomoData } from '~/helpers/matomo';

interface IPopupActionButtonsProps {
  proceedLabel?: string;
  goBackLabel?: string;
  aligned?: boolean;
  canProceed?: boolean;
  onProceed?: () => void;
  onGoBack?: () => void;
  proceedTag?: string;
  goBackTag?: string;
  matomoData?: MatomoData;
}

export const PopupActionButtons = ({
  proceedLabel = 'Proceed',
  goBackLabel = 'Back',
  aligned = false,
  canProceed = true,
  onProceed,
  onGoBack,
  proceedTag,
  goBackTag,
  matomoData,
}: IPopupActionButtonsProps) => {
  return (
    <StyledActionButtonsWrap $aligned={aligned}>
      {onGoBack && (
        <Button
          onClick={onGoBack}
          variant="modalSecondary"
          data-event-category={matomoData?.eventCategory}
          data-event-name={matomoData?.eventName}
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
          data-event-category={matomoData?.eventCategory}
          data-event-name={matomoData?.eventName}
          data-event-action={proceedTag ?? proceedLabel.toLowerCase()}
        >
          {proceedLabel}
        </Button>
      )}
    </StyledActionButtonsWrap>
  );
};
