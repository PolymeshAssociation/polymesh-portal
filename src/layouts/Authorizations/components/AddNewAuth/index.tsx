import { useState, useEffect, useRef } from 'react';
import { AuthorizationType } from '@polymeshassociation/polymesh-sdk/types';
import { FieldValues, SubmitHandler, Controller } from 'react-hook-form';
import { Icon, Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import {
  StyledTypeSelectWrapper,
  StyledButtonsWrapper,
  StyledExpandedTypeSelect,
  StyledTypeOption,
  StyledTypeSelect,
  StyledInputGroup,
  InputWrapper,
  StyledLabel,
  StyledInput,
  StyledSelect,
  StyledSelectWrapper,
  StyledErrorMessage,
  SoonLabel,
} from './styles';
import { disabledAuthTypes, configureInputs, useCustomForm } from './helpers';

interface IAddNewAuthProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export const AddNewAuth: React.FC<IAddNewAuthProps> = ({ toggleModal }) => {
  const [typeDropdownExpanded, setTypeDropdownExpanded] = useState(false);
  const [selectExpanded, setSelectExpanded] = useState(false);
  const [selectedAuthType, setSelectedAuthType] = useState<
    `${AuthorizationType}` | null
  >(null);
  const {
    register,
    handleSubmit,
    watch,
    control,
    trigger,
    formState: { errors, isValid },
  } = useCustomForm(selectedAuthType);
  const typeRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (
        typeRef.current &&
        !typeRef.current.contains(event.target as Node | null)
      ) {
        setTypeDropdownExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [typeRef]);

  useEffect(() => {
    const handleClickOutside: EventListenerOrEventListenerObject = (event) => {
      if (
        selectRef.current &&
        !selectRef.current.contains(event.target as Node | null)
      ) {
        setSelectExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [selectRef, trigger]);

  const handleTypeDropdownToggle = () =>
    setTypeDropdownExpanded((prev) => !prev);
  const handleSelectToggle = () => {
    setSelectExpanded((prev) => {
      if (!prev) {
        trigger('permissions');
      }
      return !prev;
    });
  };

  const handleAuthTypeSelect: React.ReactEventHandler = ({ target }) => {
    setSelectedAuthType((target as HTMLButtonElement).textContent);
    handleTypeDropdownToggle();
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    console.log(
      data.expiry ? { ...data, expiry: new Date(data.expiry) } : data,
    );
    toggleModal();
  };

  const inputs = configureInputs(selectedAuthType);

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={32}>
        Create New Authorization
      </Heading>
      <Text bold marginBottom={3}>
        Authorization Type
      </Text>
      <StyledTypeSelectWrapper ref={typeRef}>
        <StyledTypeSelect
          onClick={handleTypeDropdownToggle}
          expanded={typeDropdownExpanded}
          isSelected={!!selectedAuthType}
        >
          <span>{selectedAuthType || 'Select Authorization Type'}</span>

          <Icon name="DropdownIcon" />
        </StyledTypeSelect>
        {typeDropdownExpanded && (
          <StyledExpandedTypeSelect>
            {Object.values(AuthorizationType)
              .filter(
                (authType) =>
                  authType !== AuthorizationType.AttestPrimaryKeyRotation,
              )
              .sort((authType) =>
                disabledAuthTypes.includes(authType) ? 1 : -1,
              )
              .map((authType) => (
                <StyledTypeOption
                  key={authType}
                  disabled={disabledAuthTypes.includes(authType)}
                  onClick={handleAuthTypeSelect}
                  isSelected={authType === selectedAuthType}
                >
                  {authType}
                  {disabledAuthTypes.includes(authType) && (
                    <SoonLabel>Soon</SoonLabel>
                  )}
                </StyledTypeOption>
              ))}
          </StyledExpandedTypeSelect>
        )}
      </StyledTypeSelectWrapper>
      {!!selectedAuthType && (
        <StyledInputGroup>
          {inputs.map(({ id, label, type, placeholder, values }) => (
            <InputWrapper key={id}>
              {type === 'radio' ? (
                <StyledSelectWrapper ref={selectRef}>
                  <StyledLabel htmlFor={id}>{label}</StyledLabel>
                  <StyledSelect
                    expanded={selectExpanded}
                    isSelected={!watch('permissions')}
                    onClick={handleSelectToggle}
                  >
                    {selectExpanded && (
                      <Controller
                        control={control}
                        name={id}
                        render={({ field: { onChange } }) => (
                          <StyledExpandedTypeSelect>
                            {values.map((option) => (
                              <StyledTypeOption
                                key={option}
                                onClick={() => {
                                  onChange(option);
                                  trigger('permissions');
                                }}
                              >
                                {option}
                              </StyledTypeOption>
                            ))}
                          </StyledExpandedTypeSelect>
                        )}
                      />
                    )}
                    <span>{watch('permissions') || 'Select...'}</span>
                    <Icon name="DropdownIcon" className="icon" />
                  </StyledSelect>
                </StyledSelectWrapper>
              ) : (
                <>
                  <StyledLabel htmlFor={id}>{label}</StyledLabel>
                  <StyledInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register(id)}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                    min={
                      type === 'date'
                        ? new Date().toISOString().split('T')[0]
                        : undefined
                    }
                  />
                </>
              )}
              {!!errors[id] && (
                <StyledErrorMessage>
                  {errors[id].message as string}
                </StyledErrorMessage>
              )}
            </InputWrapper>
          ))}
        </StyledInputGroup>
      )}
      <StyledButtonsWrapper>
        <Button variant="modalSecondary" onClick={toggleModal}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          disabled={!selectedAuthType || !isValid}
          onClick={handleSubmit(onSubmit)}
        >
          Create
        </Button>
      </StyledButtonsWrapper>
    </Modal>
  );
};
