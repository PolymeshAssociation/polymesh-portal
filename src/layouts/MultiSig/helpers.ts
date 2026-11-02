import {
  IMultiSigProposal,
  IRawMultiSigProposal,
} from '~/constants/queries/types';

export const parseRawMultiSigProposal = ({
  updatedEvent,
  createdEvent,
  creatorAccountId,
  approvalCount,
  proposalId,
  rejectionCount,
  status,
  votes,
}: IRawMultiSigProposal): IMultiSigProposal => ({
  updatedBlock: { blockId: updatedEvent.block.blockId },
  createdBlock: { blockId: createdEvent.block.blockId },
  creatorAccount: creatorAccountId ?? '',
  datetime: createdEvent.block.datetime,
  extrinsicIdx: createdEvent.extrinsic?.extrinsicIdx ?? 0,
  approvalCount,
  proposalId,
  rejectionCount,
  status,
  votes,
});
