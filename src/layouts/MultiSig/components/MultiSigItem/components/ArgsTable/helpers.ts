import { isHex, isAscii, hexToString } from '@polkadot/util';
import { BigNumber, Polymesh } from '@polymeshassociation/polymesh-sdk';
import { toParsedDateTime } from '~/helpers/dateTime';
import {
  capitalizeFirstLetter,
  formatBalance,
  removeHexPrefix,
  splitCamelCase,
} from '~/helpers/formatters';

export const isPrimitive = (
  value: string | number | boolean | null | undefined,
) =>
  typeof value === 'string' ||
  typeof value === 'number' ||
  typeof value === 'boolean' ||
  typeof value === 'undefined' ||
  value === null;

export const toAscii = (value: string) => {
  return value.replace(/(00)+$/, '');
};

export const parseValue = (
  value: string | number | boolean | null | undefined,
) => {
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
    Object.keys(obj).length === 2 &&
    'name' in obj &&
    'value' in obj &&
    typeof obj.name === 'string'
  ) {
    const { name, value } = obj;
    return { [name]: value };
  }
  return obj;
}

export function convertNameValueObjectsArray(args: object[]): object {
  // args should always be an object so if it is an array we process as an
  // array of name value pairs
  if (Array.isArray(args)) {
    const processedArgs = args.reduce(
      (acc: object, entry: object) => ({
        ...acc,
        ...convertIfNameValue(entry),
      }),
      {},
    );
    return processedArgs;
  }
  return args;
}

const processBalancesArgs = (
  args: object | object[],
  polyxKeysToConvert: string[],
) => {
  const processedArgs: object = args;

  if (typeof processedArgs === 'object' && !Array.isArray(processedArgs)) {
    polyxKeysToConvert.forEach((key: string) => {
      if (key in args) {
        const argAsBig = new BigNumber((args as Record<string, number>)[key]);

        if (!argAsBig.isNaN()) {
          (processedArgs as Record<string, string>)[key] = `${formatBalance(
            argAsBig.dividedBy(1000000).toString(),
          )} POLYX`;
        }
      }
    });
  }
  return processedArgs;
};

export function precessCallIndex(
  obj: Record<string, string>,
  polkadotApi: Polymesh['_polkadotApi'],
): object {
  if (obj.callIndex) {
    const detail = polkadotApi?.findCall(obj.callIndex);
    const { callIndex, args, ...rest } = obj;
    return {
      callndex: removeHexPrefix(obj.callIndex),
      callModule: capitalizeFirstLetter(detail?.section),
      callFunction: capitalizeFirstLetter(detail?.method),
      callArgs: args,
      ...rest,
    };
  }
  return obj;
}

function parseExpiry(obj: Record<string, string | number>) {
  const objCopy: Record<string, string | number> = { ...obj };

  if (objCopy.expiry !== undefined) {
    if (objCopy.expiry === null) {
      objCopy.expiry = 'Never';
    }

    const expiry = new Date(new BigNumber(objCopy.expiry).toNumber());
    if (!Number.isNaN(expiry.getTime())) {
      objCopy.expiry = toParsedDateTime(expiry);
    }
  }

  return objCopy;
}

export function processCallParameters(
  obj: object,
  polkadotApi: Polymesh['_polkadotApi'],
): object {
  // create deep copy
  let objCopy = JSON.parse(JSON.stringify(obj));
  objCopy = precessCallIndex(objCopy, polkadotApi);

  objCopy = parseExpiry(objCopy);

  const callKeys = [
    { module: 'module', call: 'call', args: 'args' },
    { module: 'callModule', call: 'callFunction', args: 'callArgs' },
    { module: 'call_module', call: 'call_function', args: 'call_args' },
  ];

  const indexOfKeys = callKeys.findIndex((entry) => {
    return objCopy[entry.module];
  });

  // The following formatting actions only run on the top level of a call
  if (indexOfKeys !== -1) {
    const moduleKey = callKeys[indexOfKeys].module;
    const callKey = callKeys[indexOfKeys].call;
    const argKey = callKeys[indexOfKeys].args;
    objCopy[moduleKey] = capitalizeFirstLetter(
      splitCamelCase(objCopy[moduleKey]),
    );
    objCopy[callKey] = capitalizeFirstLetter(splitCamelCase(objCopy[callKey]));

    // Parse arrays containing name + value pairs to objects. Subquery returns historical
    // args or historical transaction as a name value pair.
    objCopy[argKey] = convertNameValueObjectsArray(objCopy[argKey]);

    let polyxKeysToConvert: string[] = [];
    switch (objCopy[moduleKey]) {
      case 'Balances': {
        polyxKeysToConvert = ['value', 'amount', 'new_free', 'new_reserved'];
        break;
      }
      case 'Relayer': {
        polyxKeysToConvert = ['amount', 'polyx_limit'];
        break;
      }
      case 'Protocol Fee': {
        polyxKeysToConvert = ['base_fee'];
        break;
      }
      case 'Staking': {
        polyxKeysToConvert = ['value', 'max_additional', 'new_value'];
        break;
      }
      case 'Bridge': {
        polyxKeysToConvert = ['amount'];
        break;
      }
      case 'Pips': {
        polyxKeysToConvert = ['deposit'];
        break;
      }
      case 'Contracts': {
        polyxKeysToConvert = ['value', 'storage_deposit_limit'];
        break;
      }
      case 'Treasury': {
        polyxKeysToConvert = ['amount'];
        if (objCopy[callKey].toLowerCase() === 'disbursement') {
          objCopy[argKey].beneficiaries = objCopy[argKey].beneficiaries.map(
            (entry: { id: string; amount: number }) => {
              return processBalancesArgs(entry, polyxKeysToConvert);
            },
          );
          break;
        }
        break;
      }
      default:
        break;
    }

    objCopy[argKey] = processBalancesArgs(objCopy[argKey], polyxKeysToConvert);
    return objCopy;
  }

  return objCopy;
}
