import { Text } from '~/components/UiKit';
import { CustomInput, useInput } from '../../../CustomInput';
import { PopupActionButtons } from '../../../PopupActionButtons';
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
  } = useInput();

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
          label="Name of the Authorized Individual"
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
        onProceed={handleProceed}
        onGoBack={handleGoBack}
        canProceed={!nameError && !!name && !emailError && !!email}
        aligned
      />
    </>
  );
};
