import styled from 'styled-components';

export const StyledValue = styled.button`
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  @media screen and (min-width: 1024px) {
    display: flex;
    align-items: center;
    gap: 16px;
  }
`;

export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 48px;
  @media screen and (min-width: 768px) {
    width: 440px;
  }
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: max-content;
  height: 24px;
  padding: 0 8px;
  gap: 8px;
  background-color: #fbf3d0;
  color: #e3a30c;
  border-radius: 100px;
  font-size: 12px;
`;

export const StyledActionButton = styled.button<{ marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  gap: 8px;
  margin-top: ${({ marginTop }) => (marginTop ? `${marginTop}px` : 0)};
  padding: 0 16px;
  background-color: transparent;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textBlue};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const StyledEndpointWrapper = styled.div<{ marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  ${({ marginTop }) => (marginTop ? `margin-top: ${marginTop}px;` : '')}
`;
