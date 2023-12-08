import { PAYMENT_DESTINATION } from '../../constants';

export const INPUT_NAMES = {
  CONTROLLER: 'controller',
  AMOUNT: 'amount',
  NOMINATORS: 'nominators',
  DESTINATION: 'destination',
  SPECIFIED_ACCOUNT: 'specifiedAccount',
} as const;

export interface IFieldValues {
  controller: string;
  amount: number;
  nominators: string[];
  destination: keyof typeof PAYMENT_DESTINATION;
  specifiedAccount: string;
}

export const NOMINATIONS_MAX_LENGTH = 16;
