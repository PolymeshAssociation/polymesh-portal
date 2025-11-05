import {
  Claim,
  ClaimType,
  Condition,
  ConditionTarget,
  ConditionType,
  Requirement,
  ScopeType,
  TrustedFor,
} from '@polymeshassociation/polymesh-sdk/types';
import React, { useCallback, useMemo, useState } from 'react';
import { ConfirmationModal, CopyToClipboard, Icon } from '~/components';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { useAssetActionsContext } from '../../context';
import {
  ActionButton,
  AddButton,
  ButtonsContainer,
  ClaimItem,
  ClaimsContainer,
  ClaimScope,
  ClaimsHeader,
  ComplianceStatus,
  ConditionCard,
  ConditionsContainer,
  ConditionText,
  DataItem,
  DataLabel,
  EmptyState,
  GridDataList,
  HeaderButtons,
  InlineWithCopy,
  RuleContainer,
  RuleHeader,
  SectionContent,
  SectionHeader,
  SectionTitle,
  TabSection,
  TrustedIssuerDetails,
  TrustedIssuerItem,
  TrustedIssuersContainer,
  TrustedIssuersHeader,
} from '../../styles';
import type { TabProps } from '../../types';
import { AddComplianceRuleModal, EditComplianceRuleModal } from '../modals';

interface ComplianceRulesSectionProps {
  asset: TabProps['asset'];
}

interface ParsedComplianceRule {
  id: string;
  groupedConditions: GroupedCondition[];
}

interface GroupedCondition {
  type: 'single' | 'grouped';
  target: ConditionTarget;
  displayText: string;
  conditions: ParsedCondition[];
  claims?: ParsedClaim[];
  identity?: string;
  trustedClaimIssuers?: Array<{
    identity: string;
    trustedFor: TrustedFor[] | null;
  }>;
}

interface ParsedCondition {
  type: ConditionType;
  target: ConditionTarget;
  displayText: string;
  claims?: ParsedClaim[];
  identity?: string;
  trustedClaimIssuers?: Array<{
    identity: string;
    trustedFor: TrustedFor[] | null;
  }>;
}

interface ParsedClaim {
  type: ClaimType;
  displayText: string;
  scope?: {
    type: ScopeType;
    value: string;
    displayText: string;
  };
  customClaimId?: string;
  jurisdictionCode?: string;
}

const targetLabels = {
  [ConditionTarget.Both]: 'Sender and Receiver',
  [ConditionTarget.Sender]: 'Sender',
  [ConditionTarget.Receiver]: 'Receiver',
};

const conditionTypeLabels = {
  [ConditionType.IsPresent]: 'has all of',
  [ConditionType.IsAbsent]: 'does not have',
  [ConditionType.IsAnyOf]: 'has any of',
  [ConditionType.IsNoneOf]: 'does not have any of',
  [ConditionType.IsExternalAgent]: 'is an Agent of the Asset',
  [ConditionType.IsIdentity]: 'is Identity',
};

export const ComplianceRulesSection: React.FC<ComplianceRulesSectionProps> = ({
  asset,
}) => {
  const [addRuleModalOpen, setAddRuleModalOpen] = useState(false);
  const [editRuleModalOpen, setEditRuleModalOpen] = useState(false);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [pauseConfirmModalOpen, setPauseConfirmModalOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState<Requirement | null>(null);

  const {
    pauseCompliance,
    unpauseCompliance,
    addComplianceRule,
    modifyComplianceRule,
    removeComplianceRule,
    transactionInProcess,
  } = useAssetActionsContext();

  const handleAddRule = useCallback(() => {
    setAddRuleModalOpen(true);
  }, []);

  const compliancePaused = useMemo(() => {
    return asset?.details?.compliancePaused ?? false;
  }, [asset?.details?.compliancePaused]);

  const handlePauseCompliance = useCallback(() => {
    setPauseConfirmModalOpen(true);
  }, []);

  const confirmPauseCompliance = useCallback(async () => {
    try {
      if (compliancePaused) {
        await unpauseCompliance();
      } else {
        await pauseCompliance();
      }
      setPauseConfirmModalOpen(false);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error toggling compliance:', error);
    }
  }, [compliancePaused, pauseCompliance, unpauseCompliance]);

  const handleEditRule = useCallback(
    (ruleId: string) => {
      const requirements =
        asset?.details?.complianceRequirements?.requirements || [];
      const rule = requirements.find((r) => r.id.toString() === ruleId);
      if (rule) {
        setSelectedRule(rule);
        setEditRuleModalOpen(true);
      }
    },
    [asset?.details?.complianceRequirements?.requirements],
  );

  const handleDeleteRule = useCallback(
    (ruleId: string) => {
      const requirements =
        asset?.details?.complianceRequirements?.requirements || [];
      const rule = requirements.find((r) => r.id.toString() === ruleId);
      if (rule) {
        setSelectedRule(rule);
        setDeleteConfirmModalOpen(true);
      }
    },
    [asset?.details?.complianceRequirements?.requirements],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (selectedRule) {
      try {
        await removeComplianceRule({
          requirement: selectedRule,
        });
        setDeleteConfirmModalOpen(false);
        setSelectedRule(null);
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error deleting rule:', error);
      }
    }
  }, [selectedRule, removeComplianceRule]);

  const countryLookupMap = useMemo(() => {
    return new Map(countryCodes.map((country) => [country.code, country.name]));
  }, []);

  // Helper function to format claim display text
  const formatClaimDisplayText = useCallback(
    (claim: Claim): ParsedClaim => {
      let displayText = '';
      let scope: ParsedClaim['scope'];

      if (claim.type === ClaimType.Jurisdiction && 'code' in claim) {
        const countryName = countryLookupMap.get(claim.code.toUpperCase());
        displayText = `${splitCamelCase(claim.type)} - ${countryName || claim.code}`;
      } else if (
        claim.type === ClaimType.Custom &&
        'customClaimTypeId' in claim
      ) {
        const claimId = claim.customClaimTypeId.toString();
        displayText = `Custom - ID ${claimId}`;
      } else {
        displayText = splitCamelCase(claim.type);
      }

      if ('scope' in claim && claim.scope) {
        const scopeDisplayValue =
          claim.scope.type === ScopeType.Identity ||
          claim.scope.type === ScopeType.Asset
            ? formatDid(claim.scope.value, 8, 8)
            : claim.scope.value;

        scope = {
          type: claim.scope.type,
          value: claim.scope.value,
          displayText: `${claim.scope.type}: ${scopeDisplayValue}`,
        };
      }

      return {
        type: claim.type,
        displayText,
        scope,
        customClaimId:
          'customClaimTypeId' in claim
            ? claim.customClaimTypeId?.toString()
            : undefined,
        jurisdictionCode: 'code' in claim ? claim.code : undefined,
      };
    },
    [countryLookupMap],
  );

  // Helper function to format condition display text
  const formatConditionDisplayText = useCallback(
    (condition: Condition): ParsedCondition => {
      const baseLabel =
        conditionTypeLabels[condition.type as ConditionType] || condition.type;
      const targetLabel =
        targetLabels[condition.target as ConditionTarget] || condition.target;

      let displayText = `${targetLabel} ${baseLabel}`;
      let parsedClaims: ParsedClaim[] = [];

      if (
        condition.type === ConditionType.IsIdentity &&
        'identity' in condition
      ) {
        displayText = `${targetLabel} ${conditionTypeLabels[ConditionType.IsIdentity]}: ${formatDid(condition.identity.did, 8, 8)}`;
      } else if (condition.type === ConditionType.IsExternalAgent) {
        displayText = `${targetLabel} ${conditionTypeLabels[ConditionType.IsExternalAgent]}`;
      } else if ('claim' in condition && condition.claim) {
        // Single claim condition (IsPresent/IsAbsent)
        parsedClaims = [formatClaimDisplayText(condition.claim)];
      } else if ('claims' in condition && condition.claims?.length > 0) {
        // Multi-claim condition (IsAnyOf/IsNoneOf)
        parsedClaims = condition.claims.map(formatClaimDisplayText);
      }

      return {
        type: condition.type,
        target: condition.target,
        displayText,
        claims: parsedClaims,
        identity: 'identity' in condition ? condition.identity?.did : undefined,
        trustedClaimIssuers:
          'trustedClaimIssuers' in condition
            ? (condition.trustedClaimIssuers || []).map((issuer) => ({
                identity: issuer.identity.did,
                trustedFor: issuer.trustedFor,
              }))
            : [],
      };
    },
    [formatClaimDisplayText],
  );

  // Parse compliance rules from SDK data and group IsPresent conditions
  const complianceRules = useMemo((): ParsedComplianceRule[] => {
    const requirements =
      asset?.details?.complianceRequirements?.requirements || [];

    return requirements.map((rule) => {
      const parsedConditions = rule.conditions.map(formatConditionDisplayText);

      // Group IsPresent conditions by target
      const groupedConditions: GroupedCondition[] = [];
      const isPresentGroups: Record<string, ParsedCondition[]> = {};
      const otherConditions: ParsedCondition[] = [];

      parsedConditions.forEach((condition) => {
        if (condition.type === ConditionType.IsPresent) {
          const key = condition.target;
          if (!isPresentGroups[key]) {
            isPresentGroups[key] = [];
          }
          isPresentGroups[key].push(condition);
        } else {
          otherConditions.push(condition);
        }
      });

      // Create grouped IsPresent conditions
      Object.entries(isPresentGroups).forEach(([target, conditions]) => {
        const targetLabel = targetLabels[target as ConditionTarget] || target;
        const allClaims = conditions.flatMap((c) => c.claims || []);
        const allTrustedIssuers = conditions.flatMap(
          (c) => c.trustedClaimIssuers || [],
        );

        groupedConditions.push({
          type: 'grouped',
          target: target as ConditionTarget,
          displayText: `${targetLabel} has all of`,
          conditions,
          claims: allClaims,
          trustedClaimIssuers: allTrustedIssuers,
        });
      });

      // Add other conditions as single conditions
      otherConditions.forEach((condition) => {
        groupedConditions.push({
          type: 'single',
          target: condition.target,
          displayText: condition.displayText,
          conditions: [condition],
          claims: condition.claims,
          identity: condition.identity,
          trustedClaimIssuers: condition.trustedClaimIssuers,
        });
      });

      return {
        id: rule.id.toString(),
        groupedConditions,
      };
    });
  }, [
    asset?.details?.complianceRequirements?.requirements,
    formatConditionDisplayText,
  ]);

  // Helper functions to generate stable keys for render loops
  const generateConditionKey = useCallback(
    (groupedCondition: GroupedCondition) => {
      return `${groupedCondition.type}-${groupedCondition.target}-${groupedCondition.displayText}`;
    },
    [],
  );

  const generateClaimKey = useCallback((claim: ParsedClaim) => {
    return `${claim.type}-${claim.displayText}-${claim.scope?.value || 'no-scope'}`;
  }, []);

  const renderScopeWithCopy = useCallback((scope: ParsedClaim['scope']) => {
    if (!scope) return null;

    const shouldShowCopy =
      scope.type === ScopeType.Identity || scope.type === ScopeType.Asset;

    return (
      <ClaimScope>
        {shouldShowCopy ? (
          <InlineWithCopy>
            {scope.displayText}
            <CopyToClipboard value={scope.value} />
          </InlineWithCopy>
        ) : (
          scope.displayText
        )}
      </ClaimScope>
    );
  }, []);

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Compliance Rules</SectionTitle>
          <HeaderButtons>
            <AddButton
              onClick={handlePauseCompliance}
              disabled={transactionInProcess}
            >
              <Icon name="ClockIcon" size="16px" />
              {compliancePaused ? 'Resume All Rules' : 'Pause All Rules'}
            </AddButton>
            <AddButton onClick={handleAddRule} disabled={transactionInProcess}>
              <Icon name="Plus" size="16px" />
              Add Rule
            </AddButton>
          </HeaderButtons>
        </SectionHeader>
        <SectionContent>
          {/* Compliance Status Indicator */}
          <ComplianceStatus $status={compliancePaused ? 'paused' : 'active'}>
            <span>
              Compliance rules are currently{' '}
              <strong>{compliancePaused ? 'paused' : 'active'}</strong>
              {compliancePaused &&
                '. All transfers are allowed until rules are resumed.'}
              {!compliancePaused &&
                complianceRules.length > 0 &&
                '. All transfers must comply with at least one rule below.'}
              {!compliancePaused &&
                complianceRules.length === 0 &&
                '. No rules are configured, so all transfers are currently allowed.'}
            </span>
          </ComplianceStatus>
          {complianceRules.length > 0 ? (
            <GridDataList>
              {complianceRules.map((rule) => (
                <DataItem key={rule.id}>
                  <RuleContainer>
                    {/* Edit/Delete buttons in top right corner */}
                    <ButtonsContainer>
                      <ActionButton
                        onClick={() => handleEditRule(rule.id)}
                        title="Edit Rule"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteRule(rule.id)}
                        title="Delete Rule"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </ButtonsContainer>

                    {/* Rule header */}
                    <DataLabel>Rule ID: {rule.id}</DataLabel>

                    {/* Conditions in column layout */}
                    <RuleHeader>
                      <DataLabel>Conditions</DataLabel>
                      <ConditionsContainer>
                        {rule.groupedConditions.map((groupedCondition) => (
                          <ConditionCard
                            key={generateConditionKey(groupedCondition)}
                          >
                            <ConditionText>
                              {groupedCondition.type === 'single' &&
                              groupedCondition.conditions[0].type ===
                                ConditionType.IsIdentity &&
                              groupedCondition.identity ? (
                                <InlineWithCopy>
                                  {groupedCondition.displayText}
                                  <CopyToClipboard
                                    value={groupedCondition.identity}
                                  />
                                </InlineWithCopy>
                              ) : (
                                groupedCondition.displayText
                              )}
                            </ConditionText>

                            {/* Claims */}
                            {groupedCondition.claims &&
                              groupedCondition.claims.length > 0 && (
                                <ClaimsContainer>
                                  <ClaimsHeader>Claims:</ClaimsHeader>
                                  {groupedCondition.claims.map((claim) => (
                                    <ClaimItem key={generateClaimKey(claim)}>
                                      • {claim.displayText}
                                      {claim.scope &&
                                        renderScopeWithCopy(claim.scope)}
                                    </ClaimItem>
                                  ))}
                                </ClaimsContainer>
                              )}

                            {/* Condition-specific trusted claim issuers */}
                            {groupedCondition.trustedClaimIssuers &&
                              groupedCondition.trustedClaimIssuers.length >
                                0 && (
                                <TrustedIssuersContainer>
                                  <TrustedIssuersHeader>
                                    Allowed Condition Claim Issuers:
                                  </TrustedIssuersHeader>
                                  {groupedCondition.trustedClaimIssuers.map(
                                    (issuer) => (
                                      <TrustedIssuerItem key={issuer.identity}>
                                        <div>
                                          <InlineWithCopy>
                                            <span>
                                              <strong>DID:</strong>{' '}
                                              {formatDid(issuer.identity, 8, 8)}
                                            </span>
                                            <CopyToClipboard
                                              value={issuer.identity}
                                            />
                                          </InlineWithCopy>
                                        </div>
                                        <TrustedIssuerDetails>
                                          <strong>Trusted for:</strong>{' '}
                                          {issuer.trustedFor === null
                                            ? 'All claim types'
                                            : issuer.trustedFor
                                                .map((claim: TrustedFor) => {
                                                  if (
                                                    typeof claim === 'object' &&
                                                    'type' in claim
                                                  ) {
                                                    return `Custom ID ${claim.customClaimTypeId.toString()}`;
                                                  }
                                                  return splitCamelCase(claim);
                                                })
                                                .join(', ')}
                                        </TrustedIssuerDetails>
                                      </TrustedIssuerItem>
                                    ),
                                  )}
                                </TrustedIssuersContainer>
                              )}
                          </ConditionCard>
                        ))}
                      </ConditionsContainer>
                    </RuleHeader>
                  </RuleContainer>
                </DataItem>
              ))}
            </GridDataList>
          ) : (
            <EmptyState>
              No compliance rules configured. When no rules are set, all
              transfers are allowed by default. Add rules to restrict transfers
              based on investor claims and identity requirements.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <AddComplianceRuleModal
        isOpen={addRuleModalOpen}
        onClose={() => setAddRuleModalOpen(false)}
        assetId={asset?.assetId || ''}
        onAddRule={addComplianceRule}
        transactionInProcess={transactionInProcess}
      />

      <EditComplianceRuleModal
        isOpen={editRuleModalOpen}
        onClose={() => {
          setEditRuleModalOpen(false);
          setSelectedRule(null);
        }}
        assetId={asset?.assetId || ''}
        ruleToEdit={selectedRule}
        onEditRule={modifyComplianceRule}
        transactionInProcess={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setSelectedRule(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Delete Compliance Rule"
        message={`Are you sure you want to delete the Rule with ID ${selectedRule !== null ? selectedRule.id : ''}? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />

      <ConfirmationModal
        isOpen={pauseConfirmModalOpen}
        onClose={() => setPauseConfirmModalOpen(false)}
        onConfirm={confirmPauseCompliance}
        title={`${compliancePaused ? 'Resume' : 'Pause'} Compliance Rules`}
        message={
          compliancePaused
            ? 'Are you sure you want to resume all compliance rules for this asset? Once resumed, all asset transfers will be required to comply with the configured rules.'
            : 'Are you sure you want to pause all compliance rules for this asset? While paused, asset transfers will NOT be checked against any compliance rules and may proceed without restriction.'
        }
        confirmLabel={compliancePaused ? 'Resume' : 'Pause'}
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
