import { balanceToBigNumber } from '@polymeshassociation/polymesh-sdk/utils/conversion';
import {
  IMovementQueryResponse,
  ITransferQueryResponse,
  IIdData,
  ITransactionItem,
  IMovementItem,
} from './constants';
import { toParsedDateTime } from '~/helpers/dateTime';
import { IAddress } from '~/constants/queries/types';

export const getPortfolioNumber = (
  identityId: string | undefined,
  portfolioId: string | null,
) => {
  if (!identityId) return '';
  const portfolioNumber = portfolioId ? Number(portfolioId) : '';

  return `${identityId}/${Number.isNaN(portfolioNumber) ? 0 : portfolioNumber}`;
};

export const parseMovements = (dataFromQuery: IMovementQueryResponse) => {
  return (
    (dataFromQuery.portfolioMovements.nodes.map(
      ({ id, amount, assetId, from, to, createdBlock }) => ({
        movementId: id.replace('/', '-'),
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        amount: balanceToBigNumber(amount).toString(),
        asset: assetId,
        dateTime: toParsedDateTime(createdBlock.datetime),
        from: from.name || 'Default',
        to: to.name || 'Default',
      }),
    ) as IMovementItem[]) || []
  );
};

export const parseTransfers = (dataFromQuery: ITransferQueryResponse) => {
  return (
    (dataFromQuery.events.nodes.map(
      ({ id, blockId, extrinsicIdx, block, attributes }) => {
        const [
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          { value: caller },
          { value: asset },
          { value: from },
          { value: to },
          { value: amount },
        ] = attributes;
        return {
          id: {
            eventId: id.replace('/', '-'),
            blockId: blockId.toString(),
            extrinsicIdx,
          },
          dateTime: toParsedDateTime(block.datetime),
          from: (from as IAddress).did,
          to: (to as IAddress).did,
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          amount: balanceToBigNumber(amount).toString(),
          asset,
        };
      },
    ) as ITransactionItem[]) || []
  );
};

export const createTokenActivityLink = (data: IIdData | undefined) => {
  if (!data) return '';

  if (!data.extrinsicIdx) {
    return `${import.meta.env.VITE_SUBSCAN_URL}block/${
      data.blockId
    }?tab=event&&event=${data.eventId}`;
  }

  return `${import.meta.env.VITE_SUBSCAN_URL}extrinsic/${data.blockId}-${
    data.extrinsicIdx
  }?event=${data.eventId}`;
};
