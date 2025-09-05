import styled from 'styled-components';

export const StyledModalContent = styled.div`
  flex: 1;
  overflow-y: auto;

  /* Hide scrollbar while keeping scroll functionality */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */

  &::-webkit-scrollbar {
    display: none; /* Webkit browsers */
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
`;
