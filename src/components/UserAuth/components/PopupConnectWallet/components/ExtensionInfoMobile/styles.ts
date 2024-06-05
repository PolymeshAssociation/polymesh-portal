import styled from 'styled-components';

export const StyledWalletName = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 32px;
`;

export const StyledExtensionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
`;

export const StyledExtensionInfoItem = styled.div`
  display: flex;
  gap: 8px;
`;
export const StyledExtensionItemNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 100%;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  font-weight: 700;
`;

export const StyledCopyContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  & > p {
    color: ${({ theme }) => theme.colors.textPink};
  }
`;

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  @media screen and (max-width: 540px) {
    justify-content: center;
    & > button {
      width: 100%;
    }
  }
`;
