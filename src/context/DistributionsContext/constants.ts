import { DistributionWithDetails } from '@polymeshassociation/polymesh-sdk/types';

export interface IDistributionsContext {
  pendingDistributions: DistributionWithDetails[];
  distributionsLoading: boolean;
  refreshDistributions: () => void;
}

export const initialState = {
  pendingDistributions: [],
  distributionsLoading: false,
  refreshDistributions: () => {},
};
