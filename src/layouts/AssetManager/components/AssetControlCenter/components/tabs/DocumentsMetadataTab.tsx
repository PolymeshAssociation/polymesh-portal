import React from 'react';
import type { TabProps } from '../../types';
import { AssetDocumentsSection, AssetMetadataSection } from '../sections';

export const DocumentsMetadataTab: React.FC<TabProps> = ({ asset }) => {
  return (
    <>
      <AssetDocumentsSection asset={asset} />
      <AssetMetadataSection asset={asset} />
    </>
  );
};
