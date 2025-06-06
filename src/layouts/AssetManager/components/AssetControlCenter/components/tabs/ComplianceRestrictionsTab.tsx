import React from 'react';
import type { TabProps } from '../../types';
import {
  ComplianceRulesSection,
  TrustedClaimIssuersSection,
  VenueFilteringSection,
  RequiredMediatorsSection,
  TrackedStatsSection,
  TransferRestrictionsSection,
} from '../sections';

export const ComplianceRestrictionsTab: React.FC<TabProps> = ({ asset }) => {
  return (
    <>
      <ComplianceRulesSection asset={asset} />
      <TrustedClaimIssuersSection asset={asset} />
      <VenueFilteringSection asset={asset} />
      <RequiredMediatorsSection asset={asset} />
      <TrackedStatsSection asset={asset} />
      <TransferRestrictionsSection asset={asset} />
    </>
  );
};
