import {
  ClaimType,
  ConditionTarget,
  ConditionType,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import React from 'react';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';
import { formatDid, splitCamelCase } from '~/helpers/formatters';
import { FormCondition } from '../types';

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

interface ConditionSummaryTextProps {
  condition: FormCondition;
  claimNames?: Record<string, string>;
}

const countryLookup = new Map(
  countryCodes.map(({ code, name }) => [code, name]),
);

export const ConditionSummaryText: React.FC<ConditionSummaryTextProps> = ({
  condition,
  claimNames = {},
}) => {
  const targetLabel = targetLabels[condition.target];
  const typeLabel = conditionTypeLabels[condition.type];

  // Handle IsIdentity condition
  if (condition.type === ConditionType.IsIdentity && condition.identity) {
    return (
      <>
        <strong>{targetLabel}</strong> {typeLabel}{' '}
        {formatDid(condition.identity, 8, 8)}
      </>
    );
  }

  // Handle IsExternalAgent condition
  if (condition.type === ConditionType.IsExternalAgent) {
    return (
      <>
        <strong>{targetLabel}</strong> {typeLabel}
      </>
    );
  }

  // Handle claim-based conditions
  const claims = condition.claims || [];
  if (claims.length === 0) {
    return (
      <>
        <strong>{targetLabel}</strong> {typeLabel} <em>(no claims)</em>
      </>
    );
  }

  const claimTexts = claims.map((claim) => {
    let claimText = '';

    if (claim.type === ClaimType.Jurisdiction && claim.code) {
      const countryName = countryLookup.get(claim.code.toUpperCase());
      claimText = `${splitCamelCase(claim.type)} - ${countryName || claim.code}`;
    } else if (claim.type === ClaimType.Custom && claim.customClaimTypeId) {
      const claimId = claim.customClaimTypeId.toString();
      const claimName =
        claimNames[claimId] || claim.customClaimName || 'Unknown';
      claimText = `Custom (${claimName})`;
    } else {
      claimText = splitCamelCase(claim.type);
    }

    if (claim.scope) {
      const scopeValue =
        claim.scope.type === ScopeType.Identity ||
        claim.scope.type === ScopeType.Asset
          ? formatDid(claim.scope.value, 6, 6)
          : claim.scope.value;
      claimText += ` [${claim.scope.type}: ${scopeValue}]`;
    }

    return claimText;
  });

  const claimsDisplay =
    claimTexts.length > 2
      ? `${claimTexts.slice(0, 2).join(', ')}, +${claimTexts.length - 2} more`
      : claimTexts.join(', ');

  return (
    <>
      <strong>{targetLabel}</strong> {typeLabel}: {claimsDisplay}
    </>
  );
};
