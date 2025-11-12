import styled from 'styled-components';

export const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 16px;
  gap: 16px;

  h2 {
    font-size: 24px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    margin: 0;
  }

  @media screen and (max-width: 767px) {
    padding: 20px 20px 12px;

    h2 {
      font-size: 20px;
    }
  }
`;

export const DocumentationSection = styled.div`
  padding: 0 24px 24px;

  @media screen and (max-width: 767px) {
    padding: 0 20px 20px;
  }
`;

export const StepIndicator = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
`;

export const ModalContent = styled.div`
  padding: 24px;
  min-height: 400px;

  @media screen and (max-width: 767px) {
    padding: 20px;
    min-height: 300px;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 24px;

  @media screen and (max-width: 767px) {
    padding: 20px;
    padding-top: 20px;
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

export const TabContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const Tabs = styled.div`
  display: flex;
  gap: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Tab = styled.button<{ $active: boolean }>`
  padding: 12px 24px;
  background: none;
  border: none;
  border-bottom: 2px solid
    ${({ theme, $active }) =>
      $active ? theme.colors.textPrimary : 'transparent'};
  font-size: 16px;
  font-weight: ${({ $active }) => ($active ? '500' : '400')};
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textPrimary : theme.colors.textSecondary};
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media screen and (max-width: 767px) {
    padding: 10px 16px;
    font-size: 14px;
  }
`;

export const TabContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  input[type='radio'] {
    width: 20px;
    height: 20px;
    cursor: pointer;
  }
`;

export const RadioLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
`;

export const RadioTitle = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const RadioDescription = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 12px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SummarySection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const SummaryCard = styled.div`
  padding: 20px;
  background-color: ${({ theme }) => theme.colors.lightAccent};
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const SummaryTitle = styled.h3`
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const SummaryText = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const SelectedItemsList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
`;

export const SelectedItem = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledDocumentation = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;

  a {
    color: ${({ theme }) => theme.colors.textPink};
    text-decoration: none;
    font-weight: 500;

    &:hover {
      text-decoration: underline;
    }
  }
`;
