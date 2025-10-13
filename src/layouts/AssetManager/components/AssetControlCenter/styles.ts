import styled from 'styled-components';
import { Button } from '~/components/UiKit';

// =============================================================================
// MAIN CONTAINER STYLES
// =============================================================================

export const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;

  @media screen and (min-width: 768px) {
    padding: 36px;
  }
`;

// =============================================================================
// ASSET SNAPSHOT STYLES
// =============================================================================

export const SnapshotContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.large};
`;

export const HeaderBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 24px;
  background: ${({ theme }) => theme.colors.dashboardBackground};

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
`;

export const LeftSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const RightSection = styled.div`
  display: flex;
  align-items: center;

  @media screen and (max-width: 768px) {
    justify-content: stretch;
  }
`;

export const AssetNameContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const AssetName = styled.h1`
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
  line-height: 1.2;
`;

export const EditIcon = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    background: ${({ theme }) => theme.colors.shadow};
  }
`;

export const AssetIdentifier = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.textSize.large};
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StatusActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media screen and (max-width: 768px) {
    /* Two-row grid on mobile: 
       Row 1: Primary button spans full width
       Row 2: More Actions (1fr) + Refresh (auto) */
    display: grid;
    grid-template-columns: 1fr auto;
    grid-auto-rows: auto;
    width: 100%;
    row-gap: 8px;
    column-gap: 8px;

    /* Primary button (first child) spans both columns */
    & > *:first-child {
      grid-column: 1 / -1;
      width: 100%;
    }
  }
`;

interface StatusBadgeProps {
  $status: 'frozen' | 'active';
}

export const StatusBadge = styled.div<StatusBadgeProps>`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: ${({ theme }) => theme.textSize.small};
  font-weight: 500;
  background: ${({ theme, $status }) =>
    $status === 'frozen' ? theme.colors.error : theme.colors.success};
  color: ${({ theme }) => theme.colors.buttonText};
`;

interface VenueStatusBadgeProps {
  $enabled: boolean;
}

export const VenueStatusBadge = styled.div<VenueStatusBadgeProps>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  background-color: ${({ theme, $enabled }) => {
    if ($enabled) {
      return theme.mode === 'light' ? '#d4edda' : `${theme.colors.success}20`;
    }
    return theme.mode === 'light' ? '#fff3cd' : `${theme.colors.warning}20`;
  }};
  color: ${({ theme, $enabled }) => {
    if ($enabled) {
      return theme.mode === 'light' ? '#155724' : theme.colors.success;
    }
    return theme.mode === 'light' ? '#856404' : theme.colors.warning;
  }};
  border: 1px solid
    ${({ theme, $enabled }) => {
      if ($enabled) {
        return theme.mode === 'light' ? '#c3e6cb' : `${theme.colors.success}40`;
      }
      return theme.mode === 'light' ? '#ffeaa7' : `${theme.colors.warning}40`;
    }};
`;

export const DetailsCard = styled.div`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  border-radius: ${({ theme }) => theme.borderRadius.large};
  background: ${({ theme }) => theme.colors.cardBackground};
  box-shadow: ${({ theme }) => theme.boxShadow.xl}
    ${({ theme }) => theme.colors.shadow};
`;

export const DetailsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const DetailItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const DetailLabel = styled.span`
  font-size: ${({ theme }) => theme.textSize.small};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const DetailValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: ${({ theme }) => theme.textSize.medium};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  word-break: break-all;
`;

// =============================================================================
// TABS CONTAINER STYLES
// =============================================================================

export const TabsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: ${({ theme }) => theme.boxShadow.xl}
    ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  overflow: hidden;

  /* Mobile dropdown styling */
  @media screen and (max-width: 767px) {
    > div:first-child {
      padding: 16px 24px;
      border-bottom: 1px solid ${({ theme }) => theme.colors.border};
    }
  }
`;

export const TabsList = styled.div`
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background-color: ${({ theme }) => theme.colors.landingBackground};

  @media screen and (max-width: 768px) {
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }
`;

export const TabButton = styled.button<{ $isActive: boolean }>`
  flex: 1;
  padding: 16px 24px;
  background: none;
  border: none;
  color: ${({ theme, $isActive }) =>
    $isActive ? theme.colors.textPink : theme.colors.textSecondary};
  font-size: ${({ theme }) => theme.textSize.medium};
  font-weight: ${({ $isActive }) => ($isActive ? '600' : '500')};
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 3px solid
    ${({ theme, $isActive }) =>
      $isActive ? theme.colors.textPink : 'transparent'};
  white-space: nowrap;

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
    background-color: ${({ theme }) => theme.colors.hoverBackground};
  }

  @media screen and (max-width: 768px) {
    min-width: 200px;
    padding: 12px 16px;
  }
`;

export const TabContent = styled.div`
  padding: 24px;

  @media screen and (max-width: 768px) {
    padding: 16px;
  }
`;

// =============================================================================
// TAB SECTION STYLES
// =============================================================================

export const TabSection = styled.section`
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: ${({ theme }) => theme.boxShadow.medium}
    ${({ theme }) => theme.colors.shadow};

  &:last-child {
    margin-bottom: 0;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
    align-items: flex-start;
  }
`;

export const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const SectionContent = styled.div`
  /* Content styles */
`;

export const DataList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  &.two-column {
    @media screen and (min-width: 900px) {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      align-items: stretch;
    }

    @media screen and (min-width: 1200px) {
      gap: 20px;
    }
  }
`;

export const DataItem = styled.div`
  display: flex;
  flex-direction: column;
  padding: 16px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  height: 100%;
  min-height: 100px;

  @media screen and (max-width: 900px) {
    height: fit-content;
    min-height: auto;
  }
`;

export const DataLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
`;

export const DataValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-wrap: break-word;
  overflow-wrap: break-word;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

export const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.hoverBackground};
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.textDisabled};
    color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

export const AddButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 16px;
  min-width: 96px;
  border-radius: 100px;
  border: 1px solid ${({ theme }) => theme.colors.textPink};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPink};
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all ${({ theme }) => theme.transition.normal};

  &:hover:enabled {
    background: ${({ theme }) =>
      theme.mode === 'light' ? '#f2efff' : theme.colors.lightAccent};
  }

  &:active {
    background: ${({ theme }) =>
      theme.mode === 'light' ? '#dcd3ff' : theme.colors.hoverBackground};
  }

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
    background: none;
    border-color: ${({ theme }) => theme.colors.textDisabled};
    cursor: not-allowed;
  }

  @media screen and (max-width: 768px) {
    width: 100%;
    justify-content: center;
  }
`;

// =============================================================================
// PERMISSION GROUPS SPECIFIC STYLES
// =============================================================================

export const GroupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

export const GroupTitleSection = styled.div`
  flex: 1;
`;

export const GroupTitle = styled(DataValue)`
  text-transform: capitalize;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

export const GroupActions = styled.div`
  display: flex;
  gap: 4px;
  margin-left: 8px;
`;

export const GroupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const PermissionsContainer = styled.div`
  max-height: 120px;
  overflow-y: auto;
  font-size: 12px;
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
`;

export const PermissionItem = styled.div`
  margin-bottom: 2px;
  display: flex;
  align-items: flex-start;
  gap: 4px;
  word-break: break-word;
`;

export const PermissionIcon = styled.span`
  font-size: 10px;
  flex-shrink: 0;
  margin-top: 1px;
`;

export const PermissionText = styled.span`
  word-break: break-word;
  overflow-wrap: break-word;
`;

export const AgentValue = styled(DataValue)`
  margin-bottom: 12px;
`;

export const PermissionValue = styled(DataValue)`
  margin-bottom: 8px;
  max-width: 100%;
  overflow: hidden;
`;

// =============================================================================
// RESPONSIVE ROW LAYOUT STYLES
// =============================================================================

export const InlineRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
  gap: 12px;

  &:last-child {
    margin-bottom: 0;
  }

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const InlineLabel = styled.div`
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 120px;
  flex-shrink: 0;

  @media screen and (max-width: 768px) {
    min-width: auto;
  }
`;

export const InlineValue = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textPrimary};
  word-break: break-word;
  overflow-wrap: break-word;
  min-width: 160px;
  flex: 1;

  a {
    color: ${({ theme }) => theme.colors.textPink};
    text-decoration: none;
    word-break: break-word;
    overflow-wrap: break-word;

    &:hover {
      text-decoration: underline;
    }
  }
`;

export const CollectionKeyBadge = styled.span`
  padding: 2px 8px;
  font-size: 10px;
  border: 1px solid ${({ theme }) => theme.colors.textPink};
  background: ${({ theme }) => theme.colors.cardBackground};
  color: ${({ theme }) => theme.colors.textPink};
  border-radius: 100px;
`;

// =============================================================================

export const InfoText = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 16px;
  font-style: italic;
  line-height: 1.4;
`;

// =============================================================================
// COMPLIANCE RULES SPECIFIC STYLES
// =============================================================================

export const GridDataList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 16px;
  margin-top: 16px;

  @media screen and (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ConditionCard = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background-color: ${({ theme }) => theme.colors.hoverBackground};
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

export const RuleContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const RuleHeader = styled.div`
  margin-top: 12px;
`;

export const ClaimsContainer = styled.div`
  margin-left: 12px;
  margin-bottom: 8px;
`;

export const ClaimItem = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ClaimScope = styled.div`
  margin-left: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const TrustedIssuersContainer = styled.div`
  margin-left: 12px;
`;

export const TrustedIssuerItem = styled.div`
  font-size: 12px;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TrustedIssuerDetails = styled.div`
  margin-left: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const ConditionText = styled.div`
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const InlineWithCopy = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 4px;
`;

export const ClaimsHeader = styled.div`
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TrustedIssuersHeader = styled.div`
  font-size: 12px;
  font-weight: bold;
  margin-bottom: 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

interface ComplianceStatusProps {
  $status: 'active' | 'paused';
}

export const ComplianceStatus = styled.div<ComplianceStatusProps>`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  background-color: ${({ theme, $status }) => {
    if ($status === 'active') {
      return theme.mode === 'light' ? '#d4edda' : `${theme.colors.success}20`;
    }
    return theme.mode === 'light' ? '#fff3cd' : `${theme.colors.warning}20`;
  }};
  color: ${({ theme, $status }) => {
    if ($status === 'active') {
      return theme.mode === 'light' ? '#155724' : theme.colors.success;
    }
    return theme.mode === 'light' ? '#856404' : theme.colors.warning;
  }};
  border: 1px solid
    ${({ theme, $status }) => {
      if ($status === 'active') {
        return theme.mode === 'light' ? '#c3e6cb' : `${theme.colors.success}40`;
      }
      return theme.mode === 'light' ? '#ffeaa7' : `${theme.colors.warning}40`;
    }};
`;

export const ButtonsContainer = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  gap: 8px;
`;

export const HeaderButtons = styled.div`
  display: flex;
  gap: 12px;
`;

export const ConditionsContainer = styled.div`
  margin-top: 8px;
`;

// =============================================================================
// REQUIRED MEDIATORS STYLES
// =============================================================================

export const MediatorItem = styled.div<{ $isLast?: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;
  border-bottom: ${({ $isLast, theme }) =>
    $isLast ? 'none' : `1px solid ${theme.colors.border}`};
`;

export const MediatorContainer = styled.div`
  // margin-top: 8px;
`;

// =============================================================================
// MODAL STYLES
// =============================================================================

export const ModalContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

export const ModalContent = styled.div`
  p {
    color: ${({ theme }) => theme.colors.textSecondary};
    margin-bottom: 24px;
    line-height: 1.5;
  }
`;

export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;

  @media screen and (max-width: 768px) {
    flex-direction: column-reverse;
  }
`;

export const ModalActionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
  margin-top: 16px;
  overflow-y: auto;

  @media screen and (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }
`;

export const ModalActionButton = styled(Button)`
  justify-content: flex-start;
  text-align: left;
`;

// =============================================================================
// MODAL FORM ELEMENTS
// =============================================================================

export const FieldActionButton = styled.button.attrs({
  type: 'button', // Always set type to button
})`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 40px;
  padding: 0 12px;
  min-width: 60px;
  border-radius: 100px;
  border: 1px solid transparent;
  font-size: 14px;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.pinkBackground};
  background: ${({ theme }) => theme.colors.textPink};
  box-shadow: ${({ theme }) => theme.boxShadow.large}
    ${({ theme }) => theme.colors.shadow};

  &:hover:enabled {
    background: ${({ theme }) => theme.colors.pinkBackground};
    color: ${({ theme }) => theme.colors.textPink};
  }

  &:active:enabled {
    box-shadow: ${({ theme }) => theme.boxShadow.medium} transparent;
  }

  &:disabled {
    border: 1px solid ${({ theme }) => theme.colors.textDisabled};
    background: transparent;
    color: ${({ theme }) => theme.colors.textDisabled};
    box-shadow: 0px 12px 24px transparent;
    cursor: not-allowed;
  }

  transition-property: color, background, box-shadow, border;
  transition-duration: ${({ theme }) => theme.transition.normal};
  transition-timing-function: ease-out;
`;

export const InputInfoNote = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
  align-self: flex-end;
`;

export const ErrorMessage = styled.div`
  align-self: flex-end;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.error};
  margin-top: 4px;
`;

export const InfoMessage = styled.div`
  align-self: flex-end;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: 4px;
`;

export const WarningMessage = styled.div`
  align-self: flex-end;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textWarning};
  margin-top: 4px;
  margin-left: 12px;
  margin-right: 12px;
`;

// =============================================================================
// METADATA FILTER STYLES
// =============================================================================

export const FilterContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  padding: 12px 16px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.borderRadius.small};

  @media screen and (max-width: 768px) {
    flex-direction: column;
    gap: 12px;
  }
`;

export const FilterLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  user-select: none;
  transition: color ${({ theme }) => theme.transition.normal};

  &:hover {
    color: ${({ theme }) => theme.colors.textPink};
  }
`;

export const FilterCheckbox = styled.input.attrs({ type: 'checkbox' })`
  cursor: pointer;
  width: 16px;
  height: 16px;
  accent-color: ${({ theme }) =>
    theme.mode === 'dark'
      ? theme.colors.buttonBackground
      : theme.colors.textPink};

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

// =============================================================================
// NFT TRANSFER MODAL STYLES
// =============================================================================

export const NftGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
  overflow-y: auto;
  min-height: 150px;
  max-height: 400px;
`;

export const NftCard = styled.button<{
  $isSelected: boolean;
  $isLocked: boolean;
}>`
  display: flex;
  flex-direction: column;
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? theme.colors.textPink : theme.colors.shadow};
  border-radius: ${({ theme }) => theme.borderRadius.medium};
  padding: 8px;
  cursor: ${({ $isLocked }) => ($isLocked ? 'not-allowed' : 'pointer')};
  opacity: ${({ $isLocked }) => ($isLocked ? 0.5 : 1)};
  background: ${({ theme }) => theme.colors.cardBackground};
  transition: all ${({ theme }) => theme.transition.normal} ease;
  min-height: 140px;

  &:hover:not(:disabled) {
    border-color: ${({ theme }) => theme.colors.textPink};
    box-shadow: 0 2px 8px ${({ theme }) => theme.colors.shadow};
  }
`;

export const NftImage = styled.img`
  width: 100%;
  min-height: 80px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: 4px;
`;

export const NftPlaceholder = styled.div`
  width: 100%;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  margin-bottom: 4px;
  font-size: 16px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const NftIdLabel = styled.div<{ $isSelected: boolean }>`
  font-size: 14px;
  font-weight: 600;
  text-align: center;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.textPink : theme.colors.textPrimary};
  margin-top: 4px;
`;

export const NftLockedLabel = styled.div`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-align: center;
`;

// =============================================================================
// PERMISSION GROUP SELECTOR STYLES
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

export const GroupHeaderLeft = styled.div`
  display: flex;
  align-items: center;
`;

export const GroupCheckbox = styled.input.attrs({ type: 'checkbox' })`
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

export const GroupLabel = styled.div`
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ExpandButton = styled.button<{ $isExpanded: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  padding: 4px;
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
    background-color: ${({ theme }) => theme.colors.hoverBackground};
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

export const TransactionCheckbox = styled(GroupCheckbox)`
  margin-right: 8px;
  transform: scale(0.9);
`;

export const TransactionLabel = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  word-break: break-word;
`;
