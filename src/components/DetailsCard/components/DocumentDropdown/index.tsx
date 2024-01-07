import { useState } from 'react';
import { AssetDocument } from '@polymeshassociation/polymesh-sdk/types';
import { formatKey } from '~/helpers/formatters';
import { getDateTime } from '../../helpers';
import { Icon } from '~/components';
import { PropertiesItem } from '../PropertiesItem';
import {
  StyledInfoBlock,
  StyledInfoBlockItem,
  StyledInfoBlockHead,
  StyledInfoHeaderWrap,
} from '../../styles';

interface IDocumentDropdownProps {
  document: AssetDocument;
}

export const DocumentDropdown: React.FC<IDocumentDropdownProps> = ({
  document,
}) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpanded = () => setExpanded((prev) => !prev);

  return (
    <StyledInfoBlock>
      <StyledInfoBlockItem>
        <StyledInfoHeaderWrap $expanded={expanded}>
          <StyledInfoBlockHead>Name</StyledInfoBlockHead>
          <div onClick={toggleExpanded} role="presentation">
            <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          </div>
        </StyledInfoHeaderWrap>
        {document.name}
      </StyledInfoBlockItem>
      {expanded && (
        <>
          {document.type && (
            <PropertiesItem propKey="Type" propValue={document.type} />
          )}
          {document.filedAt && (
            <PropertiesItem
              propKey="Filed At"
              propValue={getDateTime(document.filedAt as Date)}
            />
          )}
          {document.contentHash && (
            <PropertiesItem
              propKey="Content Hash"
              propValue={formatKey(document.contentHash as string)}
              propCopy={document.contentHash}
              isPink
            />
          )}
          {document.uri && (
            <PropertiesItem
              propKey="Uri"
              propValue={document.uri}
              propUrl={document.uri}
              isPink
            />
          )}
        </>
      )}
    </StyledInfoBlock>
  );
};
