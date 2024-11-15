import { Button } from '~/components/UiKit';
import { StyledActionButtonsWrap } from './styles';
import { MatomoData } from '~/helpers/matomoTags';

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
  onProceed = undefined,
  onGoBack = undefined,
  proceedTag = undefined,
  goBackTag = undefined,
  matomoData = undefined,
}: IPopupActionButtonsProps) => {
  const enhanceMatomoData = (defaultAction: string) => {
    if (matomoData && !matomoData['eventAction']) {
      return { ...matomoData, 'eventAction': defaultAction };
    }
    return matomoData;
  };

  return (
    <StyledActionButtonsWrap $aligned={aligned}>
      {onGoBack && (
        <Button
          onClick={onGoBack}
          variant="modalSecondary"
          matomoData={enhanceMatomoData(goBackTag ?? goBackLabel.toLowerCase())}
        >
          {goBackLabel}
        </Button>
      )}

      {onProceed && (
        <Button
          onClick={onProceed}
          variant="modalPrimary"
          disabled={!canProceed}
          matomoData={enhanceMatomoData(proceedTag ?? proceedLabel.toLowerCase())}
        >
          {proceedLabel}
        </Button>
      )}
    </StyledActionButtonsWrap>
  );
};
