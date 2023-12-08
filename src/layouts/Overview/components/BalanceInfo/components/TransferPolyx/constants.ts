import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';

const INPUT_NAMES = {
  AMOUNT: 'amount',
  TO: 'to',
  MEMO: 'memo',
};

export const TRANSFER_INPUTS = [
  {
    label: 'Amount',
    id: INPUT_NAMES.AMOUNT,
    placeholder: 'Enter Amount',
    withCaption: true,
    withButton: true,
  },
  {
    label: 'Send to',
    id: INPUT_NAMES.TO,
    placeholder: 'Enter Address',
  },
  {
    label: 'Memo (Optional - this will be public)',
    id: INPUT_NAMES.MEMO,
    placeholder: 'Enter a memo for this transfer',
  },
];

interface IFormConfigData {
  maxAmount: number;
  selectedAccount: string;
  checkAddressValidity: (address: string) => boolean;
}

export const createFormConfig = (configData: IFormConfigData) => {
  const { maxAmount, selectedAccount, checkAddressValidity } = configData;
  return {
    mode: 'onTouched',
    defaultValues: {
      [INPUT_NAMES.AMOUNT]: '',
      [INPUT_NAMES.TO]: '',
      [INPUT_NAMES.MEMO]: '',
    },
    resolver: yupResolver(
      yup.object().shape({
        [INPUT_NAMES.AMOUNT]: yup
          .number()
          .typeError('Amount must be a number')
          .required('Amount is required')
          .positive()
          .lessThan(maxAmount, 'Insufficient balance')
          .transform((value, originalValue) =>
            typeof originalValue === 'string' && originalValue.trim() === ''
              ? undefined
              : Number(value),
          )
          .test(
            'is-decimal',
            'Amount must have at most 6 decimal places',
            (value) =>
              value ? /^-?\d+(\.\d{1,6})?$/.test(value.toString()) : true,
          ),

        [INPUT_NAMES.TO]: yup
          .string()
          .required('A valid address is required')
          .test(
            'is-equal-to-selected',
            'Sender and receiver addresses must be different',
            (value) => value !== selectedAccount,
          )
          .test(
            'is-valid-address',
            'Address must be valid SS58 format',
            async (value) => {
              const result = checkAddressValidity(value);
              return result;
            },
          ),

        [INPUT_NAMES.MEMO]: yup
          .string()
          .max(32, 'Memo must be 32 characters or less')
          .nullable(),
      }),
    ),
  } as const;
};
