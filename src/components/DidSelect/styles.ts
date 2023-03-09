import styled from 'styled-components';

export const StyledSelectWrapper = styled.div`
  position: relative;
  cursor: pointer;
  flex-grow: 1;
  padding: 7px 28px 7px 8px;
  background-color: rgba(255, 255, 255, 0.24);
  ${({ expanded }) =>
    expanded
      ? `border-top-left-radius: 16px;
            border-top-right-radius: 16px;`
      : `border-radius: 32px;`}
`;

export const StyledSelect = styled.div`
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
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  overflow: scroll;
  top: 100%;
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.24);
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
  text-align: center;
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

export const StyledLabel = styled.label`
  font-size: 12px;
  padding: 6px;
  color: #ffffff;
  cursor: pointer;
  ${({ selected }) => (selected ? `font-weight: 500;` : '')}

  transition: background-color 250ms ease-out;
  &:hover {
    background-color: #ff2e72bb;
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
