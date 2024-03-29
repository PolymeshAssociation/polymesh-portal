import styled from 'styled-components';
import { Button } from '~/components/UiKit';

export const StyledClaimWrapper = styled.div`
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  gap: 48px;
  padding: 24px;
  margin-top: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;

  @media screen and (max-width: 1023px) {
    flex-direction: column;
    gap: 24px;

    & button {
      width: 100%;
    }
  }
`;

export const StyledClaimItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (max-width: 1023px) {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }
`;

export const StyledDidWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const RevokeButton = styled(Button)`
  margin-left: auto;
  background: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
`;
