import styled from 'styled-components';

export const StyledExpandableOperatorList = styled.div`
  // no styles
`;

export const StyledOperatorList = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: 300px;
  gap: 10px;
  padding: 10px 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: ${({ theme }) => `0px 15px 25px ${theme.colors.shadow},
    0px 5px 10px ${theme.colors.shadow}`};
  border-radius: 12px;
  max-width: 450px;
  overflow-y: auto;
`;

export const OperatorEntry = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledExpandable = styled.div<{
  expanded: boolean;
}>`
  display: flex;
  flex-direction: row;
  align-items: center;
  pointer-events: none;

  & > span.clickable-content {
    cursor: pointer;
    display: flex;
    align-items: center;
    pointer-events: auto;
  }

  & div {
    transition: transform 250ms ease-out;
    ${({ expanded }) =>
      expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const IconWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 20px;
`;

export const Label = styled.span`
  font-weight: bold;
`;
