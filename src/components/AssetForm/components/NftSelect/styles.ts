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
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  & > img {
    width: 100%;
  }
  &.small {
    width: 18px;
    height: 18px;
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
  font-weight: 500;
  background: #f5f5f5;
  padding: 2px 8px;
  border-radius: 12px;
  color: #1e1e1e;
`;

export const StyledCloseBtn = styled.div`
  cursor: pointer;
  display: flex;
  align-items: center;
`;
