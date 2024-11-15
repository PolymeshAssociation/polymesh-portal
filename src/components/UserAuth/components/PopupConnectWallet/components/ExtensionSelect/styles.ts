import styled from 'styled-components';
import { MatomoData } from '~/helpers/matomoTags';

export const StyledExtensionList = styled.ul<{ $isMobile: boolean }>`
  margin-top: 8px;
  display: ${({ $isMobile }) => ($isMobile ? 'flex' : 'grid')};
  flex-direction: column;
  grid-template-columns: repeat(5, 205px);
  gap: 16px;
  @media screen and (max-width: 1200px) {
    grid-template-columns: repeat(3, 205px);
    justify-content: center;
  }
  @media screen and (max-width: 920px) {
    grid-template-columns: repeat(2, 205px);
    justify-content: center;
  }
  @media screen and (max-width: 520px) {
    grid-template-columns: repeat(2, 160px);
    gap: 12px;
  }
`;

export const StyledExtensionBox = styled.li<{
  $isMobile: boolean
  matomoData?: MatomoData
 }>`
  position: relative;
  height: ${({ $isMobile }) => ($isMobile ? 'fit-content' : '235px')};
  cursor: pointer;
  @media screen and (max-width: 520px) {
    height: ${({ $isMobile }) => ($isMobile ? 'fit-content' : '212px')};
  }
`;
