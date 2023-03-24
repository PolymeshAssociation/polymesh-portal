import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;

  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  & .key-icon {
    color: #ff2e72;
  }
`;

export const StyledPrimaryLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 63px;
  height: 24px;
  border: 1px solid #fad1dc;
  border-radius: 100px;
  font-size: 12px;
  color: #ec4673;
`;
