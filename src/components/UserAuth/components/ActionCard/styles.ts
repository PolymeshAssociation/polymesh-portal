import styled from 'styled-components';
import { MatomoData } from '~/helpers/matomoTags';

export const StyledActionCard = styled.div<{
   $hovered: boolean;
   matomoData?: MatomoData;
  }>`
  height: 100%;
  padding: 16px 24px 24px 24px;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  border-radius: 16px;
  cursor: ${({ $hovered }) => ($hovered ? 'pointer' : 'auto')};
  @media screen and (max-width: 520px) {
    padding: 16px;
  }
`;
