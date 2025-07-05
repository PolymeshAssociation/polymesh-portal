import React, { useState } from 'react';
import {
  ConditionType,
  ConditionTarget,
  ClaimType,
  ScopeType,
  Condition,
  Claim,
} from '@polymeshassociation/polymesh-sdk/types';
import { Icon, CopyToClipboard } from '~/components';
import { useAssetActionsContext } from '../../context';
import type { TabProps } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataItem,
  DataLabel,
  ActionButton,
  EmptyState,
  AddButton,
  GridDataList,
  ConditionCard,
  RuleContainer,
  RuleHeader,
  ClaimsContainer,
  ClaimItem,
  ClaimScope,
  TrustedIssuersContainer,
  TrustedIssuerItem,
  TrustedIssuerDetails,
  ConditionText,
  InlineWithCopy,
  ClaimsHeader,
  TrustedIssuersHeader,
  ComplianceStatus,
  ButtonsContainer,
  HeaderButtons,
  ConditionsContainer,
} from '../../styles';
import { splitCamelCase, formatDid } from '~/helpers/formatters';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { ComingSoonModal } from '../modals';

interface ComplianceRulesSectionProps {
  asset: TabProps['asset'];
}

interface ParsedComplianceRule {
  id: string;
  ruleIndex: number;
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
    trustedFor: ClaimType[] | null;
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
    trustedFor: ClaimType[] | null;
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
  const [comingSoonModalOpen, setComingSoonModalOpen] = useState(false);
  const [comingSoonFeature, setComingSoonFeature] = useState('');

  const { pauseCompliance, unpauseCompliance, transactionInProcess } =
    useAssetActionsContext();

  const handleManageComplianceRules = () => {
    setComingSoonFeature('add compliance rule');
    setComingSoonModalOpen(true);
  };

  const handlePauseCompliance = async () => {
    const compliancePaused = asset?.details?.compliancePaused ?? false;

    try {
      if (compliancePaused) {
        await unpauseCompliance();
      } else {
        await pauseCompliance();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error toggling compliance:', error);
    }
  };

  const handleEditRule = (ruleIndex: number) => {
    setComingSoonFeature('edit compliance rule');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Edit rule:', ruleIndex);
  };

  const handleDeleteRule = (ruleIndex: number) => {
    setComingSoonFeature('delete compliance rule');
    setComingSoonModalOpen(true);
    // eslint-disable-next-line no-console
    console.log('Delete rule:', ruleIndex);
  };

  // Helper function to format claim display text
  const formatClaimDisplayText = (claim: Claim): ParsedClaim => {
    let displayText = '';
    let scope: ParsedClaim['scope'];

    if (claim.type === ClaimType.Jurisdiction && 'code' in claim) {
      const country = countryCodes.find(
        (c: { code: string; name: string }) =>
          c.code === claim.code.toUpperCase(),
      );
      displayText = `${splitCamelCase(claim.type)} - ${country?.name || claim.code}`;
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
  };

  // Helper function to format condition display text
  const formatConditionDisplayText = (
    condition: Condition,
  ): ParsedCondition => {
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
  };

  // Parse compliance rules from SDK data and group IsPresent conditions
  const parseComplianceRules = (): ParsedComplianceRule[] => {
    const requirements =
      asset?.details?.complianceRequirements?.requirements || [];

    return requirements.map((rule, index) => {
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
        id: `rule-${index}`,
        ruleIndex: index,
        groupedConditions,
      };
    });
  };

  const renderScopeWithCopy = (scope: ParsedClaim['scope']) => {
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
  };

  const complianceRules = parseComplianceRules();
  const compliancePaused = asset?.details?.compliancePaused ?? false;

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
            <AddButton
              onClick={handleManageComplianceRules}
              disabled={transactionInProcess}
            >
              <Icon name="Plus" size="16px" />
              Add Rules
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
                        onClick={() => handleEditRule(rule.ruleIndex)}
                        title="Edit Rule"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Edit" size="14px" />
                      </ActionButton>
                      <ActionButton
                        onClick={() => handleDeleteRule(rule.ruleIndex)}
                        title="Delete Rule"
                        disabled={transactionInProcess}
                      >
                        <Icon name="Delete" size="14px" />
                      </ActionButton>
                    </ButtonsContainer>

                    {/* Rule header */}
                    <DataLabel>Rule #{rule.ruleIndex + 1}</DataLabel>

                    {/* Conditions in column layout */}
                    <RuleHeader>
                      <DataLabel>Conditions</DataLabel>
                      <ConditionsContainer>
                        {rule.groupedConditions.map((groupedCondition) => (
                          <ConditionCard
                            key={`${groupedCondition.type}-${groupedCondition.target}-${groupedCondition.displayText}`}
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
                                    <ClaimItem
                                      key={`${claim.type}-${claim.displayText}-${claim.scope?.value || 'no-scope'}`}
                                    >
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
                                                .map(splitCamelCase)
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

      <ComingSoonModal
        isOpen={comingSoonModalOpen}
        onClose={() => setComingSoonModalOpen(false)}
        feature={comingSoonFeature}
      />
    </>
  );
};
