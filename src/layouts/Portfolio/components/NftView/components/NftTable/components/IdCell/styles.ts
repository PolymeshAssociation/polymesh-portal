import styled from 'styled-components';

export const StyledCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  @media screen and (max-width: 1024px) {
    flex-direction: row-reverse;
  }
`;

export const StyledImageWrap = styled.div`
  width: 36px;
  height: 36px;
  display: flex;
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
