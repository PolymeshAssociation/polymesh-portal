import React, { useContext } from 'react';
import { ButtonRow, Button } from '../styles';
import { Icon } from '~/components';
import { AccountContext } from '~/context/AccountContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';

interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isFinalStep: boolean;
  disabled?: boolean;
  isLoading?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onNext,
  isFinalStep,
  disabled = false,
  isLoading = false,
}) => {
  const { isExternalConnection } = useContext(AccountContext);
  const { isTransactionInProgress } = useTransactionStatusContext();

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNext();
  };

  const isButtonDisabled =
    disabled ||
    (isFinalStep && (isExternalConnection || isTransactionInProgress)) ||
    isLoading;

  const getButtonContent = () => {
    if (isFinalStep) {
      if (isLoading) {
        return 'Creating Asset...';
      }
      return 'Create Asset';
    }

    return (
      <>
        Next <Icon name="NextPage" size="20px" />
      </>
    );
  };

  return (
    <ButtonRow>
      {onBack && (
        <Button type="button" onClick={onBack} disabled={isLoading}>
          <Icon name="PrevPage" size="20px" />
          Back
        </Button>
      )}
      <Button type="button" onClick={handleNext} disabled={isButtonDisabled}>
        {getButtonContent()}
      </Button>
    </ButtonRow>
  );
};

export default StepNavigation;
