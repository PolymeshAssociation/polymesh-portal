import styled from 'styled-components';

// =============================================================================
// MODAL LAYOUT
// =============================================================================

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

export const StepIndicator = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  letter-spacing: 0.5px;
`;

export const ModalContent = styled.div`
  padding: 0 24px 24px;
  min-height: 250px;

  @media screen and (max-width: 767px) {
    padding: 20px;
    min-height: 200px;
  }
`;

export const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px 24px;

  @media screen and (max-width: 767px) {
    padding: 16px 20px 20px;
    flex-direction: column-reverse;

    button {
      width: 100%;
    }
  }
`;

// =============================================================================
// FORM SECTIONS
// =============================================================================

export const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const PermissionSelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 8px;
`;

export const PermissionSelectLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: block;
`;

export const PermissionSelectDropdown = styled.select`
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  cursor: pointer;
  transition: all 250ms ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.textPink};
  }

  option {
    background-color: ${({ theme }) => theme.colors.cardBackground};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 8px;
  }

  option:checked {
    background-color: ${({ theme }) => theme.colors.lightAccent};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const PermissionDescription = styled.div`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin-top: 4px;
`;

export const SelectWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
`;

export const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
  margin-bottom: 16px;
`;

// =============================================================================
// SUMMARY PAGE
// =============================================================================

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
  max-height: 200px;
  overflow-y: auto;
`;

export const SelectedItem = styled.li`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SummaryAssetItem = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// =============================================================================
// SHARED DROPDOWN COMPONENTS - Used by Asset and Portfolio selectors
// =============================================================================

// Consolidated dropdown button (supports both button and div elements)
export const DropdownButton = styled.button<{
  $expanded?: boolean;
  $isOpen?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  transition: all 250ms ease-out;
  font-size: 14px;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.textPink};
  }

  .expand-icon {
    transform: ${({ $expanded, $isOpen }) =>
      $expanded || $isOpen ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 250ms ease-out;
  }
`;

// Consolidated dropdown menu
export const DropdownMenu = styled.div`
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  max-height: 300px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.cardBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  box-shadow: 0px 8px 16px ${({ theme }) => theme.colors.shadow};
  z-index: 10;
`;

// Consolidated dropdown option (supports both $selected and $isSelected props)
export const DropdownOption = styled.div<{
  $selected?: boolean;
  $isSelected?: boolean;
}>`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 16px;
  cursor: pointer;
  transition: background-color 250ms ease-out;
  background-color: ${({ theme, $selected, $isSelected }) =>
    $selected || $isSelected ? theme.colors.lightAccent : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:first-child {
    border-radius: 12px 12px 0 0;
  }

  &:last-child {
    border-radius: 0 0 12px 12px;
  }
`;

export const IconWrapper = styled.div<{ $background: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $background }) => $background};
  flex-shrink: 0;
`;

export const Placeholder = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Consolidated search input
export const SearchInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: none;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;

  &:focus {
    outline: none;
    border-bottom-color: ${({ theme }) => theme.colors.textPink};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

// Consolidated count text
export const CountText = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

// Consolidated input label
export const InputLabel = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin-bottom: 8px;
  display: block;
`;

// Consolidated item count
export const ItemCount = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

// Consolidated no results message
export const NoResults = styled.div`
  padding: 16px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

// =============================================================================
// ASSET SELECTOR - Asset-specific components
// =============================================================================

export const AssetIdInputWrapper = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
`;

export const AssetIdInput = styled.input<{ $hasError?: boolean }>`
  flex: 1;
  padding: 12px 16px;
  border: 1px solid
    ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  transition: border-color 250ms ease-out;

  &:focus {
    outline: none;
    border-color: ${({ theme, $hasError }) =>
      $hasError ? theme.colors.error : theme.colors.textPink};
  }

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const AssetAddButton = styled.button`
  padding: 12px 24px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 250ms ease-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const AssetErrorMessage = styled.span`
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
`;

export const SelectedAssetsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 6px;
  margin-top: 12px;
  max-height: 250px;
  overflow-y: auto;
  overflow-x: hidden;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr;
  }
`;

export const SelectedAssetsHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
`;

export const AssetClearAllButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 0 12px;
  background-color: transparent;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPink};
  border: none;
  cursor: pointer;
  transition: color 250ms ease-out;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.textBlue};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }
`;

export const SelectedAssetsContainer = styled.div``;

export const SelectedAssetItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 10px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 10px;
  transition: border-color 250ms ease-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const AssetSelectedIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPink};
`;

export const AssetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
`;

export const AssetDetailsWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  min-width: 0;
`;

export const AssetId = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-word;
`;

export const AssetNameTicker = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;
`;

export const AssetRemoveButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 0;
  transition: color 250ms ease-out;

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
  }
`;

// =============================================================================
// EXTRINSICS/MODULES SELECTOR - Shared components (consolidated duplicates)
// =============================================================================

export const TransactionGroupsContainer = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px;
  max-height: 400px;
  overflow-y: auto;
  background-color: ${({ theme }) => theme.colors.landingBackground};
`;

export const GroupItem = styled.div`
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  padding: 4px;
  margin-left: -4px;
  margin-right: -4px;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: background-color 0.2s ease;
  cursor: pointer;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

export const GroupHeaderLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

// Consolidated checkbox style - used across extrinsics, modules, portfolios
export const PermissionCheckbox = styled.input.attrs({ type: 'checkbox' })`
  margin-right: 12px;
  accent-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.buttonBackground
      : theme.colors.textPink};
  width: 16px;
  height: 16px;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const GroupCheckboxLabel = styled.label`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const GroupLabelArea = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
`;

export const GroupStatus = styled.span`
  font-size: 11px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 8px;
  font-weight: 400;
`;

export const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transform: ${({ $isExpanded }) =>
    $isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'};
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover:not(:disabled) {
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

export const TransactionList = styled.div`
  margin-top: 4px;
`;

export const TransactionItem = styled.div`
  display: flex;
  align-items: center;
  padding: 2px 24px;
`;

export const TransactionCheckbox = styled(PermissionCheckbox)`
  margin-right: 8px;
  transform: scale(0.9);
`;

export const TransactionLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-word;
`;

export const TransactionCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

// =============================================================================
// VIEW TOGGLE - For extrinsics view
// =============================================================================

export const ViewToggleContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding-bottom: 0;
`;

export const ViewToggleLabel = styled.span`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  margin-right: 4px;
`;

export const ViewToggleTab = styled.button<{ $active: boolean }>`
  padding: 8px;
  border: none;
  background: none;
  color: ${({ theme, $active }) =>
    $active ? theme.colors.textPink : theme.colors.textSecondary};
  font-size: 14px;
  font-weight: ${({ $active }) => ($active ? '600' : '500')};
  cursor: pointer;
  position: relative;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;

  ${({ $active, theme }) =>
    $active &&
    `
    border-bottom-color: ${theme.colors.textPink};
  `}

  &:hover {
    color: ${({ theme, $active }) =>
      $active ? theme.colors.textPink : theme.colors.textPrimary};
  }
`;

// =============================================================================
// PORTFOLIO SELECTOR
// =============================================================================

export const PortfolioCheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  width: 100%;
  cursor: pointer;
`;

export const PortfolioOption = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  background-color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.lightAccent : 'transparent'};
  transition: background-color 250ms ease-out;

  &:hover {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }
`;

export const PortfolioInfo = styled.div`
  display: flex;
  flex: 1;
  align-items: center;
  gap: 4px;
`;

export const PortfolioId = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PortfolioName = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PortfolioOwnerDid = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-left: 4px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const PortfolioCustodianBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.lightAccent};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PortfolioWarningBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  margin-left: 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.warning || '#fff3cd'};
  color: #856404;
`;

export const PortfolioInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
`;

export const SummaryAssetTicker = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
`;

export const SummaryPortfolioDetailWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const SummaryPortfolioMainLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SummaryPortfolioOwnerDid = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const SummaryStaleText = styled.span`
  color: ${({ theme }) => theme.colors.warning || '#856404'};
  font-size: 13px;
  margin-left: 4px;
`;
