import { isHex, isAscii, hexToString } from '@polkadot/util';

export const isPrimitive = (value: string | number | null | undefined) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'undefined' ||
  value === null;

export const toAscii = (value: string) => {
  return value.replace(/(00)+$/, '');
};

export const parseValue = (value: string | number | null | undefined) => {
  if (isHex(value)) {
    const hexString = toAscii(value);
    if (isAscii(hexString)) {
      return hexToString(hexString);
    }
  }
  if (value === null || value === undefined) {
    return '';
  }
  return value;
};

export function convertIfNameValue(obj: object): object {
  if (
    typeof obj === 'object' &&
    obj !== null &&
    'name' in obj &&
    'value' in obj &&
    typeof obj.name === 'string'
  ) {
    const { name, value } = obj;
    return { [name]: value };
  }
  return obj;
}
