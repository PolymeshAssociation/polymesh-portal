import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: key;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 112px;
  padding: 24px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;

  & .info-wrapper {
    flex-grow: 1;
    white-space: nowrap;

    & > p {
      color: rgba(255, 255, 255, 0.82);
    }
  }

  & .key-name {
    color: #ffffff;
    font-weight: 500;
  }

  @media screen and (max-width: 1023px) {
    width: 100%;
  }
`;

export const IconWrapper = styled.div<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.24);

  & .key-icon,
  & .copy-icon {
    color: #ffffff;
  }
`;

export const KeyInfoWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 66px;
  height: 32px;
  padding: 0 8px;
  border: 1px solid #fad1dc;
  border-radius: 100px;
  font-weight: 500;
  font-size: 10px;
  color: #ffffff;

  @media screen and (min-width: 480px) {
    padding: 0 12px;
    font-size: 12px;
  }
`;
