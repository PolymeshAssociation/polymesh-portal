import React from 'react';
import {
  ClaimType,
  ConditionTarget,
  ConditionType,
  ScopeType,
} from '@polymeshassociation/polymesh-sdk/types';
import { FormCondition, FormClaim } from '../types';
import { StyledClaimContainer, StyledClaim } from '../styles';
import { Text } from '~/components/UiKit';
import { splitCamelCase, formatDid } from '~/helpers/formatters';
import { CopyToClipboard } from '~/components';
import countryCodes from '~/constants/iso/ISO_3166-1_countries.json';

interface ViewOnlyConditionProps {
  condition: FormCondition;
}

const getTargetDescription = (target: ConditionTarget): string => {
  switch (target) {
    case ConditionTarget.Both:
      return 'Sender and Receiver';
    case ConditionTarget.Sender:
      return 'Sender';
    case ConditionTarget.Receiver:
      return 'Receiver';
    default:
      return target;
  }
};

const getConditionTypeDescription = (
  type: ConditionType,
  target: ConditionTarget,
): string => {
  switch (type) {
    case ConditionType.IsPresent:
      return target === ConditionTarget.Both
        ? 'have all of these claims'
        : 'has all of   these claims';
    case ConditionType.IsAnyOf:
      return target === ConditionTarget.Both
        ? 'have any of these claims'
        : 'has any of these claims';
    case ConditionType.IsNoneOf:
      return target === ConditionTarget.Both
        ? 'do not have all of these claims'
        : 'does not have any of these claims';
    case ConditionType.IsExternalAgent:
      return target === ConditionTarget.Both
        ? 'are Agents of the Asset'
        : 'is an Agent of the Asset';
    case ConditionType.IsIdentity:
      return target === ConditionTarget.Both ? 'are Identity' : 'is Identity';
    default:
      return type;
  }
};

const ViewOnlyCondition: React.FC<ViewOnlyConditionProps> = ({ condition }) => {
  const targetDescription = getTargetDescription(condition.target);
  const typeDescription = getConditionTypeDescription(
    condition.type,
    condition.target,
  );

  const renderDescription = () => {
    if (condition.type === ConditionType.IsIdentity && condition.identity) {
      return (
        <Text>
          Asset {targetDescription} {typeDescription}{' '}
          <span style={{ display: 'inline-flex', alignItems: 'center' }}>
            {formatDid(condition.identity, 8, 8)}
            <span style={{ marginLeft: '4px' }}>
              <CopyToClipboard value={condition.identity} />
            </span>
          </span>
        </Text>
      );
    }

    if (condition.type === ConditionType.IsExternalAgent) {
      return (
        <Text>
          Asset {targetDescription} {typeDescription}
        </Text>
      );
    }

    return (
      <Text>
        Asset {targetDescription} {typeDescription}:
      </Text>
    );
  };

  const renderClaimChips = () => {
    if (!condition.claims?.length) return null;

    return (
      <StyledClaimContainer>
        {condition.claims.map((claim: FormClaim) => {
          let mainLabel = '';
          let subLabel: React.ReactNode = '';

          if (claim.type === ClaimType.Jurisdiction && claim.code) {
            const country = countryCodes.find((c) => c.code === claim.code);
            mainLabel = `${splitCamelCase(claim.type)} - ${country?.name || claim.code}`;
          } else if (
            claim.type === ClaimType.Custom &&
            claim.customClaimTypeId
          ) {
            const claimId = claim.customClaimTypeId.toString();
            mainLabel = `Custom - ID ${claimId}, ${claim.customClaimName || 'Unknown'}`;
          } else {
            mainLabel = splitCamelCase(claim.type);
          }

          if (claim.scope) {
            const value =
              claim.scope.type === ScopeType.Identity ||
              claim.scope.type === ScopeType.Asset
                ? formatDid(claim.scope.value, 8, 8)
                : claim.scope.value;
            const showCopy =
              claim.scope.type === ScopeType.Identity ||
              claim.scope.type === ScopeType.Asset;
            subLabel = (
              <>
                Scope: {claim.scope.type} -{' '}
                <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {value}
                  {showCopy && (
                    <span style={{ marginLeft: '4px' }}>
                      <CopyToClipboard value={claim.scope.value} />
                    </span>
                  )}
                </span>
              </>
            );
          } else if (claim.type === ClaimType.Custom) {
            subLabel = 'Scope: No Scope';
          }

          return (
            <StyledClaim
              key={`${claim.type}-${claim.code || ''}-${claim.customClaimTypeId?.toString() || ''}`}
            >
              <div>
                <Text bold>{mainLabel}</Text>
                {subLabel && <div>{subLabel}</div>}
              </div>
            </StyledClaim>
          );
        })}
      </StyledClaimContainer>
    );
  };

  return (
    <div>
      {renderDescription()}
      {renderClaimChips()}
    </div>
  );
};

export default ViewOnlyCondition;
