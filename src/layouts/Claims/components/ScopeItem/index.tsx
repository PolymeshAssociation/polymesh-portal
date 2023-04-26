import { Scope } from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { stringToColor } from '~/helpers/formatters';
import {
  StyledActionsWrapper,
  StyledIconWrapper,
  StyledScopeInfo,
  StyledScopeItem,
  StyledScopeLabel,
  StyledScopeWrapper,
  StyledSort,
} from './styles';

interface IScopeItemProps {
  scope: Scope;
}

export const ScopeItem: React.FC<IScopeItemProps> = ({ scope }) => {
  const [scopeExpanded, setScopeExpanded] = useState(false);
  return (
    <StyledScopeItem key={scope.value}>
      <StyledScopeWrapper>
        <StyledScopeInfo>
          Scope - {scope.type}
          <StyledScopeLabel>
            {scope.type === 'Ticker' && (
              <StyledIconWrapper color={stringToColor(scope.value)}>
                <Icon name="Coins" size="12px" />
              </StyledIconWrapper>
            )}
            {scope.value}
          </StyledScopeLabel>
        </StyledScopeInfo>
        <StyledActionsWrapper expanded={scopeExpanded}>
          <StyledSort>Sort by:</StyledSort>
          <Button
            variant="secondary"
            onClick={() => setScopeExpanded((prev) => !prev)}
          >
            <Icon name="ExpandIcon" size="24px" className="expand-icon" />
            Details
          </Button>
        </StyledActionsWrapper>
      </StyledScopeWrapper>
    </StyledScopeItem>
  );
};
