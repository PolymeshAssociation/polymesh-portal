import { Text } from '~/components/UiKit';
import { notifyError } from '~/helpers/notifications';
import { CustomInput, useInput } from '../../../CustomInput';
import { PopupActionButtons } from '../../../PopupActionButtons';
import { REGEX_EMAIL } from '../../../../constants';
import { fetchContactUs } from './helpers';
import { StyledSubtitleWrap, StyledBusinessContainer } from './styles';

interface IBusinessAccountFormProps {
  handleGoBack: () => void;
  handleProceed: () => void;
}

export const BusinessAccountForm = ({
  handleGoBack,
  handleProceed,
}: IBusinessAccountFormProps) => {
  const {
    value: name,
    error: nameError,
    handleInputChange: changeName,
  } = useInput();

  const {
    value: email,
    error: emailError,
    handleInputChange: changeEmail,
    handleErrorChange: setEmailError,
  } = useInput();

  const handleSubmit = async () => {
    if (!email.match(REGEX_EMAIL)) {
      setEmailError('Please enter correct email');
      return;
    }
    const submitted = await fetchContactUs({ firstName: name, email });
    if (submitted) {
      handleProceed();
    } else {
      notifyError('Something went wrong! Please try again');
    }
  };

  return (
    <>
      <StyledSubtitleWrap>
        <Text bold size="large">
          Give us your contact information and our representative will reach out
          to you shortly!
        </Text>
      </StyledSubtitleWrap>
      <StyledBusinessContainer>
        <CustomInput
          label="Name"
          placeholder="Full Name"
          handleChange={changeName}
          value={name}
          error={nameError}
        />
        <CustomInput
          label="Company E-Mail"
          placeholder="Full Name"
          handleChange={changeEmail}
          value={email}
          error={emailError}
        />
      </StyledBusinessContainer>
      <PopupActionButtons
        onProceed={handleSubmit}
        onGoBack={handleGoBack}
        proceedLabel="Contact Us"
        data-event-category="onboarding"
        data-event-name="contact-us-view"        
        canProceed={!nameError && !!name && !emailError && !!email}
        aligned
      />
    </>
  );
};
