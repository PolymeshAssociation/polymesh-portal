import styled from 'styled-components';

export const StyledLeg = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledInfoValue = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: #170087;
  border-radius: 100px;
  color: #ffffff;
  font-weight: 500;
  font-size: 12px;
`;
