import styled from 'styled-components';

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ModalContent = styled.div`
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;
