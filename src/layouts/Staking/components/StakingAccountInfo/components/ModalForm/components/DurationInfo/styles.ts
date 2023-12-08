import styled from 'styled-components';

export const StyledDurationContainer = styled.div`
  display: flex;
  padding: 16px;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  color: ${({ theme }) => theme.colors.textSecondary};

  .skeleton-wrapper {
    max-width: 100px;
  }
`;

export const StyledDuration = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
`;

export const StyledLabel = styled.span`
  display: flex;
`;
