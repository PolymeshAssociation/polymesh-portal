import styled from 'styled-components';

export const StyledExtensionName = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: 16px;
  border-bottom: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  & > p {
    font-weight: 700;
  }
`;

export const StyledExtensionFeaturesList = styled.ul`
  padding: 16px 0 0 16px;
  display: flex;
  flex-direction: column;
  & > li {
    list-style-type: disc;
  }
`;
