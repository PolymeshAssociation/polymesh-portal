import { useState } from 'react';
import { Icon } from '~/components';
import { Button, Text } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import { REGEX_EMAIL } from '../../constants';
import { CustomInput, useInput } from '../CustomInput';
import { SecondaryButton } from '../SecondaryButton';
import { fetchEmailSubscription } from './helpers';
import {
  StyledCheckBox,
  StyledCheckboxesContainer,
  StyledCheckboxInput,
  StyledEmailField,
  StyledInputsContainer,
  StyledNewsContainer,
} from './styles';

interface NewsletterSignupProps {
  variant?: 'modal' | 'inline';
  onComplete?: () => void;
  compact?: boolean;
  eventName?: string;
}

export const NewsletterSignup = ({
  variant = 'inline',
  onComplete,
  compact = false,
  eventName,
}: NewsletterSignupProps) => {
  const {
    value: email,
    error,
    handleInputChange,
    handleErrorChange,
  } = useInput();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [newsletterAccepted, setNewsletterAccepted] = useState(false);
  const [devUpdatesAccepted, setDevUpdatesAccepted] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handlePolicyClick = () =>
    window.open(import.meta.env.VITE_PRIVACY_POLICY_URL, '_blank');

  const handleSubscribe = async () => {
    if (!email.match(REGEX_EMAIL)) {
      if (variant === 'modal') {
        handleErrorChange('Please enter a valid E-mail');
      } else {
        notifyError('Please enter a valid E-mail');
      }
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
      if (onComplete) {
        onComplete();
      }
    } else {
      notifyError('Subscription failed! Please, try again');
    }
  };

  const needToCheck = !newsletterAccepted && !devUpdatesAccepted;

  if (subscribed) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: compact ? '12px 0' : '16px 0',
        }}
      >
        <Text size={compact ? 'medium' : 'large'} bold>
          Thank you for subscribing!
        </Text>
        {!compact && (
          <Text size="medium" marginTop={8}>
            You'll receive updates about Polymesh developments and ecosystem
            news.
          </Text>
        )}
      </div>
    );
  }

  return (
    <StyledNewsContainer>
      <StyledInputsContainer>
        <Text size="large">
          Subscribe to our newsletter for news and updates
        </Text>
        <StyledEmailField>
          <CustomInput
            placeholder="Enter E-mail"
            handleChange={handleInputChange}
            value={email}
            error={variant === 'modal' ? error : ''}
            isBig={!compact}
          />
          {variant === 'inline' && (
            <Button
              onClick={handleSubscribe}
              variant="modalSecondary"
              disabled={!email || !!error || needToCheck || !termsAccepted}
              data-event-category="newsletter"
              data-event-action="subscribe"
              data-event-name={eventName || 'onboarding-newsletter'}
            >
              Subscribe
            </Button>
          )}
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
              I'd like to receive the Polymesh newsletter for exclusive insights
              and ecosystem updates
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
              I'd like to join the developer mailing list and be notified of
              important upcoming features and changes
            </Text>
          </StyledCheckboxInput>
        </StyledCheckboxesContainer>
      </StyledInputsContainer>

      {variant === 'modal' && (
        <Button
          variant="modalPrimary"
          className="subscribe-btn"
          disabled={!email || !!error || !termsAccepted || needToCheck}
          onClick={handleSubscribe}
          data-event-category="newsletter"
          data-event-action="subscribe"
          data-event-name={eventName || 'newsletter-view'}
        >
          Subscribe
        </Button>
      )}
    </StyledNewsContainer>
  );
};
