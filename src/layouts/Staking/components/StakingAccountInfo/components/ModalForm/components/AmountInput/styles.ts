import styled from 'styled-components';

export const StyledAvailableBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const UseMaxButton = styled.button`
  position: absolute;
  top: 0;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textBlue};
`;
