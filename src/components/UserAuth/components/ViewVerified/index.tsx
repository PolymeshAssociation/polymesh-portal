import { Icon } from '~/components';
import {
  StyledAuthHeaderWrap,
  StyledAuthHeader,
  StyledCloseButton,
} from '../../styles';

interface IViewVerifiedProps {
  handleDismiss: () => void;
}

export const ViewVerified = ({ handleDismiss }: IViewVerifiedProps) => {
  return (
    <>
      <StyledAuthHeaderWrap>
        <StyledAuthHeader>Onboarding Complete!</StyledAuthHeader>
        <StyledCloseButton onClick={handleDismiss}>
          <Icon name="CloseCircledIcon" size="24px" />
        </StyledCloseButton>
      </StyledAuthHeaderWrap>
      <h4>You’re all set to fully utilize Polymesh network!</h4>
      <h5>Subscribe to our newsletter for news and updates</h5>
      <div>COMMING SOON</div>
    </>
  );
};
