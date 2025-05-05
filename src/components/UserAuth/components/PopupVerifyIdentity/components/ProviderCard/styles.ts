import styled from 'styled-components';

export const StyledProviderContainer = styled.div`
  display: flex;
  gap: 16px;
`;

export const StyledProviderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
`;

export const StyledProviderRegList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 16px;
  max-width: 200px;
  & > li {
    list-style-type: disc;
  }
  @media screen and (max-width: 680px) {
    max-width: 100%;
  }
`;

export const StyledTestnetLabel = styled.div`
  padding: 16px 24px 24px 24px;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  border-radius: 16px;
  cursor: pointer;
`;

export const DisabledOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px; // Match ActionCard's border-radius
  z-index: 1;

  span {
    transform: rotate(-15deg);
    font-size: 1.5rem;
    font-weight: bold;
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 1;
    border: 2px solid ${({ theme }) => theme.colors.textSecondary};
    padding: 4px 12px;
  }
`;
