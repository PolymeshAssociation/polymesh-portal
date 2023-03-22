import styled from 'styled-components';

export const StyledAccountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const IconWrapper = styled.div<{ size?: string }>`
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

export const StyledKeysList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const StyledKeyData = styled.li`
  position: relative;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const KeyDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin-top: 10px; */

  & .key-wrapper {
    flex-grow: initial;
    padding: 0 12px;
  }
`;

export const StyledBalance = styled.p`
  margin-left: auto;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  & span {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledLabel = styled.div<{ isPrimary?: boolean }>`
  /* position: absolute;
  top: 24px;
  right: 24px; */
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  ${({ isPrimary }) =>
    isPrimary
      ? `
    border: 1px solid #FAD1DC;
    color: #EC4673;
  `
      : `
    border: 1px solid #DCD3FF;
    color: #170087;
  `}
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;
