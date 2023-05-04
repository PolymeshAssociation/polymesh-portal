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
  background-color: ${({ theme }) => theme.colors.backdrop};
  z-index: 2;
  overflow: scroll;
`;

export const StyledModal = styled.div<{ disableOverflow?: boolean }>`
  padding: 24px;
  max-width: 504px;
  max-height: 80vh;
  background-color: ${({ theme }) => theme.colors.modalBackground};
  box-shadow: ${({ theme }) => `0px 20px 40px ${theme.colors.shadow}`};
  border-radius: 8px;
  ${({ disableOverflow }) => (disableOverflow ? '' : `overflow-y: scroll;`)}
`;
