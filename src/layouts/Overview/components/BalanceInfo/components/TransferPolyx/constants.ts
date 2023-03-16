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
    label: 'Memo',
    id: INPUT_NAMES.MEMO,
    placeholder:
      'Enter a memo for this transfer. Remember that this will be public.',
  },
];

export const createFormConfig = ({ maxAmount }) => ({
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
        .required('This field is required')
        .positive()
        .lessThan(maxAmount, 'Insufficient balance'),

      [INPUT_NAMES.TO]: yup.string().required('This field is required'),
      [INPUT_NAMES.MEMO]: yup.string(),
    }),
  ),
});
