import { useState } from 'react';
import { Icon } from '~/components';
import { Heading } from '~/components/UiKit';
import {
  StyledAuthHeader,
  StyledAuthHeaderWrap,
  StyledCloseButton,
} from '../../styles';
import { NewsletterSignup } from '../NewsletterSignup';

interface IViewVerifiedProps {
  handleDismiss: () => void;
}

export const ViewVerified = ({ handleDismiss }: IViewVerifiedProps) => {
  const [subscribed, setSubscribed] = useState(false);

  const introMessage = subscribed
    ? "You've been subscribed to our newsletter, thank you!"
    : "You're all set to fully utilize Polymesh network!";

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

      <Heading type="h4">{introMessage}</Heading>

      <NewsletterSignup
        variant="inline"
        eventName="newsletter-view"
        onComplete={() => setSubscribed(true)}
      />
    </>
  );
};
