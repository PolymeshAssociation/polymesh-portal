import { BigNumber } from '@polymeshassociation/polymesh-sdk';

export interface IEraStatus {
  activeEra: { index: BigNumber | null; start: BigNumber | null };
  currentEraIndex: BigNumber | null;
  currentSessionIndex: BigNumber | null;
  epochIndex: BigNumber | null;
  eraDurationBlocks: BigNumber | null;
  eraDurationTime: BigNumber | null;
  eraTimeRemaining: BigNumber | null;
  epochDurationBlocks: BigNumber | null;
  epochDurationTime: BigNumber | null;
  epochTimeRemaining: BigNumber | null;
  eraProgress: BigNumber | null;
  epochProgress: BigNumber | null;
  eraSessionNumber: BigNumber | null;
  sessionsPerEra: BigNumber | null;
  timeToNextElection: BigNumber | null;
  electionInProgress: 'Open' | 'Closed' | null;
  getTimeUntilEraStart: (
    targetEra: BigNumber,
    timeToPlanned?: boolean,
  ) => BigNumber | null;
}
export interface IStakingAccountInfo {
  stakingAccountIsLoading: boolean;
  isStash: boolean;
  isController: boolean;
  stashAddress: string | null;
  controllerAddress: string | null;
  totalBonded: BigNumber | null;
  amountActive: BigNumber | null;
  amountUnbonding: BigNumber | null;
  unbondingLots: { amount: BigNumber; era: BigNumber; id: string }[];
  amountAvailableToWithdraw: BigNumber | null;
  rewardDestination: string | null;
  nominations: string[];
  activelyStakedOperators: {
    operatorAccount: string;
    value: BigNumber;
  }[];
  currentEraStakedOperators: {
    operatorAccount: string;
    value: BigNumber;
  }[];
  nominatedEra: BigNumber | null;
}

export interface IStakingInfo {
  apr: BigNumber | null;
  apy: BigNumber | null;
  inflation: BigNumber | null;
  percentStaked: BigNumber | null;
  totalIssuance: BigNumber | null;
  totalStaked: BigNumber | null;
}

interface Preferences {
  commission: BigNumber;
  blocked: boolean;
}

export type OperatorPrefObject = Record<string, Preferences>;

export type OperatorLastSlashObject = Record<string, BigNumber>;

export interface IEraStakers {
  operatorAccount: string;
  totalStaked: BigNumber;
  ownStaked: BigNumber;
  others: Record<string, BigNumber>;
}

export interface IOperatorInfo {
  activeSessionOperators: string[];
  maxOperatorCount: BigNumber | null;
  operatorCount: number | null;
  waitingOperators: string[];
  operatorsWithCommission: OperatorPrefObject;
  operatorStakers: {
    activeEra: IEraStakers[];
    currentEra: IEraStakers[];
  };
  operatorLastSlashRecord: OperatorLastSlashObject;
  operatorNames: Record<string, string>;
}

export interface IStakingContext {
  eraStatus: IEraStatus;
  setEraStatus: (eraStatus: IEraStatus) => void;
  stakingAccountInfo: IStakingAccountInfo;
  setStakingAccountInfo: (stakingAccountInfo: IStakingAccountInfo) => void;
  stakingInfo: IStakingInfo;
  setStakingInfo: (stakingInfo: IStakingInfo) => void;
  operators: Record<string, { name: string }>;
  operatorInfo: IOperatorInfo;
  setOperatorInfo: (operatorInfo: IOperatorInfo) => void;
  latestStakingEventBlockHash: string;
  shouldRefetch: boolean;
  setShouldRefetch: React.Dispatch<React.SetStateAction<boolean>>;
  refetchAccountInfo: () => void;
}

export const initialEraStatus: IEraStatus = {
  activeEra: { index: null, start: null },
  currentEraIndex: null,
  currentSessionIndex: null,
  epochIndex: null,
  eraDurationBlocks: null,
  eraDurationTime: null,
  eraTimeRemaining: null,
  epochDurationBlocks: null,
  epochDurationTime: null,
  epochTimeRemaining: null,
  eraProgress: null,
  epochProgress: null,
  eraSessionNumber: null,
  sessionsPerEra: null,
  timeToNextElection: null,
  electionInProgress: null,
  getTimeUntilEraStart: () => null,
};

export const initialStakingAccountInfo: IStakingAccountInfo = {
  stakingAccountIsLoading: false,
  isStash: false,
  isController: false,
  stashAddress: null,
  controllerAddress: null,
  totalBonded: null,
  amountActive: null,
  amountUnbonding: null,
  unbondingLots: [],
  amountAvailableToWithdraw: null,
  rewardDestination: null,
  nominations: [],
  activelyStakedOperators: [],
  currentEraStakedOperators: [],
  nominatedEra: null,
};

export const initialStakingInfo: IStakingInfo = {
  apr: null,
  apy: null,
  inflation: null,
  percentStaked: null,
  totalIssuance: null,
  totalStaked: null,
};

export const initialOperatorInfo: IOperatorInfo = {
  activeSessionOperators: [],
  maxOperatorCount: null,
  operatorCount: null,
  waitingOperators: [],
  operatorsWithCommission: {},
  operatorStakers: {
    activeEra: [],
    currentEra: [],
  },
  operatorLastSlashRecord: {},
  operatorNames: {},
};

export const initialState: IStakingContext = {
  eraStatus: initialEraStatus,
  setEraStatus: () => {},
  stakingAccountInfo: initialStakingAccountInfo,
  setStakingAccountInfo: () => {},
  stakingInfo: initialStakingInfo,
  setStakingInfo: () => {},
  operators: {},
  operatorInfo: initialOperatorInfo,
  setOperatorInfo: () => {},
  latestStakingEventBlockHash: '',
  shouldRefetch: false,
  setShouldRefetch: () => {},
  refetchAccountInfo: () => {},
};
