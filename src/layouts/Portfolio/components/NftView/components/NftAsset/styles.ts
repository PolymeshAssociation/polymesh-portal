import styled from 'styled-components';

export const StyledNftContainer = styled.div`
  position: relative;
  display: flex;
  gap: 48px;
  align-items: flex-start;
  & > .skeleton-wrapper {
    & > span {
      height: calc(100vh - 300px);
    }
  }

  & > .skeleton-wrapper:first-child {
    flex: 0 0 40%;
    & > span {
      height: 0;
      padding-bottom: 100%;
      width: 100%;
    }
  }

  @media screen and (max-width: 982px) {
    flex-direction: column;
    & > .skeleton-wrapper > span {
      height: 50vh;
    }
  }
`;

export const StyledImageWrap = styled.div`
  flex: 0 40%;
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
