import { useState } from 'react';
import { Text, Heading, Button } from '~/components/UiKit';
import { BusinessAccountForm } from '../BusinessAccountForm';
import { StyledSuccessContainer } from './styles';

interface IBusinessAccountProps {
  handleGoBack: () => void;
  handleClose: () => void;
}

export const BusinessAccount = ({
  handleGoBack,
  handleClose,
}: IBusinessAccountProps) => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  if (formSubmitted) {
    return (
      <>
        <StyledSuccessContainer>
          <Heading type="h4">Thank you!</Heading>
          <Text size="large">We will reach out to you shortly</Text>
        </StyledSuccessContainer>
        <Button
          onClick={handleClose}
          variant="modalPrimary"
          className="back-btn"
        >
          Back to Portal
        </Button>
      </>
    );
  }

  return (
    <BusinessAccountForm
      handleGoBack={handleGoBack}
      handleProceed={() => setFormSubmitted(true)}
    />
  );
};
