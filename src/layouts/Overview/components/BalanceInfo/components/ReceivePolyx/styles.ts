import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

export const TextWithDelimeter = styled.p`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;

  &::before,
  &::after {
    content: '';
    height: 1px;
    width: 200px;
    flex-grow: 1;
    background-color: #e6e6e6;
  }
`;

export const StyledAddressWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  gap: 4px;
  padding: 0 12px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  font-size: 12px;
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;

export const QRWrapper = styled.div`
  padding: 24px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  border-radius: 24px;
`;
