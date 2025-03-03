import { useState } from 'react';
import { notifyError } from '~/helpers/notifications';
import { Icon } from '~/components';
import { Button, Text } from '~/components/UiKit';
import { REGEX_EMAIL } from '../../constants';
import { CustomInput, useInput } from '../CustomInput';
import { SecondaryButton } from '../SecondaryButton';
import { fetchEmailSubscription } from './helpers';
import {
  StyledAuthHeaderWrap,
  StyledAuthHeader,
  StyledCloseButton,
} from '../../styles';
import {
  StyledEmailField,
  StyledCheckboxesContainer,
  StyledCheckboxInput,
  StyledCheckBox,
} from './styles';

interface IViewVerifiedProps {
  handleDismiss: () => void;
}

export const ViewVerified = ({ handleDismiss }: IViewVerifiedProps) => {
  const { value: email, error, handleInputChange } = useInput();

  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletterAccepted, setNewsletterAccepted] = useState(false);
  const [devUpdatesAccepted, setDevUpdatesAccepted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handlePolicyClick = () =>
    window.open(import.meta.env.VITE_PRIVACY_POLICY_URL, '_blank');

  const handleSubscribe = async () => {
    if (!email.match(REGEX_EMAIL)) {
      notifyError('Please enter a valid E-mail');
      return;
    }

    const isSubscribed = await fetchEmailSubscription({
      email,
      termsAccepted,
      newsletterAccepted,
      devUpdatesAccepted,
    });

    if (isSubscribed) {
      setSubscribed(true);
    } else {
      notifyError('Subscription failed! Please, try again');
    }
  };

  const needToCheck = !newsletterAccepted && !devUpdatesAccepted;

  return (
    <>
      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Onboarding Complete!</StyledAuthHeader>
        <StyledCloseButton
          onClick={handleDismiss}
          data-event-category="newsletter"
          data-event-action="close"
          data-event-name="newsletter-view"
        >
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
          <Text size="large">
            Subscribe to our newsletter for news and updates
          </Text>
          <StyledEmailField>
            <CustomInput
              placeholder="Enter E-mail"
              handleChange={handleInputChange}
              value={email}
              error=""
              isBig
            />
            <Button
              onClick={handleSubscribe}
              variant="modalSecondary"
              disabled={!email || !!error || needToCheck || !termsAccepted}
            >
              Subscribe
            </Button>
          </StyledEmailField>
          <StyledCheckboxesContainer>
            <StyledCheckboxInput>
              <StyledCheckBox
                $checked={termsAccepted}
                onClick={() => setTermsAccepted((prev) => !prev)}
              >
                {termsAccepted ? <Icon name="Check" size="12px" /> : null}
              </StyledCheckBox>
              <Text size="small">
                I have read and accept the{' '}
                <SecondaryButton
                  labelSize="small"
                  label="Polymesh Privacy Policy"
                  handleClick={handlePolicyClick}
                  underlined
                />
              </Text>
            </StyledCheckboxInput>
            <StyledCheckboxInput>
              <StyledCheckBox
                $checked={newsletterAccepted}
                onClick={() => setNewsletterAccepted((prev) => !prev)}
              >
                {newsletterAccepted ? <Icon name="Check" size="12px" /> : null}
              </StyledCheckBox>
              <Text size="small">
                I’d like to receive the Polymesh newsletter for exclusive
                insights and ecosystem updates
              </Text>
            </StyledCheckboxInput>
            <StyledCheckboxInput>
              <StyledCheckBox
                $checked={devUpdatesAccepted}
                onClick={() => setDevUpdatesAccepted((prev) => !prev)}
              >
                {devUpdatesAccepted ? <Icon name="Check" size="12px" /> : null}
              </StyledCheckBox>
              <Text size="small">
                I’d like to join the developer mailing list and be notified of
                important upcoming features and changes
              </Text>
            </StyledCheckboxInput>
          </StyledCheckboxesContainer>
        </div>
      )}
    </>
  );
};
