import { isHex, isAscii, hexToString } from '@polkadot/util';

export const isPrimitive = (value: string | number | undefined) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'undefined' ||
  value === null;

export const toAscii = (value: string) => {
  return value.replace(/00/g, '');
};

export const parseValue = (value: string | number | undefined) => {
  if (isHex(value)) {
    const hexString = toAscii(value);
    if (isAscii(hexString)) {
      return hexToString(value);
    }
  }
  return value;
};
