import styled from 'styled-components';

export const StyledTruncatedText = styled.span<{
  $maxWidth: number;
  $keepCase?: boolean;
}>`
  display: inline-block;
  max-width: ${({ $maxWidth }) => $maxWidth}px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  vertical-align: bottom;
  ${({ $keepCase }) => ($keepCase ? 'text-transform: none;' : '')}
`;
