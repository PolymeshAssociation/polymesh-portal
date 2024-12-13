import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { encodeAddress } from '@polkadot/util-crypto';

// Generic utility function to format any string with ellipsis
export const formatStringWithEllipsis = (
  text: string | undefined | null,
  startChars = 6,
  endChars = 4,
): string => {
  if (!text) return '';
  const formattedStartChars = Math.max(3, startChars);
  const formattedEndChars = Math.max(3, endChars);
  if (startChars + endChars >= text.length) return text;
  return `${text.slice(0, formattedStartChars)}...${text.slice(
    text.length - formattedEndChars,
  )}`;
};

export const formatDid = (
  did: string | undefined | null,
  startChars = 6,
  endChars = 4,
) => {
  return formatStringWithEllipsis(did, startChars, endChars);
};

export const formatKey = (
  did: string | undefined | null,
  startChars = 5,
  endChars = 5,
) => {
  return formatStringWithEllipsis(did, startChars, endChars);
};

export const formatUuid = (
  did: string | undefined | null,
  startChars = 8,
  endChars = 4,
) => {
  return formatStringWithEllipsis(did, startChars, endChars);
};

export const formatBalance = (balance: string | number, decimals = 6) => {
  return Number(balance).toLocaleString(undefined, {
    maximumFractionDigits: decimals,
  });
};

export const stringToColor = (str: string) => {
  let hash = 0;
  for (let i = 0; i < str.length; i += 1) {
    // eslint-disable-next-line no-bitwise
    hash = str.charCodeAt(i) + ((hash << 2) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i += 1) {
    // eslint-disable-next-line no-bitwise
    const value = (hash >> (i * 3)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
};

export function splitCamelCase(text: string): string {
  // Don't split if the string already has spaces or is uppercase
  if (/\s/.test(text) || text === text.toUpperCase()) {
    return text;
  }

  // Regex to identify camelCase or UpperCamelCase
  // Note: this function will also split by non alpha numeric characters e.g. underscore
  const match = text.match(/([a-z0-9]+|[A-Z][a-z0-9]*)/g);

  if (match) {
    return match.join(' ');
  }

  return text;
}

export const splitByUnderscore = (text: string) => {
  return text.split('_').join(' ');
};

export const truncateText = (
  text: string | undefined | null,
  maxLength: number,
): string => {
  if (!text) return '';
  if (text.length <= maxLength) {
    return text;
  }
  return `${text.slice(0, maxLength)}...`;
};

export const formatMillisecondsToTime = (
  milliseconds?: number,
): string | null => {
  if (milliseconds === undefined || milliseconds === null) return null;

  const totalSeconds = Math.floor(milliseconds / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = Math.floor(totalSeconds % 60);

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''} ${hours} hr${
      hours !== 1 ? 's' : ''
    }`;
  }
  if (hours > 0) {
    return `${hours} hr${hours !== 1 ? 's' : ''} ${minutes} min${
      minutes !== 1 ? 's' : ''
    }`;
  }
  return `${minutes} min${minutes !== 1 ? 's' : ''} ${seconds} sec${
    seconds !== 1 ? 's' : ''
  }`;
};

export const accountKeyToAddress = (key: string, ss58Prefix: BigNumber) => {
  let accountKey = key;
  if (!accountKey.startsWith('0x')) {
    accountKey = `0x${accountKey}`;
  }
  return encodeAddress(accountKey, ss58Prefix.toNumber());
};

export const capitalizeFirstLetter = (text: string) => {
  const capitalizedString = text
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  return capitalizedString;
};

export const padTicker = (inputString: string): string => {
  const maxTickerLength = 12;

  if (inputString.length >= maxTickerLength) {
    return inputString;
  }

  const nullsNeeded = maxTickerLength - inputString.length;
  const paddedString = inputString + '\0'.repeat(nullsNeeded);

  return paddedString;
};

export const removeHexPrefix = (text: string) => {
  return text.startsWith('0x') ? text.substring(2) : text;
};

export function padWithLeadingZeros(id: string): string {
  return id.padStart(10, '0');
}

export function removeLeadingZeros(id: string): string {
  return id.replace(/^0+/, '');
}
