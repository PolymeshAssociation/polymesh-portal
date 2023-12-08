import { useState, useContext, useEffect } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Identicon from '@polkadot/react-identicon';
import { StakingContext } from '~/context/StakingContext';
import { operatorsNames } from '~/layouts/Staking/constants';
import { formatKey } from '~/helpers/formatters';
import { Text } from '~/components/UiKit';
import { IFieldValues, NOMINATIONS_MAX_LENGTH } from '../../constants';
import { InputWrapper, StyledInput, StyledError } from '../../styles';
import {
  StyledNominationContainer,
  StyledNominationWrapper,
  StyledOperatorSelect,
  StyledSelected,
  StyledNominatorOption,
  StyledIconWrapper,
  StyledSelectedOption,
  StyledActionButton,
  StyledSelectedHeadWrapper,
} from './styles';
import { Icon } from '~/components';

interface IOperatorSelectProps {
  currentNominations?: string[];
}

export const OperatorSelect: React.FC<IOperatorSelectProps> = ({
  currentNominations,
}) => {
  const {
    operatorInfo: { operatorsWithCommission },
  } = useContext(StakingContext);

  const { watch, setValue } = useFormContext<IFieldValues>();
  const nominators = watch('nominators');

  const [filter, setFilter] = useState('');

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilter(e.target.value);

  useEffect(() => {
    if (!nominators) {
      if (currentNominations?.length) {
        setValue('nominators', currentNominations);
      } else {
        setValue('nominators', []);
      }
    }
  }, [currentNominations, nominators, setValue]);

  const candidatAccounts = Object.keys(operatorsWithCommission).filter(
    (operator) =>
      !nominators?.includes(operator) &&
      (operator.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
        operatorsNames?.[operator]
          ?.toLocaleLowerCase()
          .includes(filter.toLocaleLowerCase())),
  );

  return (
    <div>
      <Text size="medium" bold marginBottom={3}>
        Nominate Node Operators
      </Text>
      <Controller
        name="nominators"
        render={({ field: { onChange, value } }) => (
          <>
            <StyledNominationContainer>
              <StyledNominationWrapper>
                <Text size="medium" bold marginBottom={3}>
                  Candidates ({Object.keys(operatorsWithCommission).length})
                </Text>
                <InputWrapper>
                  <StyledInput
                    placeholder="Filter by name or address"
                    value={filter}
                    onChange={handleFilterChange}
                  />
                </InputWrapper>
                <StyledOperatorSelect>
                  {candidatAccounts.map((account) => (
                    <StyledNominatorOption
                      key={account}
                      onClick={() => {
                        const newValue = value
                          ? [...value, account]
                          : [account];
                        if (filter) {
                          setFilter('');
                        }
                        onChange(newValue);
                      }}
                    >
                      <Identicon
                        value={account}
                        size={18}
                        style={{
                          borderRadius: '50%',
                          overflow: 'hidden',
                        }}
                      />
                      {operatorsNames[account] || formatKey(account)}
                    </StyledNominatorOption>
                  ))}
                </StyledOperatorSelect>
              </StyledNominationWrapper>
              <StyledNominationWrapper>
                <StyledSelectedHeadWrapper>
                  <Text size="medium" bold marginBottom={3}>
                    Selected Operators
                  </Text>
                  <StyledActionButton
                    disabled={nominators && !nominators.length}
                    onClick={() => setValue('nominators', [])}
                  >
                    <Icon name="Delete" size="18px" />
                    Clear All
                  </StyledActionButton>
                </StyledSelectedHeadWrapper>
                <StyledSelected>
                  {value?.map((account: string) => (
                    <StyledSelectedOption key={account}>
                      <Identicon
                        value={account}
                        size={18}
                        style={{
                          borderRadius: '50%',
                          overflow: 'hidden',
                        }}
                      />
                      {operatorsNames[account] || formatKey(account)}
                      <StyledIconWrapper
                        onClick={(e) => {
                          e.stopPropagation();
                          const newValue = value.filter(
                            (elem: string) => elem !== account,
                          );
                          onChange(newValue);
                        }}
                      >
                        <Icon name="CloseCircleIcon" />
                      </StyledIconWrapper>
                    </StyledSelectedOption>
                  ))}
                </StyledSelected>
              </StyledNominationWrapper>
            </StyledNominationContainer>
            {value?.length > NOMINATIONS_MAX_LENGTH && (
              <StyledError>
                Limit reached. Choose up to {NOMINATIONS_MAX_LENGTH} node
                operators.
              </StyledError>
            )}
          </>
        )}
      />
    </div>
  );
};
