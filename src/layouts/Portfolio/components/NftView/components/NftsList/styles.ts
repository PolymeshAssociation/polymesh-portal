import styled from 'styled-components';

export const StyledNftsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  & .skeleton-wrapper {
    width: initial;
    flex-grow: 0;
  }
  @media screen and (max-width: 580px) {
    justify-content: center;
  }
`;

export const StyledNftCard = styled.div`
  width: 254px;
  padding: 24px;
  border-radius: 24px;
  background: ${({ theme }) => theme.colors.landingBackground};
  overflow: hidden;
  @media screen and (max-width: 580px) {
    width: 312px;
  }
`;

export const StyledNftImage = styled.div`
  width: 206px;
  height: 206px;
  border-radius: 15px;
  background: ${({ theme }) => theme.colors.shadow};
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 16px;
  position: relative;
  & > img {
    width: 100%;
  }
  & svg {
    color: ${({ theme }) => theme.colors.textPink};
  }
  @media screen and (max-width: 580px) {
    width: 264px;
    height: 264px;
  }
`;

export const StyledNftId = styled.div`
  font-size: 20px;
  font-weight: 600;
  letter-spacing: -0.2px;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
`;

export const StyledImgUrl = styled.div`
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPink};
  text-transform: uppercase;
  cursor: pointer;
`;
