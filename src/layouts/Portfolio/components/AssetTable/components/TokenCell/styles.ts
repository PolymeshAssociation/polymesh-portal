import styled from 'styled-components';

export const StyledCell = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const StyledIconWrapper = styled.div<{ $background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: ${({ $background }) => $background};
  color: #ffffff;
`;
