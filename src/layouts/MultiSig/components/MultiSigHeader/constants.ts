import { EMultiSigTypes } from '../../types';

export const TABS = [
  {
    label: EMultiSigTypes.PENDING,
    searchParam: { type: EMultiSigTypes.PENDING },
  },
  {
    label: EMultiSigTypes.HISTORICAL,
    searchParam: { type: EMultiSigTypes.HISTORICAL },
  },
];
