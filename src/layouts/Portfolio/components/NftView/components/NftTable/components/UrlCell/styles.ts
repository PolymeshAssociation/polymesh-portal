import styled from 'styled-components';

export const StyledCell = styled.div`
  display: flex;
  justify-content: flex-end;
  overflow: hidden;
  @media screen and (min-width: 1024px) {
    padding-right: 24px;
  }
`;

export const StyledImgUrl = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPink};
  max-width: 670px;
  cursor: pointer;
  text-transform: lowercase;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  @media screen and (max-width: 1280px) {
    max-width: 420px;
  }
`;
export const StyledIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f5f5f5;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPink};
  display: flex;
  align-items: center;
  justify-content: center;
`;
