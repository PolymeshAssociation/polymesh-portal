import React, { useContext } from 'react';
import { ButtonRow, Button } from '../styles';
import { Icon } from '~/components';
import { AccountContext } from '~/context/AccountContext';

interface StepNavigationProps {
  onBack?: () => void;
  onNext: () => void;
  isFinalStep: boolean;
  disabled?: boolean;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  onBack,
  onNext,
  isFinalStep,
  disabled = false,
}) => {
  const { isExternalConnection } = useContext(AccountContext);

  const handleNext = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onNext();
  };

  return (
    <ButtonRow>
      {onBack && (
        <Button type="button" onClick={onBack}>
          <Icon name="PrevPage" size="20px" />
          Back
        </Button>
      )}
      <Button
        type="button"
        onClick={handleNext}
        disabled={disabled || (isFinalStep && isExternalConnection)}
      >
        {isFinalStep ? (
          'Create Asset'
        ) : (
          <>
            Next <Icon name="NextPage" size="20px" />
          </>
        )}
      </Button>
    </ButtonRow>
  );
};

export default StepNavigation;
