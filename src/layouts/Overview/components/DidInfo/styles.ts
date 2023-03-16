import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: did;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 244px;
  padding: 24px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;

  & button {
    width: 100%;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.24);

  & .id-icon,
  & .copy-icon {
    color: #ffffff;
  }
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & > .did-wrapper {
    flex-grow: 1;

    & p {
      color: rgba(255, 255, 255, 0.82);
    }
  }
`;

export const StyledVerifiedLabel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  width: 54px;
  height: 16px;
  border-radius: 4px;
  background-color: #d4f7e7;
  color: #00aa5e;
  font-size: 12px;
`;

export const StyledDidWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const StyledBottomInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  & div {
    display: flex;
    align-items: center;
    font-size: 14px;
    color: #ffffff;
  }

  & p {
    color: #ffffff;
  }

  & span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: auto;
    font-weight: 500;
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;
