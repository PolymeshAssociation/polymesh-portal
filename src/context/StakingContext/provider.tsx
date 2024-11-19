import { useContext, useMemo, useState, useEffect } from 'react';
import { PolymeshContext } from '../PolymeshContext';
import StakingContext from './context';
import {
  IEraStatus,
  IOperatorInfo,
  IStakingAccountInfo,
  IStakingInfo,
  initialEraStatus,
  initialStakingAccountInfo,
  initialStakingInfo,
  initialOperatorInfo,
} from './constants';
import { AccountContext } from '../AccountContext';

interface IProviderProps {
  children: React.ReactNode;
}

const StakingProvider = ({ children }: IProviderProps) => {
  const { subscribedEventRecords } = useContext(PolymeshContext);
  const { selectedAccount } = useContext(AccountContext);

  const [eraStatus, setEraStatus] = useState<IEraStatus>(initialEraStatus);
  const [stakingInfo, setStakingInfo] =
    useState<IStakingInfo>(initialStakingInfo);
  const [stakingAccountInfo, setStakingAccountInfo] =
    useState<IStakingAccountInfo>(initialStakingAccountInfo);
  const [operatorInfo, setOperatorInfo] =
    useState<IOperatorInfo>(initialOperatorInfo);
  const [latestStakingEventBlockHash, setLatestStakingEventBlockHash] =
    useState<string>('');
  const [shouldRefetch, setShouldRefetch] = useState(false);
  const [operators, setOperators] = useState<Record<string, { name: string }>>(
    {},
  );

  const refetchAccountInfo = () => setShouldRefetch(true);

  useEffect(() => {
    const fetchOperators = async () => {
      const response = await fetch(
        'https://raw.githubusercontent.com/PolymeshAssociation/polymesh-operators/refs/heads/main/operatorNames.json',
      );
      if (!response.ok) {
        throw new Error(
          `Failed to fetch operator data: ${response.statusText}`,
        );
      }
      const data = await response.json();
      setOperators(data);
    };

    fetchOperators();
  }, []);

  // Clear account specific info when selectedAccount changes if it is not the
  // stash or controller of previous data to prevent stale data being rendered
  useEffect(() => {
    if (
      stakingAccountInfo.stashAddress &&
      !(
        selectedAccount === stakingAccountInfo.stashAddress ||
        selectedAccount === stakingAccountInfo.controllerAddress
      )
    ) {
      setStakingAccountInfo(initialStakingAccountInfo);
    }
  }, [
    selectedAccount,
    stakingAccountInfo.controllerAddress,
    stakingAccountInfo.stashAddress,
  ]);

  // latestStakingEventBlockHash can be used to trigger updates of chain queries
  useEffect(() => {
    if (!subscribedEventRecords.events.length) return;
    if (
      subscribedEventRecords.events.some(
        (e) =>
          (e.event.section === 'staking' &&
            (e.event.method === 'Bonded' ||
              e.event.method === 'Nominated' ||
              e.event.method === 'Unbonded' ||
              e.event.method === 'Withdrawn' ||
              e.event.method === 'Slash' ||
              e.event.method === 'StakingElection' ||
              e.event.method === 'Reward')) ||
          (e.event.section === 'offences' && e.event.method === 'Offence') ||
          (e.event.section === 'imonline' && e.event.method === 'SomeOffline'),
      )
    ) {
      setLatestStakingEventBlockHash(subscribedEventRecords.blockHash);
    }
  }, [subscribedEventRecords]);

  const contextValue = useMemo(
    () => ({
      eraStatus,
      setEraStatus,
      stakingAccountInfo,
      setStakingAccountInfo,
      stakingInfo,
      setStakingInfo,
      operators,
      operatorInfo,
      setOperatorInfo,
      latestStakingEventBlockHash,
      shouldRefetch,
      setShouldRefetch,
      refetchAccountInfo,
    }),
    [
      eraStatus,
      stakingAccountInfo,
      stakingInfo,
      operators,
      operatorInfo,
      latestStakingEventBlockHash,
      shouldRefetch,
    ],
  );

  return (
    <StakingContext.Provider value={contextValue}>
      {children}
    </StakingContext.Provider>
  );
};

export default StakingProvider;
