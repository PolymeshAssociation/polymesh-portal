import React from 'react';
import type { TabProps } from '../../types';
import {
  SecurityIdentifiersSection,
  AssetAgentsSection,
  PermissionGroupsSection,
  NftCollectionKeysSection,
} from '../sections';

export const DetailsIdentityTab: React.FC<TabProps> = ({ asset }) => {
  return (
    <>
      <NftCollectionKeysSection asset={asset} />
      <SecurityIdentifiersSection asset={asset} />
      <AssetAgentsSection asset={asset} />
      <PermissionGroupsSection asset={asset} />
    </>
  );
};
