import type {
  AgentTxGroup,
  TxTag,
} from '@polymeshassociation/polymesh-sdk/types';
import { AGENT_TX_GROUP_VALUES } from '@polymeshassociation/polymesh-sdk/types';
import { txGroupToTxTags } from '@polymeshassociation/polymesh-sdk/utils';
import * as yup from 'yup';

// Human-readable labels for agent transaction groups
export const AGENT_TX_GROUP_LABELS: Record<AgentTxGroup, string> = {
  AdvancedAssetManagement: 'Advanced Asset Management',
  AssetDocumentManagement: 'Asset Document Management',
  AssetManagement: 'Asset Management',
  AssetMetadataManagement: 'Asset Metadata Management',
  CapitalDistribution: 'Capital Distribution',
  CheckpointManagement: 'Checkpoint Management',
  ComplianceManagement: 'Compliance Management',
  CorporateActionsManagement: 'Corporate Actions Management',
  CorporateBallotManagement: 'Corporate Ballot Management',
  ExternalAgentManagement: 'External Agent Management',
  Issuance: 'Issuance',
  Redemption: 'Redemption',
  StoManagement: 'STO Management',
  TrustedClaimIssuersManagement: 'Trusted Claim Issuers Management',
};

// Shared form interface for permission group modals
export interface IPermissionGroupForm {
  selectedGroups: AgentTxGroup[];
  selectedTransactions: Record<AgentTxGroup, string[]>;
}

// Shared validation schema for permission group transactions
export const permissionGroupTransactionSchema = yup.object({
  selectedTransactions: yup
    .object()
    .test(
      'has-transactions',
      'At least one transaction must be selected',
      function hasTransactions(value) {
        if (!value) return false;
        const totalTransactions = Object.values(value)
          .flat()
          .filter(Boolean).length;
        return totalTransactions > 0;
      },
    )
    .required('Transaction selection is required'),
});

/**
 * Creates a reverse lookup map for efficient transaction-to-group mapping.
 *
 * @returns Map where key is transaction tag and value is the agent group it belongs to
 */
export function createTransactionToGroupMap(): Map<TxTag, AgentTxGroup> {
  const transactionToGroupMap = new Map<TxTag, AgentTxGroup>();
  AGENT_TX_GROUP_VALUES.forEach((group) => {
    const transactions = txGroupToTxTags(group) || [];
    transactions.forEach((txTag) => {
      transactionToGroupMap.set(txTag, group);
    });
  });
  return transactionToGroupMap;
}
