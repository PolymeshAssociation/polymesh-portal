import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { AssetTabsContainerProps } from '../types';
import { DetailsIdentityTab } from './tabs/DetailsIdentityTab';
import { DocumentsMetadataTab } from './tabs/DocumentsMetadataTab';
import { ComplianceRestrictionsTab } from './tabs/ComplianceRestrictionsTab';
import { TabsContainer, TabsList, TabButton, TabContent } from '../styles';
import { DropdownSelect } from '~/components/UiKit';
import { useWindowWidth } from '~/hooks/utility';

enum TabId {
  DETAILS_IDENTITY = 'details-identity',
  DOCUMENTS_METADATA = 'documents-metadata',
  RULES_RESTRICTIONS = 'rules-restrictions',
}

const tabs = [
  {
    id: TabId.DETAILS_IDENTITY,
    label: 'Details & Identity',
  },
  {
    id: TabId.DOCUMENTS_METADATA,
    label: 'Documents & Metadata',
  },
  {
    id: TabId.RULES_RESTRICTIONS,
    label: 'Rules & Restrictions',
  },
];

export const AssetTabsContainer: React.FC<AssetTabsContainerProps> = ({
  asset,
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isMobile } = useWindowWidth();
  const lastSetTabRef = useRef<TabId | null>(null);

  // Get initial tab from URL or default to first tab
  const getInitialTab = (): TabId => {
    const tabParam = searchParams.get('tab') as TabId;
    if (tabParam && Object.values(TabId).includes(tabParam)) {
      return tabParam;
    }
    return TabId.DETAILS_IDENTITY;
  };

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab);

  // Sync URL with active tab when URL changes (e.g., browser back/forward)
  useEffect(() => {
    const tabParam = searchParams.get('tab') as TabId;
    const validTab =
      tabParam && Object.values(TabId).includes(tabParam)
        ? tabParam
        : TabId.DETAILS_IDENTITY;

    if (validTab !== lastSetTabRef.current) {
      setActiveTab(validTab);
      lastSetTabRef.current = validTab;
    }
  }, [searchParams]);

  const tabOptions = tabs.map((tab) => tab.label);
  const activeTabLabel = tabs.find((tab) => tab.id === activeTab)?.label || '';

  const handleTabChange = (tabId: TabId) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('tab', tabId);
    setSearchParams(newSearchParams, { replace: true });
  };

  const handleDropdownChange = (selectedLabel: string | null) => {
    if (!selectedLabel) return;
    const selectedTab = tabs.find((tab) => tab.label === selectedLabel);
    if (selectedTab) {
      handleTabChange(selectedTab.id);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case TabId.DETAILS_IDENTITY:
        return <DetailsIdentityTab asset={asset} />;
      case TabId.DOCUMENTS_METADATA:
        return <DocumentsMetadataTab asset={asset} />;
      case TabId.RULES_RESTRICTIONS:
        return <ComplianceRestrictionsTab asset={asset} />;
      default:
        return null;
    }
  };

  return (
    <TabsContainer>
      {isMobile ? (
        <DropdownSelect
          placeholder="Select tab"
          options={tabOptions}
          selected={activeTabLabel}
          onChange={handleDropdownChange}
          error={undefined}
        />
      ) : (
        <TabsList>
          {tabs.map((tab) => (
            <TabButton
              key={tab.id}
              $isActive={activeTab === tab.id}
              onClick={() => handleTabChange(tab.id)}
            >
              {tab.label}
            </TabButton>
          ))}
        </TabsList>
      )}
      <TabContent>{renderTabContent()}</TabContent>
    </TabsContainer>
  );
};
