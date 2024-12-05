import styled from 'styled-components';

export const StyledDetailsWrapper = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  @media screen and (max-width: 1023px) {
    width: 100%;
    flex-direction: column;
    align-items: flex-start;
  }
`;

export const StyledInfoItem = styled.div<{
  $isId?: boolean;
}>`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: ${({ $isId }) => ($isId ? 0 : 1)};
  @media screen and (max-width: 1023px) {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    & p {
      text-align: right;
    }
  }

  @media screen and (min-width: 1024px) and (max-width: 1199px) {
    font-size: 10px;
    & p {
      font-size: 14px;
    }
  }
`;

export const StyledVenueId = styled(StyledInfoItem)`
  position: relative;
  cursor: pointer;
  padding: 0 16px 4px 16px;

  &:hover {
    text-decoration: underline;
  }

  @media screen and (max-width: 1023px) {
    padding: 0;
  }
`;

export const StyledVenueDetails = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  padding: 16px;
  min-width: 160px;
  max-width: 50vw;
  max-height: 300px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  border: 1px solid #c8c8c8;
  overflow-y: scroll;
  z-index: 1;

  & span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
