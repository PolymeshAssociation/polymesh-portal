import { useState } from 'react';
import { formatDid } from '~/helpers/formatters';
import { Icon, CopyToClipboard } from '~/components';
import {
  StyledId,
  StyledInfoItem,
  StyledInfoItemHeader,
  StyledInfoBlockWrap,
  StyledInfoBlock,
  StyledInfoBlockItem,
  StyledInfoBlockHead,
  StyledInfoBlockPink,
} from '../../../NftAsset/styles';
import {
  StyledDetailsContainer,
  StyledInfoWrap,
  StyledInfoBlockContainer,
} from '../../styles';
import { ICollectionDetails } from '../../constants';
import { getDateTime } from '../../helpers';
import { CollectionDocument } from '../CollectionDocument';
import { CollectionMeta } from '../CollectionMeta';

interface ICollectionDetailsProps {
  details: ICollectionDetails;
}

export const CollectionDetails: React.FC<ICollectionDetailsProps> = ({
  details,
}) => {
  const [expandedDetails, setExpandedDetails] = useState(true);
  const [expandedDocs, setExpandedDocs] = useState(false);

  const toggleExpandedDetails = () => setExpandedDetails((prev) => !prev);
  const toggleExpandedDocs = () => setExpandedDocs((prev) => !prev);

  return (
    <StyledDetailsContainer>
      <StyledId>
        Collection ID: #{details?.collectionId}
        <CopyToClipboard value={details?.collectionId} />
      </StyledId>
      <StyledInfoWrap>
        <StyledInfoItem>
          <StyledInfoItemHeader
            onClick={toggleExpandedDetails}
            $expanded={expandedDetails}
          >
            Details
            <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          </StyledInfoItemHeader>
          {expandedDetails && (
            <StyledInfoBlockWrap>
              <StyledInfoBlock>
                <StyledInfoBlockItem>
                  <StyledInfoBlockHead>Name</StyledInfoBlockHead>
                  {details.name}
                </StyledInfoBlockItem>
                <StyledInfoBlockItem>
                  <StyledInfoBlockHead>Created At</StyledInfoBlockHead>
                  {getDateTime(details.createdAt)}
                </StyledInfoBlockItem>
                <StyledInfoBlockItem>
                  <StyledInfoBlockHead>Total supply</StyledInfoBlockHead>
                  {details.totalSupply}
                </StyledInfoBlockItem>
                <StyledInfoBlockItem>
                  <StyledInfoBlockHead>Owner</StyledInfoBlockHead>
                  <StyledInfoBlockPink>
                    {formatDid(details.owner)}
                    <CopyToClipboard value={details.owner} />
                  </StyledInfoBlockPink>
                </StyledInfoBlockItem>
                {details?.metaData?.length &&
                  details.metaData.map((meta) => (
                    <CollectionMeta key={meta.name} meta={meta} />
                  ))}
              </StyledInfoBlock>
            </StyledInfoBlockWrap>
          )}
        </StyledInfoItem>
        <StyledInfoItem>
          {details.docs?.length ? (
            <>
              <StyledInfoItemHeader
                onClick={toggleExpandedDocs}
                $expanded={expandedDocs}
              >
                Collection Documents
                <Icon name="ExpandIcon" size="24px" className="expand-icon" />
              </StyledInfoItemHeader>
              {expandedDocs && (
                <StyledInfoBlockWrap>
                  <StyledInfoBlockContainer>
                    {details.docs?.map((doc) => (
                      <CollectionDocument
                        key={doc.filedAt?.toString()}
                        document={doc}
                      />
                    ))}
                  </StyledInfoBlockContainer>
                </StyledInfoBlockWrap>
              )}
            </>
          ) : (
            <StyledInfoItemHeader $expanded={false}>
              No Collection Documents found
            </StyledInfoItemHeader>
          )}
        </StyledInfoItem>
      </StyledInfoWrap>
    </StyledDetailsContainer>
  );
};
