import { useState } from 'react';
import { Icon } from '~/components';
import { Button, Text, Heading } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import {
  CustomInput,
  useInput,
} from '~/components/UserAuth/components/CustomInput';
import { SecondaryButton } from '~/components/UserAuth/components/SecondaryButton';
import { REGEX_EMAIL } from '~/components/UserAuth/constants';
import { fetchEmailSubscription } from '~/components/UserAuth/components/ViewVerified/helpers';
import {
  StyledNewsContainer,
  StyledInputsContainer,
  StyledCheckboxInput,
  StyledCheckBox,
} from './styles';

export const NewsModal = () => {
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
      handleErrorChange('Please enter a valid E-mail');
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
    <StyledNewsContainer>
      <Heading type="h4">
        {subscribed
          ? 'Thank You!'
          : 'Subscribe to our newsletter for news and updates'}
      </Heading>
      {subscribed ? (
        <Text size="large">You’ve been subscribed to our newsletter!</Text>
      ) : (
        <>
          <StyledInputsContainer>
            <CustomInput
              placeholder="Enter E-mail"
              handleChange={handleInputChange}
              value={email}
              error={error}
              isBig
            />
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
          </StyledInputsContainer>
          <Button
            variant="modalPrimary"
            className="subscribe-btn"
            disabled={!email || !!error || !termsAccepted || needToCheck}
            onClick={handleSubscribe}
            data-event-category="newsletter"
            data-event-action="subscribe"
            data-event-name="newsletter-view"
          >
            Subscribe
          </Button>
        </>
      )}
    </StyledNewsContainer>
  );
};
