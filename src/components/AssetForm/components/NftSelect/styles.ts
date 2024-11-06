import styled from 'styled-components';

export const StyledSelectGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledSelectAll = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPink};
  cursor: pointer;
  padding: 8px;
  border-radius: 8px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
`;

export const StyledNftOption = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
  &:hover {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
`;

export const StyledOptionImg = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 24px;
  border-radius: 50%;

  .stacked-icon {
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.dashboardBackground};
  }

  .image {
    width: 24px;
    height: 24px;
    left: 0;
  }

  .icon-1 {
    left: 8px;
  }
  .icon-2 {
    left: 4px;
  }
  .icon-3 {
    left: 0;
  }

  & > img {
    width: 100%;
    border-radius: 50%;
  }
  &.small {
    width: 20px;
    height: 20px;
  }
`;

export const StyledLabelWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

export const StyledLabel = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  height: 25px;
  font-weight: 400;
  background: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 2px 2.5px;
  border-radius: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledCloseBtn = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textPink};
`;

export const StyledNftSelectedHeadWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledActionButton = styled.button<{ $marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : 0)};
  margin-left: auto;
  padding: 0 16px;
  background-color: transparent;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textBlue};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;
