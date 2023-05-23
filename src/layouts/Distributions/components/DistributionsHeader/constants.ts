import { EDistributionTypes } from '../../types';

export const TABS = [
  {
    label: EDistributionTypes.PENDING,
    searchParam: { type: EDistributionTypes.PENDING },
  },
  {
    label: EDistributionTypes.HISTORICAL,
    searchParam: { type: EDistributionTypes.HISTORICAL },
  },
];
