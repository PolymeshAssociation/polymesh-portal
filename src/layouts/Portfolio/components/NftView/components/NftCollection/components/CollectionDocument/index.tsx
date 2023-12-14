import { useState } from 'react';
import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import { formatKey } from '~/helpers/formatters';
import { getDateTime } from '../../helpers';
import { Icon, CopyToClipboard } from '~/components';
import {
  StyledInfoBlock,
  StyledInfoBlockItem,
  StyledInfoBlockHead,
  StyledInfoBlockPink,
  StyledInfoBlockDescription,
} from '../../../NftAsset/styles';
import { StyledInfoHeaderWrap } from '../../styles';

interface ICollectionDocumentProps {
  document: AssetDocument;
}

export const CollectionDocument: React.FC<ICollectionDocumentProps> = ({
  document,
}) => {
  const [expanded, setExpanded] = useState(false);

  const handleDocClick = (url: string) => {
    window.open(url, '_blank');
  };

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <StyledInfoBlock>
      {document.name && (
        <StyledInfoBlockItem>
          <StyledInfoHeaderWrap $expanded={expanded}>
            <StyledInfoBlockHead>Name</StyledInfoBlockHead>
            <div onClick={toggleExpanded}>
              <Icon name="ExpandIcon" size="24px" className="expand-icon" />
            </div>
          </StyledInfoHeaderWrap>
          {document.name}
        </StyledInfoBlockItem>
      )}
      {expanded && (
        <>
          {document.type && (
            <StyledInfoBlockItem>
              <StyledInfoBlockHead>Type</StyledInfoBlockHead>
              {document.type}
            </StyledInfoBlockItem>
          )}
          {document.filedAt && (
            <StyledInfoBlockItem>
              <StyledInfoBlockHead>Filed At</StyledInfoBlockHead>
              {getDateTime(document.filedAt as Date)}
            </StyledInfoBlockItem>
          )}
          {document.contentHash && (
            <StyledInfoBlockItem>
              <StyledInfoBlockHead>Content Hash</StyledInfoBlockHead>
              <StyledInfoBlockPink>
                {formatKey(document.contentHash as string)}
                <CopyToClipboard value={document.contentHash} />
              </StyledInfoBlockPink>
            </StyledInfoBlockItem>
          )}
          {document.uri && (
            <StyledInfoBlockItem>
              <StyledInfoBlockHead>Uri</StyledInfoBlockHead>
              <StyledInfoBlockPink onClick={() => handleDocClick(document.uri)}>
                <StyledInfoBlockDescription style={{ cursor: 'pointer' }}>
                  {document.uri}
                </StyledInfoBlockDescription>
              </StyledInfoBlockPink>
            </StyledInfoBlockItem>
          )}
        </>
      )}
    </StyledInfoBlock>
  );
};
