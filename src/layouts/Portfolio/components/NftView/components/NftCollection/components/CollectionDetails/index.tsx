import { useState } from 'react';
import { formatDid, formatKey } from '~/helpers/formatters';
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
  StyledInfoBlockDescription,
} from '../../../NftAsset/styles';
import { StyledDetailsContainer, StyledInfoWrap } from '../../styles';
import { ICollectionDetails } from '../../constants';
import { getDateTime } from '../../helpers';

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

  const handleDocClick = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <StyledDetailsContainer>
      <StyledId>
        #{details.collectionId}
        <CopyToClipboard value={details.collectionId} />
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
              </StyledInfoBlock>
            </StyledInfoBlockWrap>
          )}
        </StyledInfoItem>
        <StyledInfoItem>
          {Boolean(details.docs?.length) ? (
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
                  {details.docs?.map((doc) => (
                    <StyledInfoBlock key={doc.uri}>
                      {doc.contentHash && (
                        <StyledInfoBlockItem>
                          <StyledInfoBlockHead>
                            Content Hash
                          </StyledInfoBlockHead>
                          <StyledInfoBlockPink>
                            {formatKey(doc.contentHash as string)}
                            <CopyToClipboard value={doc.contentHash} />
                          </StyledInfoBlockPink>
                        </StyledInfoBlockItem>
                      )}
                      {doc.filedAt && (
                        <StyledInfoBlockItem>
                          <StyledInfoBlockHead>Filed At</StyledInfoBlockHead>
                          {getDateTime(doc.filedAt as Date)}
                        </StyledInfoBlockItem>
                      )}
                      {doc.name && (
                        <StyledInfoBlockItem>
                          <StyledInfoBlockHead>Name</StyledInfoBlockHead>
                          {doc.name}
                        </StyledInfoBlockItem>
                      )}
                      {doc.type && (
                        <StyledInfoBlockItem>
                          <StyledInfoBlockHead>Type</StyledInfoBlockHead>
                          {doc.type}
                        </StyledInfoBlockItem>
                      )}
                      {doc.uri && (
                        <StyledInfoBlockItem>
                          <StyledInfoBlockHead>Uri</StyledInfoBlockHead>
                          <StyledInfoBlockPink
                            onClick={() => handleDocClick(doc.uri)}
                          >
                            <StyledInfoBlockDescription
                              style={{ cursor: 'pointer' }}
                            >
                              {doc.uri}
                            </StyledInfoBlockDescription>
                          </StyledInfoBlockPink>
                        </StyledInfoBlockItem>
                      )}
                    </StyledInfoBlock>
                  ))}
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
