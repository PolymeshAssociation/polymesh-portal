import { gql } from '@apollo/client';

export const getAssetTransferEvents = gql`
  query transferEvents($did: String!) {
    events(
      orderBy: BLOCK_ID_DESC
      filter: {
        moduleId: { equalTo: asset }
        eventId: { equalTo: Transfer }
        attributes: { contains: [{ value: { did: $did } }] }
      }
    ) {
      nodes {
        id
        blockId
        moduleId
        eventId
        attributes
        block {
          datetime
        }
        extrinsicIdx
        transferTo
      }
    }
  }
`;

export const getExtrinsicTimestamp = gql`
  query extrinsics($id: String!) {
    extrinsics(filter: { id: { equalTo: $id } }) {
      nodes {
        block {
          datetime
        }
      }
    }
  }
`;
