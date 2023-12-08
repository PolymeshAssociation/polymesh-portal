import styled from 'styled-components';

export const StyledExpansionToggle = styled.div<{
  $expanded: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: 16px;
  cursor: pointer;
  & .expand-icon {
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;

export const StyledSelect = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $isSelected }) =>
    $isSelected ? '#FF2E72' : 'transparent'};
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? '#FF2E72' : theme.colors.textDisabled};
  color: ${({ $isSelected }) => ($isSelected ? '#FFFFFF' : 'transparent')};
  transition:
    background-color 250ms ease-out,
    color 250ms ease-out;
  cursor: pointer;
`;
export const StyledAutoStake = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
  padding-right: 16px;
`;
