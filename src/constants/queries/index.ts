import { gql } from '@apollo/client';

export const getAssetTransferEvents = gql`
  query transferEvents($did: String!) {
    events(
      orderBy: BLOCK_ID_DESC
      filter: {
        moduleId: { equalTo: asset }
        eventId: { equalTo: Transfer }
        attributes: { contains: [{ value: $did }] }
      }
    ) {
      nodes {
        id
        blockId
        moduleId
        eventId
        attributes
        createdAt
        extrinsicIdx
        transferTo
      }
    }
  }
`;
