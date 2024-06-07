import { useState } from 'react';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import { REGEX_EMAIL } from '../../constants';
import { CustomInput, useInput } from '../CustomInput';
import { fetchEmailSubscription } from './helpers';
import {
  StyledAuthHeaderWrap,
  StyledAuthHeader,
  StyledCloseButton,
} from '../../styles';
import { StyledEmailField } from './styles';

interface IViewVerifiedProps {
  handleDismiss: () => void;
}

export const ViewVerified = ({ handleDismiss }: IViewVerifiedProps) => {
  const [subscribed, setSubscribed] = useState(false);

  const { value, error, handleInputChange } = useInput();

  const handleSubscribe = async () => {
    if (!value.match(REGEX_EMAIL)) {
      notifyError('Please enter a valid E-mail');
      return;
    }

    const isSubscribed = await fetchEmailSubscription(value);

    if (isSubscribed) {
      setSubscribed(true);
    } else {
      notifyError('Subscription failed! Please, try again');
    }
  };

  return (
    <>
      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Onboarding Complete!</StyledAuthHeader>
        <StyledCloseButton onClick={handleDismiss}>
          <Icon name="CloseCircledIcon" size="24px" />
        </StyledCloseButton>
      </StyledAuthHeaderWrap>
      <h4>
        {subscribed
          ? 'You’ve been subscribed to our newsletter, thank you!'
          : 'You’re all set to fully utilize Polymesh network!'}
      </h4>

      {!subscribed && (
        <div>
          <h5>Subscribe to our newsletter for news and updates</h5>
          <StyledEmailField>
            <CustomInput
              placeholder="Enter E-mail"
              handleChange={handleInputChange}
              value={value}
              error=""
              isBig
            />
            <Button
              onClick={handleSubscribe}
              variant="modalSecondary"
              disabled={!value || !!error}
            >
              Subscribe
            </Button>
          </StyledEmailField>
        </div>
      )}
    </>
  );
};
