import styled from 'styled-components';

export const StyledCard = styled.div`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 32px;
  margin-bottom: 36px;
`;

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 36px;
  padding: 12px;
  margin-bottom: 24px;

  @media screen and (max-width: 1420px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const StyledInfoBlock = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (max-width: 1420px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

export const StyledInfoValue = styled.span`
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media screen and (max-width: 1560px) {
    font-size: 14px;
  }
`;

export const StyledAsset = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.85em;
`;

export const StyledCopyWrap = styled.div`
  display: flex;
  gap: 4px;
  align-items: center;
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  gap: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};

  & > button {
    flex-grow: 1;
  }

  @media screen and (max-width: 528px) {
    & > button {
      width: 100%;
    }
  }

  @media screen and (max-width: 1023px) {
    flex-wrap: wrap-reverse;
  }
`;
