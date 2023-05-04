import styled from 'styled-components';

export const StyledWrapper = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledDescription = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: #ffebf1;
  border-radius: 50%;
  color: #ff2e72;
`;

export const StyledValue = styled.div`
  color: #ff2e72;
  font-weight: 500;
`;
