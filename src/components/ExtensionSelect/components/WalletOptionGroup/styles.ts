import styled from 'styled-components';

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

  & + label {
    & .selected-icon {
      opacity: 0;
      transition: opacity 250ms ease-out;
    }
  }

  &:checked + label {
    border: 1px solid ${({ theme }) => theme.colors.textPink};
    & .selected-icon {
      opacity: 1;
    }
  }
`;

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  flex-wrap: wrap;
`;
