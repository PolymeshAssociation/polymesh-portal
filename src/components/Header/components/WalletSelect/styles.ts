import styled from 'styled-components';

export const StyledSelectWrapper = styled.div`
  position: relative;
  padding-right: 16px;
  min-width: 94px;
  cursor: pointer;
`;

export const StyledSelect = styled.div`
  font-weight: 500;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;

  & div {
    transition: transform 250ms ease-out;
    ${({ expanded }) =>
      expanded ? `transform: rotate(90deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledExpandedSelect = styled.div`
  position: absolute;
  top: 120%;
  left: -5%;
  width: 105%;
  display: flex;
  flex-direction: column;
  gap: 4px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 10px;
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  overflow: scroll;
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
  padding: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  ${({ selected }) => (selected ? `font-weight: 500;` : '')}

  transition: background-color 250ms ease-out;
  &:hover {
    background-color: ${({ theme }) => theme.colors.landingBackground};
  }
`;

export const IconWrapper = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;
