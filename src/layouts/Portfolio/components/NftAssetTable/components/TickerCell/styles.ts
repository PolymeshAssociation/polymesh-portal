import styled from 'styled-components';

export const StyledCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledImageWrap = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textPink};
  background-color: ${({ theme }) => theme.colors.pinkBackground};
  & > img {
    max-width: 100%;
    max-height: 100%;
  }
`;

export const StyledIconWrapper = styled.div<{ $background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: ${({ $background }) => $background};
  color: #ffffff;
`;
