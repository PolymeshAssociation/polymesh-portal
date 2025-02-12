import { useState, useContext, useEffect, useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import Identicon from '@polkadot/react-identicon';
import { StakingContext } from '~/context/StakingContext';
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
  StyledExpandIconWrapper,
  StyledOperatorSelectContainer,
} from './styles';
import { Icon } from '~/components';
import { useOperatorRewards } from '../../hooks';

interface IOperatorSelectProps {
  currentNominations?: string[];
}

export const OperatorSelect: React.FC<IOperatorSelectProps> = ({
  currentNominations = [],
}) => {
  const {
    operatorInfo: { operatorsWithCommission, operatorNames },
    stakingAccountInfo: { nominatedNames, inactiveNominations },
  } = useContext(StakingContext);
  const operatorAprRecord = useOperatorRewards();
  const { watch, setValue } = useFormContext<IFieldValues>();
  const nominators = watch('nominators');

  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'apr'>('apr');
  const [expandOperators, setExpandOperators] = useState(false);
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFilter(e.target.value);

  const toggleSortBy = () => {
    setSortBy(sortBy === 'name' ? 'apr' : 'name');
  };

  const toggleExpandOperators = () => {
    setExpandOperators((prev) => !prev);
  };

  useEffect(() => {
    if (!nominators) {
      if (currentNominations?.length) {
        setValue('nominators', currentNominations);
      } else {
        setValue('nominators', []);
      }
    }
  }, [currentNominations, nominators, setValue]);

  const candidateAccounts = useMemo(() => {
    return Object.keys(operatorsWithCommission)
      .filter(
        (operator) =>
          !nominators?.includes(operator) &&
          (operator.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
            operatorNames?.[operator]
              ?.toLocaleLowerCase()
              .includes(filter.toLocaleLowerCase())),
      )
      .sort((a, b) => {
        if (sortBy === 'apr') {
          const aprA = operatorAprRecord[a] || 0;
          const aprB = operatorAprRecord[b] || 0;
          return aprB - aprA;
        }

        const nameA = operatorNames[a] || a;
        const nameB = operatorNames[b] || b;
        return nameA.localeCompare(nameB);
      });
  }, [
    operatorsWithCommission,
    nominators,
    filter,
    operatorNames,
    sortBy,
    operatorAprRecord,
  ]);

  const combinedOperators = useMemo(() => {
    return { ...operatorNames, ...nominatedNames };
  }, [nominatedNames, operatorNames]);

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
                  Candidates ({Object.keys(operatorsWithCommission).length}),
                  with recent annualized return
                </Text>
                <InputWrapper>
                  <StyledInput
                    placeholder="Filter by name or address"
                    value={filter}
                    onChange={handleFilterChange}
                  />
                </InputWrapper>
                <StyledActionButton onClick={toggleSortBy}>
                  {`Sorted by ${sortBy === 'name' ? 'name' : 'recent return'}`}
                </StyledActionButton>
                <StyledOperatorSelectContainer>
                  <StyledOperatorSelect $expanded={expandOperators}>
                    {candidateAccounts.map((account) => (
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
                        <div className="left-content">
                          <Identicon value={account} size={18} />
                          {operatorNames[account]
                            ? `${operatorNames[account]} - ${formatKey(account)}`
                            : formatKey(account)}
                        </div>
                        <div className="right-content">
                          {operatorAprRecord[account]
                            ? operatorAprRecord[account]
                            : '--'}
                          {' %'}
                        </div>{' '}
                      </StyledNominatorOption>
                    ))}
                  </StyledOperatorSelect>
                  <StyledExpandIconWrapper
                    onClick={toggleExpandOperators}
                    $expanded={expandOperators}
                  >
                    <Icon
                      name="ExpandIcon"
                      size="24px"
                      className="expand-icon"
                    />
                  </StyledExpandIconWrapper>
                </StyledOperatorSelectContainer>
              </StyledNominationWrapper>
              <StyledNominationWrapper>
                <StyledSelectedHeadWrapper>
                  <Text size="medium" bold marginBottom={3}>
                    Selected Operators (
                    {(nominators && nominators.length) || '0'})
                  </Text>
                  <StyledActionButton
                    disabled={nominators && !nominators.length}
                    onClick={() => setValue('nominators', [])}
                  >
                    Clear All
                    <Icon name="Delete" size="18px" />
                  </StyledActionButton>
                </StyledSelectedHeadWrapper>
                <StyledSelected>
                  {value?.map((account: string) => (
                    <StyledSelectedOption key={account}>
                      <Identicon value={account} size={18} />
                      {inactiveNominations.includes(account) && (
                        <Icon name="AlertIcon" size="18px" />
                      )}
                      {combinedOperators[account]
                        ? `${combinedOperators[account]} - ${account.slice(0, 5)}`
                        : formatKey(account)}
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
