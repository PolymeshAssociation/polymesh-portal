import styled from 'styled-components';

export const StyledBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background-color: rgba(21, 41, 53, 0.3);
  z-index: 2;
  overflow: scroll;
`;

export const StyledModal = styled.div`
  padding: 24px;
  max-width: 504px;
  max-height: 80vh;
  background-color: ${({ theme }) => theme.colors.modalBackground};
  box-shadow: 0px 20px 40px rgba(21, 41, 53, 0.1);
  border-radius: 8px;
  overflow-y: scroll;
`;
