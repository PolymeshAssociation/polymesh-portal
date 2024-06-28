import styled from 'styled-components';

export const StyledProviderContainer = styled.div`
  display: flex;
  gap: 16px;
`;

export const StyledProviderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const StyledProviderRegList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 16px;
  max-width: 200px;
  & > li {
    list-style-type: disc;
  }
  @media screen and (max-width: 680px) {
    max-width: 100%;
  }
`;

export const StyledTestnetLabel = styled.div`
  padding: 16px 24px 24px 24px;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  border-radius: 16px;
  cursor: pointer;
`;
