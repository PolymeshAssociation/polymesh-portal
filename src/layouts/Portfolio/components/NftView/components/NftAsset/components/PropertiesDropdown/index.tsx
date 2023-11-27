import { useState } from 'react';
import { Icon } from '~/components';
import { INftArgs, EInfoType } from '../../constants';
import {
  StyledInfoItem,
  StyledInfoItemHeader,
  StyledInfoBlockWrap,
  StyledInfoBlock,
  StyledInfoBlockItem,
  StyledInfoBlockHead,
  StyledInfoBlockDescription,
  StyledInfoItemLabel,
  StyledInfoItemLabelWrap,
} from '../../styles';

interface IPropertiesDropdownProps {
  type: EInfoType;
  args: INftArgs[];
}

export const PropertiesDropdown: React.FC<IPropertiesDropdownProps> = ({
  type,
  args,
}) => {
  const [expandedArgs, setExpandedArgs] = useState(false);
  const toggleExpandedArgs = () => setExpandedArgs((prev) => !prev);
  return (
    <StyledInfoItem>
      <StyledInfoItemHeader
        onClick={toggleExpandedArgs}
        $expanded={expandedArgs}
      >
        <StyledInfoItemLabelWrap>
          Properties
          <StyledInfoItemLabel>{type}</StyledInfoItemLabel>
        </StyledInfoItemLabelWrap>
        <Icon name="ExpandIcon" size="24px" className="expand-icon" />
      </StyledInfoItemHeader>
      {expandedArgs && (
        <StyledInfoBlockWrap>
          <StyledInfoBlock>
            {args?.length &&
              args.map((arg) => (
                <StyledInfoBlockItem key={arg.metaKey}>
                  <StyledInfoBlockHead>{arg.metaKey}</StyledInfoBlockHead>
                  <StyledInfoBlockDescription>
                    {arg.metaValue}
                  </StyledInfoBlockDescription>
                </StyledInfoBlockItem>
              ))}
          </StyledInfoBlock>
        </StyledInfoBlockWrap>
      )}
    </StyledInfoItem>
  );
};
