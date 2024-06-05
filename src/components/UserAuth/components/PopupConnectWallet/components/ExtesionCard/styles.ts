import styled from 'styled-components';

export const StyledExtensionName = styled.div<{ $isMobile: boolean }>`
  display: flex;
  gap: 8px;
  align-items: center;
  padding-bottom: ${({ $isMobile }) => ($isMobile ? '0px' : '16px')};
  & > p {
    font-weight: 700;
  }
`;

export const StyledExtensionFeaturesList = styled.ul`
  border-top: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  padding: 16px 0 0 16px;
  display: flex;
  flex-direction: column;
  & > li {
    list-style-type: disc;
  }
  @media screen and (max-width: 520px) {
    padding: 12px 0 0 12px;
  }
`;

export const StyledExtensionNameMobile = styled.div`
  & > p:last-child {
    margin-top: 3px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
