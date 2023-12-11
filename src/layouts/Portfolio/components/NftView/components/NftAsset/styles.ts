import styled from 'styled-components';

export const StyledNftContainer = styled.div`
  position: relative;
  display: flex;
  gap: 48px;
  & > .skeleton-wrapper > span {
    height: calc(100vh - 300px);
  }
  @media screen and (max-width: 982px) {
    flex-direction: column;
    & > .skeleton-wrapper > span {
      height: 50vh;
    }
  }
`;

export const StyledImageWrap = styled.div`
  flex: 0 50%;
  position: relative;
  background: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  height: fit-content;
  & .coins-icon {
    padding: 80px 0;
    color: ${({ theme }) => theme.colors.lightAccent};
    & svg {
      width: 50px;
      height: 50px;
    }
  }
`;

export const StyledImage = styled.div`
  border-radius: 24px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  & > img {
    width: 100%;
  }
`;

export const StyledInfoContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.landingBackground};
  flex: 0 50%;
  border-radius: 24px;
  overflow: hidden;
`;

export const StyledId = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.shadow};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 600;
`;

export const StyledInfo = styled.div`
  padding: 24px;
  overflow-y: scroll;
  max-height: calc(100vh - 328px);
  @media screen and (max-width: 982px) {
    max-height: fit-content;
  }
`;

export const StyledInfoItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  &:not(:last-child){
    margin-bottom: 24px;
  }
`;

export const StyledInfoItemLabelWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2px;
`

export const StyledInfoItemLabel = styled.div`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.textPink};
  background: ${({ theme }) => theme.colors.lightAccent};
`

export const StyledInfoItemHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  & .expand-icon {
    height: 18px;
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;
export const StyledInfoBlockWrap = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.shadow};
`;

export const StyledInfoBlock = styled.div`
  border-radius: 24px;
  overflow: hidden;
`;

export const StyledInfoBlockItem = styled.div`
  background-color: ${({ theme }) => theme.colors.shadow};
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.landingBackground};
  }
`;

export const StyledInfoBlockHead = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledInfoBlockDescription = styled.div`
  word-wrap: break-word;
  word-break: break-all;
`

export const StyledInfoBlockPink = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.textPink};
  overflow: hidden;
  & > a {
    cursor: pointer;
    word-wrap: break-word;
    word-break: break-all;
  }
`;
