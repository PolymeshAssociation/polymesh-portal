import styled from 'styled-components';
import { Button } from '~/components/UiKit';

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;

  @media screen and (min-width: 768px) {
    padding: 36px;
  }
`;

export const Section = styled.section`
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  padding: 16px;

  @media screen and (min-width: 768px) {
    padding: 24px;
  }
`;

export const SectionHeader = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ $isExpanded }) => ($isExpanded ? '16px' : '0')};
  cursor: pointer;
  padding: 4px;

  &:hover {
    opacity: 0.9;
  }
`;

export const SectionContent = styled.div<{ $isExpanded: boolean }>`
  display: ${({ $isExpanded }) => ($isExpanded ? 'block' : 'none')};
`;

export const IconWrapper = styled.div<{ $isExpanded: boolean }>`
  display: flex;
  align-items: center;
  margin-left: 16px;
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
  transition: transform 0.2s ease-in-out;
  padding: 4px;

  &:hover {
    background: ${({ theme }) => theme.colors.dashboardBackground};
    border-radius: 50%;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  margin: 0;
`;

export const EditButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textPink};
  cursor: pointer;
  padding: 8px;
  border-radius: 100px;
  transition: background-color 0.2s;

  &:hover {
    background-color: ${({ theme }) => theme.colors.pinkBackground};
  }
`;

export const Grid = styled.div`
  display: grid;
  gap: 16px;
  grid-template-columns: 1fr;

  @media screen and (min-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
`;

export const PropertyItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PropertyLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const PropertyValue = styled.span`
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const DocumentsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const DocumentItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 12px;
`;

export const DocumentInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DocumentName = styled.span`
  font-weight: 500;
`;

export const DocumentLink = styled.a`
  color: ${({ theme }) => theme.colors.textPink};
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;

export const MetadataList = styled(DocumentsList)``;

export const MetadataItem = styled(DocumentItem)``;

export const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const AddButton = styled(EditButton)`
  padding: 8px 16px;
  font-size: 14px;
  border: 1px dashed ${({ theme }) => theme.colors.textSecondary};
  border-radius: 8px;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: transparent;

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
    border-color: ${({ theme }) => theme.colors.textPink};
    background: ${({ theme }) => theme.colors.pinkBackground};
  }
`;

export const FeaturesList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  padding: 16px;
`;

export const FeatureItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 8px;

  &:hover {
    background: ${({ theme }) => theme.colors.pinkBackground};
  }
`;

export const FeatureInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  margin-right: 8px; /* Add margin to create gap between description and button */
`;

export const FeatureTitle = styled.span`
  font-weight: 500;
`;

export const FeatureDescription = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  padding: 8px;
`;

export const ActionButton = styled(Button)`
  width: 100%;
  justify-content: flex-start;
  gap: 8px;
  text-align: left;
`;
