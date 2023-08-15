import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  grid-area: account-info;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background: linear-gradient(252.2deg, #ff2e72 0%, #4a125e 111.15%);
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  height: 100%;
  color: rgba(255, 255, 255, 0.82);

  @media screen and (max-width: 1200px) {
    width: 100%;
  }

  & button {
    width: 100%;
  }

  & .staking-account-item {
    display: flex;
    flex-direction: row;
    gap: 10px;
    align-items: center;
  }
`;

export const Label = styled.span`
  font-weight: bold;
  min-width: 160px;
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
`;

export const IconWrapper = styled.div<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.pinkBackground};

  & .staking-icon,
  & .id-icon {
    color: ${({ theme }) => theme.colors.textPink};
  }
  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & .heading-wrapper {
    align-items: center;
    display: flex;
    flex-grow: 1;

    & h4 {
      color: rgba(255, 255, 255, 0.82);
    }
  }
`;

export const StyledTextWrapper = styled.div`
  padding: 30px 0px;
  & p {
    color: rgba(255, 255, 255, 0.82);
  }
`;

export const StyledNameOrKey = styled.div`
  max-width: 150px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
`;
