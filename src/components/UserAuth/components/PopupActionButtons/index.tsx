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
  const goBackMatomoData = matomoData
    ? {
        ...matomoData,
        eventAction: goBackTag ?? goBackLabel.toLowerCase(),
      }
    : undefined;

  const proceedMatomoData = matomoData
    ? {
        ...matomoData,
        eventAction: proceedTag ?? proceedLabel.toLowerCase(),
      }
    : undefined;

  return (
    <StyledActionButtonsWrap $aligned={aligned}>
      {onGoBack && (
        <Button
          onClick={onGoBack}
          variant="modalSecondary"
          matomoData={goBackMatomoData}
        >
          {goBackLabel}
        </Button>
      )}

      {onProceed && (
        <Button
          onClick={onProceed}
          variant="modalPrimary"
          disabled={!canProceed}
          matomoData={proceedMatomoData}
        >
          {proceedLabel}
        </Button>
      )}
    </StyledActionButtonsWrap>
  );
};
