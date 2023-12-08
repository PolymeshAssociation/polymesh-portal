import { useState, useEffect, useContext, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';
import { useOutsideClick } from '~/hooks/utility';
import { formatKey } from '~/helpers/formatters';
import { Text } from '~/components/UiKit';
import { Icon } from '~/components';
import { IFieldValues } from '../../constants';
import {
  InputWrapper,
  StyledInput,
  StyledError,
  StyledExpandedSelect,
  SelectWrapper,
  StyledSelectOption,
  StyledPlaceholder,
  StyledAccountAddress,
} from '../../styles';
import { StyledButtonWrapper } from './styles';
import { AccountContext } from '~/context/AccountContext';

interface IAccountsDropdownProps {
  header: string;
  currentAddress?: string;
  isController?: boolean;
}

export const AccountsDropdown: React.FC<IAccountsDropdownProps> = ({
  header,
  currentAddress,
  isController = false,
}) => {
  const {
    register,
    setValue,
    clearErrors,
    watch,
    formState: { errors },
  } = useFormContext<IFieldValues>();
  const { selectedAccount, allAccountsWithMeta } = useContext(AccountContext);
  const [expanded, setExpanded] = useState(false);

  const fieldName = isController ? 'controller' : 'specifiedAccount';
  const error = errors?.[fieldName]?.message;

  const fieldValue = watch(fieldName);
  const ref = useOutsideClick(() => setExpanded(false));
  const toggleSelectDropdown = () => {
    setExpanded((prev) => !prev);
  };

  const handleAccountSelect = (account: string) => {
    setValue(fieldName, account, { shouldTouch: true, shouldValidate: true });
    setExpanded(false);
    if (error) {
      clearErrors(fieldName);
    }
  };

  useEffect(() => {
    if (currentAddress && !watch(fieldName)) {
      setValue(fieldName, currentAddress || selectedAccount);
    }
  }, [currentAddress, fieldName, selectedAccount, setValue, watch]);

  const keyName = useMemo(() => {
    const name = allAccountsWithMeta.find(
      ({ address }) => address === fieldValue,
    )?.meta.name;
    return name || '';
  }, [allAccountsWithMeta, fieldValue]);

  return (
    <div>
      <Text size="medium" bold marginBottom={3}>
        {header}
      </Text>
      <SelectWrapper ref={ref}>
        <InputWrapper>
          <StyledInput
            placeholder="Enter address or select from your keys"
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...register(fieldName)}
          />
          <StyledButtonWrapper onClick={toggleSelectDropdown}>
            <Icon name="KeyIcon" size="16px" />
          </StyledButtonWrapper>
          {error && <StyledError>{error as string}</StyledError>}
        </InputWrapper>
        {keyName ? (
          <Text bold>
            Selected address: <span style={{ fontWeight: 400 }}>{keyName}</span>
          </Text>
        ) : (
          keyName
        )}
        {expanded && (
          <StyledExpandedSelect>
            {allAccountsWithMeta?.length ? (
              allAccountsWithMeta.map((account) => (
                <StyledSelectOption
                  key={account.address}
                  onClick={() => handleAccountSelect(account.address)}
                >
                  {account.meta.name}
                  <StyledAccountAddress>
                    {formatKey(account.address)}
                  </StyledAccountAddress>
                </StyledSelectOption>
              ))
            ) : (
              <StyledPlaceholder>No accounts available</StyledPlaceholder>
            )}
          </StyledExpandedSelect>
        )}
      </SelectWrapper>
    </div>
  );
};
