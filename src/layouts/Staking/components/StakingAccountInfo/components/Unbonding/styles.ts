import styled from 'styled-components';

export const StyledUnbonding = styled.div`
  .toggle-button {
    cursor: pointer;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  & .unbonding {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }
  & .unbonding-lots {
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
    max-width: 400px;
    overflow-y: auto;
  }
`;

export const ExpandedItem = styled.div`
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
  cursor: pointer;
  pointer-events: auto;

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
`;

export const Label = styled.span`
  font-weight: bold;
  min-width: 160px;
`;
