import styled from 'styled-components';

export const StyledActionButtonsWrap = styled.div<{ $aligned: boolean }>`
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: ${({ $aligned }) =>
    $aligned ? 'flex-end' : 'space-between'};
`;
