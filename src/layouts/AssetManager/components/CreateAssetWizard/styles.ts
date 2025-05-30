import styled from 'styled-components';

const breakpoints = {
  mobile: '768px',
  tablet: '1024px',
  desktop: '1280px',
} as const;

const mediaQueries = {
  mobile: `@media (max-width: ${breakpoints.mobile})`,
  tablet: `@media (max-width: ${breakpoints.tablet})`,
  desktop: `@media (max-width: ${breakpoints.desktop})`,
} as const;

// Layout Components
export const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 700px;
  margin: 0 auto;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 24px;

  ${mediaQueries.mobile} {
    padding: 0px;
    margin: 0;
    display: flex;
    flex-direction: column;
    min-height: calc(100vh - 56px); // Account for header
    background: transparent;
    box-shadow: none;
  }

  h2 {
    font-size: 24px;
    margin-bottom: 16px;

    ${mediaQueries.mobile} {
      font-size: 20px;
      margin-bottom: 12px;
    }
  }
`;

// --- Typography ---
export const FieldLabel = styled.label`
  display: block;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  min-width: 150px;

  ${mediaQueries.mobile} {
    margin-bottom: 8px;
    font-size: 16px;
  }

  &[data-required='true']::after {
    content: '*';
    color: ${({ theme }) => theme.colors.error};
    margin-left: 4px;
  }
`;

export const DescriptionText = styled.p`
  margin-bottom: 24px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;

  ${mediaQueries.mobile} {
    margin-bottom: 16px;
    font-size: 13px;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const SubSectionTitle = styled.h4`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

// --- Form Elements ---
export const FieldInput = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  min-width: 0;
  padding: 12px;
  background: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error : theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  color-scheme: ${({ theme }) => theme.mode};

  ${mediaQueries.mobile} {
    width: 100%;
    min-height: 48px; // Increased touch target
    padding: 12px 16px;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.focusBorder};
  }
`;

export const FieldSelect = styled.select<{ $hasError?: boolean }>`
  flex: 1;
  padding: 12px;
  background: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid
    ${({ $hasError, theme }) =>
      $hasError ? theme.colors.error : theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  background-size: 16px;
  transition: all 250ms ease-out;
  color-scheme: ${({ theme }) => theme.mode};

  ${mediaQueries.mobile} {
    width: 100%;
    min-height: 48px;
    padding: 12px 40px 12px 16px; // Extra right padding for dropdown arrow
    background-size: 20px; // Larger dropdown arrow
    background-position: right 12px center;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.focusBorder};
  }

  &:hover:enabled {
    border-color: ${({ theme }) => theme.colors.focusBorder};
    background-color: ${({ theme }) => theme.colors.pinkBackground};
  }

  option {
    background-color: ${({ theme }) => theme.colors.landingBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 8px;
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBackground};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }
`;

export const FieldTextarea = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.textSecondary};
  border-radius: 12px;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  background: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  transition: border-color 250ms ease-out;

  ${mediaQueries.mobile} {
    padding: 14px 12px;
    min-height: 100px;
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.focusBorder};
    background: transparent;
  }
`;

// --- Buttons ---
export const Button = styled.button`
  background: ${({ theme }) => theme.colors.buttonBackground};
  color: ${({ theme }) => theme.colors.textPink};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 12px 24px;
  cursor: pointer;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 120px;

  ${mediaQueries.mobile} {
    width: 100%;
    padding: 16px;
    min-height: 48px; // Ensures good touch target
    font-size: 16px;
  }

  &:hover {
    background: ${({ theme }) => theme.colors.buttonHoverBackground};
    color: ${({ theme }) => theme.colors.buttonBackground};
  }

  &:disabled {
    background-color: ${({ theme }) => theme.colors.disabledBackground};
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

// --- Layout / Structural Components ---
export const FieldRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  ${mediaQueries.mobile} {
    flex-direction: column;
    align-items: flex-start;
    gap: 0px;
    width: 100%;
  }

  & > ${FieldLabel} {
    min-width: 150px;
  }

  & > select,
  & > input,
  & > div {
    flex: 1;
    width: 100%;
  }

  // When select and input are both present
  & > select + input {
    max-width: 200px;
  }
`;

export const VenueSelectRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;

  ${mediaQueries.mobile} {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;

  ${Button}:last-child {
    margin-left: auto;
  }
`;

export const WizardContainer = styled.div`
  display: flex;
  height: 100%;
  gap: 24px;

  ${mediaQueries.mobile} {
    flex-direction: column;
  }
`;

export const StepContainer = styled.div`
  flex: 1;

  ${mediaQueries.mobile} {
    flex-direction: column;
    width: 100%;
    gap: 12px;
  }
`;

export const SidebarContainer = styled.div`
  width: 260px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  padding: 16px;
  border-radius: 24px;
`;

export const StepItem = styled.div<{ $active: boolean; $completed?: boolean }>`
  padding: 1rem;
  cursor: pointer;
  font-size: 0.9rem;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textPrimary : theme.colors.textSecondary};
  background-color: ${({ theme, $active }) =>
    $active ? theme.colors.lightAccent : 'transparent'};
  border-left: 3px solid
    ${({ theme, $active, $completed }) => {
      if ($completed) {
        return '#00AA5E';
      }
      if ($active) {
        return theme.colors.textPink;
      }
      return theme.colors.lightAccent;
    }};
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

export const NavigationWrapper = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 24px;

  ${mediaQueries.mobile} {
    position: sticky;
    bottom: 0;
    background: ${({ theme }) => theme.colors.landingBackground};
    margin-top: auto;
    padding: 16px;
    border-top: 1px solid ${({ theme }) => theme.colors.border};
    z-index: 2;
    margin-left: -24px;
    margin-right: -24px;
  }
`;

export const HeaderRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  ${mediaQueries.mobile} {
    margin-bottom: 12px;
  }

  &:only-child {
    margin-bottom: 0;
  }

  h3,
  h4 {
    margin: 0;
  }
`;

// --- Miscellaneous ---
export const IconWrapper = styled.div`
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  border-radius: 50%;
  transition: background-color 250ms ease-out;

  &:hover {
    background: ${({ theme }) => theme.colors.pinkBackground};
    color: ${({ theme }) => theme.colors.textPink};
  }
`;

export const TrustedClaimTypesContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  ${mediaQueries.mobile} {
    padding: 12px;
  }
`;

export const CheckboxGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 8px;
  row-gap: 0px;
  margin-bottom: 16px;

  ${mediaQueries.mobile} {
    grid-template-columns: 1fr;
  }
`;

export const TrustedCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  padding: 4px;

  ${mediaQueries.mobile} {
    font-size: 16px;
    padding: 8px 4px;
    min-height: 44px;
    width: 100%;
  }
`;

export const StyledErrorMessage = styled.span`
  color: ${({ theme }) => theme.colors.error};
  font-size: 12px;
  margin-top: 4px;
  display: flex;
  justify-content: flex-end;

  ${mediaQueries.mobile} {
    font-size: 14px;
    padding: 4px 0;
    margin-top: 2px;
  }
`;

export const FieldWrapper = styled.div<{ $hasError?: boolean }>`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ $hasError }) => ($hasError ? '20px' : '16px')};

  ${mediaQueries.mobile} {
    margin-bottom: ${({ $hasError }) => ($hasError ? '24px' : '20px')};
    width: 100%;
  }
`;

export const FieldInputWithDelete = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 16px;
  flex: 1;
  width: 100%;

  ${mediaQueries.mobile} {
    & > input {
      flex: 1;
      width: 100%;
    }
  }
`;

export const StyledForm = styled.form`
  margin-bottom: 24px;

  ${mediaQueries.mobile} {
    margin-bottom: 16px;
  }
`;

export const StyledFormSection = styled.div`
  background: ${({ theme }) => theme.colors.landingBackground};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.colors.shadow} 0px 5px 15px;

  ${mediaQueries.mobile} {
    padding: 16px;
    margin-bottom: 16px;
    background: transparent;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

export const CheckboxRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;

  ${mediaQueries.mobile} {
    padding: 8px 0;
  }
`;

export const ThemedCheckbox = styled.input.attrs({ type: 'checkbox' })`
  accent-color: ${({ theme }) => theme.colors.textPink};
  width: 20px;
  height: 20px;

  ${mediaQueries.mobile} {
    width: 24px;
    height: 24px;
  }
`;

export const ChipContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 8px 0;
  min-height: 49px;

  ${mediaQueries.mobile} {
    gap: 12px;
    padding: 12px 0;
  }
`;

export const StyledClaimContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  font-size: 14px;
  margin-bottom: 16px;
  overflow: hidden;
  border-top: 1px solid ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.textPrimary};

  .no-claims {
    padding: 12px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-style: italic;
    margin: auto;
  }
`;

export const StyledClaim = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: transparent;
  padding: 8px 12px;

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const StyledCondition = styled.div`
  padding-bottom: 6px;
`;

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.textPink};
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;
