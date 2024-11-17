import { useState } from 'react';
import clsx from 'clsx';
import { useAuthContext } from '~/context/AuthContext';
import { Text, Heading, Button } from '~/components/UiKit';
import { BusinessAccountForm } from '../BusinessAccountForm';
import { StyledSuccessContainer } from './styles';

export const BusinessAccount = () => {
  const { setIdentityPopup } = useAuthContext();

  const [formSubmitted, setFormSubmitted] = useState(false);

  if (formSubmitted) {
    return (
      <>
        <StyledSuccessContainer>
          <Heading type="h4">Thank you!</Heading>
          <Text size="large">We will reach out to you shortly</Text>
        </StyledSuccessContainer>
        <Button
          onClick={() => setIdentityPopup({ type: null })}
          variant="modalPrimary"
          className={clsx('back-btn')}
        >
          Back to Portal
        </Button>
      </>
    );
  }

  return (
    <BusinessAccountForm
      handleGoBack={() => setIdentityPopup({ type: 'providers' })}
      handleProceed={() => setFormSubmitted(true)}
    />
  );
};
