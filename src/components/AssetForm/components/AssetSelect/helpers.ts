export const validateAssetInputField = (
  inputValue: string,
  availableAmount: number,
  isDivisible: boolean,
) => {
  const amount = Number(inputValue);
  let error = '';

  if (Number.isNaN(amount)) {
    error = 'Amount must be a number';
  } else if (!inputValue) {
    error = 'Amount is required';
  } else if (amount <= 0) {
    error = 'Amount must be greater than zero';
  } else if (amount > availableAmount) {
    error = 'Insufficient balance';
  } else if (!isDivisible && inputValue.indexOf('.') !== -1) {
    error = 'Asset does not allow decimal places';
  } else if (
    inputValue.indexOf('.') !== -1 &&
    inputValue.substring(inputValue.indexOf('.') + 1).length > 6
  ) {
    error = 'Amount must have at most 6 decimal places';
  }

  return error;
};
