import styled from 'styled-components';

export const StyledAccountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.landingBackground};

  & .id-icon {
    color: #ff2e72;
  }
  & .copy-icon {
    color: #727272;
  }
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & .did-wrapper {
    flex-grow: 1;
  }
`;

export const StyledDidWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledDidThumb = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const StyledVerifiedLabel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  width: 54px;
  height: 16px;
  border-radius: 4px;
  background-color: #d4f7e7;
  color: #00aa5e;
  font-size: 12px;
`;

export const StyledBottomData = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  & span {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const StyledBottomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Separator = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e6e6e6;
`;
