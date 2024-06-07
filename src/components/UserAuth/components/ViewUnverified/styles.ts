import styled from 'styled-components';

export const StyledAuthButtons = styled.div`
  display: flex;
  gap: 16px;
  @media screen and (max-width: 520px) {
    flex-direction: column;
  }
`;

export const StyledModalContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;
