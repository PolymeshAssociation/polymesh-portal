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
  background-color: rgba(21, 41, 53, 0.3);
  z-index: 2;
  overflow: scroll;
  @media screen and (min-width: 768px) {
    padding: 24px;
  }

  animation: backdrop-animation 250ms ease-out;
  @keyframes backdrop-animation {
    from {
      background-color: transparent;
    }

    to {
      background-color: rgba(21, 41, 53, 0.3);
    }
  }
`;

export const StyledModal = styled.div<{
  disableOverflow?: boolean;
}>`
  position: relative;
  padding: 24px;
  @media screen and (max-width: 767px) {
    width: 100vw;
    height: 100vh;
  }
  @media screen and (min-width: 768px) {
    min-width: 400px;
    max-width: 504px;
    max-height: 80vh;
    border-radius: 8px;
  }
  background-color: ${({ theme }) => theme.colors.modalBackground};
  box-shadow: 0px 20px 40px rgba(21, 41, 53, 0.1);
  ${({ disableOverflow }) => (disableOverflow ? '' : `overflow-y: scroll;`)}

  animation: modal-animation 250ms ease-out;
  @keyframes modal-animation {
    from {
      transform: translateY(100%);
    }

    to {
      transform: translateY(0%);
    }
  }
`;

export const StyledCloseButton = styled.button`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: 24px;
  right: 24px;
  background-color: transparent;
  cursor: pointer;
`;
