import styled from 'styled-components';

export const StyledLabel = styled.label<{ disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: 19px;
  margin-top: 24px;
  cursor: pointer;
  ${({ disabled }) =>
    disabled
      ? `
    cursor: initial;
    & p {
        color: #C7C7C7;
    }
    & div {
        border-color: #C7C7C7;
    }
  
  `
      : ''}

  & .checkbox-icon {
    width: 13px;
    height: 13px;
    background-color: ${({ theme }) => theme.colors.textPink};
    border-radius: 1px;
    opacity: 0;
    transition: opacity 250ms ease-out;
  }

  & input:checked + div {
    & > .checkbox-icon {
      opacity: 1;
    }
  }
`;

export const StyledInput = styled.input`
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  border: 0;
  padding: 0;

  white-space: nowrap;
  clip-path: inset(100%);
  clip: rect(0 0 0 0);
  overflow: hidden;
`;

export const CheckboxFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 1px solid #8f8f8f;
  border-radius: 2px;
`;
