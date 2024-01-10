import { useState } from 'react';
import { Icon } from '~/components';
import {
  StyledInfoItem,
  StyledInfoItemHeader,
  StyledInfoBlockWrap,
  StyledInfoBlock,
  StyledInfoItemLabel,
  StyledInfoItemLabelWrap,
} from '../../styles';

interface IPropertiesDropdownProps {
  label: string;
  subLabel?: string;
  expanded?: boolean;
  children: React.ReactNode;
  removeBlockBackground?: boolean;
}

export const PropertiesDropdown: React.FC<IPropertiesDropdownProps> = ({
  label,
  subLabel,
  expanded = false,
  children,
  removeBlockBackground,
}) => {
  const [expandedArgs, setExpandedArgs] = useState(expanded);

  const toggleExpandedArgs = () => setExpandedArgs((prev) => !prev);

  return (
    <StyledInfoItem>
      <StyledInfoItemHeader
        onClick={toggleExpandedArgs}
        $expanded={expandedArgs}
      >
        <StyledInfoItemLabelWrap>
          {label}
          {subLabel && <StyledInfoItemLabel>{subLabel}</StyledInfoItemLabel>}
        </StyledInfoItemLabelWrap>
        <Icon name="ExpandIcon" size="24px" className="expand-icon" />
      </StyledInfoItemHeader>
      {expandedArgs && (
        <StyledInfoBlockWrap>
          <StyledInfoBlock $withoutBackground={removeBlockBackground}>
            {children}
          </StyledInfoBlock>
        </StyledInfoBlockWrap>
      )}
    </StyledInfoItem>
  );
};
