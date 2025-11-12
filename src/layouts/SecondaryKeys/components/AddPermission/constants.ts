import { EPermissionTab, EPermissionStep } from '../../constants';

export interface IPermissionFormData {
  assets: {
    type: 'Whole' | 'These' | 'Except' | 'None';
    values: string[];
  };
  transactions: {
    type: 'Whole' | 'These' | 'None';
    values: Array<{ pallet: string; extrinsics?: string[] }>;
  };
  portfolios: {
    type: 'Whole' | 'These' | 'Except' | 'None';
    values: string[];
  };
}

export const initialPermissionState: IPermissionFormData = {
  assets: {
    type: 'Whole',
    values: [],
  },
  transactions: {
    type: 'Whole',
    values: [],
  },
  portfolios: {
    type: 'Whole',
    values: [],
  },
};
