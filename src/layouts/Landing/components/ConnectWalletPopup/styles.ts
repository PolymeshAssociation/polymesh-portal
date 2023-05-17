import styled from 'styled-components';

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 40px;

  @media screen and (max-width: 767px) {
    & button {
      flex-grow: 1;
    }
  }
`;
