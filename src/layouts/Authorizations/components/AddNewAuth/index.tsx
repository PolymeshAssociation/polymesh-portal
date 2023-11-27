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
import {
  configureInputs,
  renderParsedSelectedValue,
  isPortfolioData,
} from './helpers';
import { useCustomForm, useSubmitHandler } from './hooks';
import {
  disabledAuthTypes,
  selectInputsDefaultValue,
  IFieldValues,
  AllowedAuthTypes,
  AuthTypesWithRequiredEntity,
  EntityDataOptions,
} from './constants';
import { useWindowWidth } from '~/hooks/utility';
import { splitCamelCase } from '~/helpers/formatters';

interface IAddNewAuthProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

const selectRefs: Node[] = [];

export const AddNewAuth: React.FC<IAddNewAuthProps> = ({ toggleModal }) => {
  const [typeDropdownExpanded, setTypeDropdownExpanded] = useState(false);
  const [selectExpanded, setSelectExpanded] = useState<{
    [x: string]: boolean;
  }>(selectInputsDefaultValue);
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
  const { submitHandler, entityData, typesWithRequiredEntityData } =
    useSubmitHandler();
  const typeRef = useRef<HTMLDivElement>(null);
  const { isMobile } = useWindowWidth();

  // Adds one or more select dropdown containers to ref array
  const addRef = (element: Node | null) => {
    if (!element) return;
    if (selectRefs.includes(element)) return;

    selectRefs.push(element);
  };

  // Handling click outside select boxes
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
        !selectRefs.some((element) =>
          element.contains(event.target as Node | null),
        )
      ) {
        setSelectExpanded(selectInputsDefaultValue);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Toggling main auth type select
  const handleTypeDropdownToggle = () =>
    setTypeDropdownExpanded((prev) => !prev);

  // Toggling one or more select dropdowns
  const handleSelectToggle = (id: string) => {
    setSelectExpanded((prev) => {
      if (!prev[id]) {
        trigger('permissions');
      }
      return { ...prev, [id]: !prev[id] };
    });
  };

  const handleAuthTypeSelect = (option: AuthorizationType) => {
    setSelectedAuthType(option);
    handleTypeDropdownToggle();
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    submitHandler[selectedAuthType as AllowedAuthTypes](data);
    toggleModal();
  };

  const inputs = configureInputs(selectedAuthType);

  return (
    <Modal handleClose={toggleModal} disableOverflow>
      <Heading type="h4" marginBottom={32}>
        Create New Authorization
      </Heading>
      <Text bold marginBottom={3}>
        Authorization Type
      </Text>
      <StyledTypeSelectWrapper ref={typeRef}>
        <StyledTypeSelect
          onClick={handleTypeDropdownToggle}
          $expanded={typeDropdownExpanded}
          $isSelected={!!selectedAuthType}
        >
          <span>
            {selectedAuthType
              ? splitCamelCase(selectedAuthType)
              : 'Select Authorization Type'}
          </span>

          <Icon name="ExpandIcon" size="18px" />
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
                  onClick={() => handleAuthTypeSelect(authType)}
                  $isSelected={authType === selectedAuthType}
                >
                  {splitCamelCase(authType)}
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
          {inputs.map(({ id, label, type, placeholder, values }) => {
            if (id === 'groupId' && watch('permissions') !== 'Custom') {
              return null;
            }
            if (id === 'groupId' && watch('permissions') === 'Custom') {
              return (
                <InputWrapper key={id} $isSelect={type === 'select'}>
                  <StyledLabel htmlFor={id}>{label}</StyledLabel>
                  <StyledInput
                    // eslint-disable-next-line react/jsx-props-no-spreading
                    {...register(id as keyof IFieldValues)}
                    id={id}
                    placeholder={placeholder}
                    type={type}
                  />
                  {!!errors[id] && (
                    <StyledErrorMessage>
                      {errors[id as keyof IFieldValues]?.message as string}
                    </StyledErrorMessage>
                  )}
                </InputWrapper>
              );
            }

            return (
              <InputWrapper key={id} $isSelect={type === 'select'}>
                {type === 'select' ? (
                  <StyledSelectWrapper ref={addRef}>
                    <StyledLabel htmlFor={id}>{label}</StyledLabel>
                    <StyledSelect
                      $expanded={selectExpanded[id]}
                      $isSelected={!watch(id as keyof IFieldValues)}
                      onClick={() => handleSelectToggle(id)}
                    >
                      {selectExpanded[id] && (
                        <Controller
                          control={control}
                          name={id as keyof IFieldValues}
                          render={({ field: { onChange } }) => {
                            if (
                              id !== 'permissions' &&
                              typesWithRequiredEntityData.includes(
                                selectedAuthType as AuthTypesWithRequiredEntity,
                              ) &&
                              !entityData[
                                selectedAuthType as AuthTypesWithRequiredEntity
                              ].length
                            ) {
                              return (
                                <StyledExpandedTypeSelect>
                                  <Text>No {id}s available</Text>
                                </StyledExpandedTypeSelect>
                              );
                            }
                            return (
                              <StyledExpandedTypeSelect>
                                {values
                                  ? values.map((value) => (
                                      <StyledTypeOption
                                        key={value.authType}
                                        onClick={() => {
                                          onChange(value.authType);
                                          trigger(id as keyof IFieldValues);
                                        }}
                                      >
                                        {value.name}
                                      </StyledTypeOption>
                                    ))
                                  : (
                                      entityData[
                                        selectedAuthType as AuthTypesWithRequiredEntity
                                      ] as EntityDataOptions
                                    ).map((entity) =>
                                      isPortfolioData(entity) ? (
                                        <StyledTypeOption
                                          key={entity.name}
                                          onClick={() => {
                                            onChange(entity.name);
                                            trigger(id as keyof IFieldValues);
                                          }}
                                        >
                                          {entity.id &&
                                          entity.id !== 'default' ? (
                                            <>{entity.id} / </>
                                          ) : null}
                                          {entity.name}
                                        </StyledTypeOption>
                                      ) : (
                                        <StyledTypeOption
                                          key={entity.ticker}
                                          onClick={() => {
                                            onChange(entity.ticker);
                                            trigger(id as keyof IFieldValues);
                                          }}
                                        >
                                          {entity.ticker}
                                        </StyledTypeOption>
                                      ),
                                    )}
                              </StyledExpandedTypeSelect>
                            );
                          }}
                        />
                      )}
                      <span>
                        {renderParsedSelectedValue(
                          watch(id as keyof IFieldValues),
                          values,
                        )}
                      </span>
                      <Icon name="ExpandIcon" size="18px" className="icon" />
                    </StyledSelect>
                  </StyledSelectWrapper>
                ) : (
                  <>
                    <StyledLabel htmlFor={id}>{label}</StyledLabel>
                    <StyledInput
                      // eslint-disable-next-line react/jsx-props-no-spreading
                      {...register(id as keyof IFieldValues)}
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
                {!!errors[id as keyof IFieldValues] && (
                  <StyledErrorMessage>
                    {errors[id as keyof IFieldValues]?.message as string}
                  </StyledErrorMessage>
                )}
              </InputWrapper>
            );
          })}
        </StyledInputGroup>
      )}
      <StyledButtonsWrapper>
        {!isMobile && (
          <Button variant="modalSecondary" onClick={toggleModal}>
            Cancel
          </Button>
        )}
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
