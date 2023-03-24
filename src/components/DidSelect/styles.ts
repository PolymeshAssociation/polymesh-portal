import styled from 'styled-components';

export const StyledSelectWrapper = styled.div`
  position: relative;
  cursor: pointer;
  flex-grow: 1;
  padding: 7px 28px 7px 8px;
  background-color: rgba(255, 255, 255, 0.24);
  border-radius: 32px;
`;

export const StyledSelect = styled.div<{ expanded: boolean }>`
  max-width: 95%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;

  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.dashboardBackground};
  text-align: center;

  & div {
    right: 8px;
    color: ${({ theme }) => theme.colors.dashboardBackground};
    transition: transform 250ms ease-out;
    ${({ expanded }) =>
      expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  top: 110%;
  left: 0;
  width: 100%;
  overflow-y: scroll;
  max-height: 300px;
  gap: 10px;
  padding: 10px 8px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 15px 25px rgba(30, 30, 30, 0.15),
    0px 5px 10px rgba(30, 30, 30, 0.05);
  border-radius: 12px;
  text-align: center;
  z-index: 1;
`;

export const StyledInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;
  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
`;

export const StyledLabel = styled.label<{ selected: boolean }>`
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding: 12px 16px;
  border-radius: 62px;
  font-size: 14px;
  ${({ selected }) => (selected ? `background-color: #ffebf1;` : '')}
  cursor: pointer;
  transition: background-color 250ms ease-out;
  &:hover {
    background-color: #ffebf1;
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
`;
