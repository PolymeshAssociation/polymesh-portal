import React, { useState } from 'react';
import { Icon, CopyToClipboard } from '~/components';
import { formatUuid } from '~/helpers/formatters';
import { AddMediatorModal } from '../modals';
import { useAssetActionsContext } from '../../context';
import type { TabProps, RequiredMediator } from '../../types';
import {
  TabSection,
  SectionHeader,
  SectionTitle,
  SectionContent,
  DataList,
  DataItem,
  DataLabel,
  ActionButton,
  EmptyState,
  AddButton,
  MediatorItem,
  MediatorContainer,
  DetailValue,
} from '../../styles';

interface RequiredMediatorsSectionProps {
  asset: TabProps['asset'];
}

export const RequiredMediatorsSection: React.FC<
  RequiredMediatorsSectionProps
> = ({ asset }) => {
  const [addMediatorModalOpen, setAddMediatorModalOpen] = useState(false);
  const { removeRequiredMediators, transactionInProcess } =
    useAssetActionsContext();

  const handleManageMediators = () => {
    setAddMediatorModalOpen(true);
  };

  const handleDeleteMediator = async (mediatorId: string) => {
    await removeRequiredMediators({
      mediators: [mediatorId],
    });
  };

  const requiredMediators: RequiredMediator[] =
    asset?.details?.requiredMediators?.map((mediatorDid) => ({
      id: mediatorDid,
    })) || [];

  return (
    <>
      <TabSection>
        <SectionHeader>
          <SectionTitle>Required Mediators</SectionTitle>
          <AddButton
            onClick={handleManageMediators}
            disabled={transactionInProcess}
          >
            <Icon name="Plus" size="16px" />
            Add Mediator
          </AddButton>
        </SectionHeader>
        <SectionContent>
          {requiredMediators.length > 0 ? (
            <DataList>
              <DataItem>
                <div>
                  <DataLabel>Required Mediators</DataLabel>
                  <MediatorContainer>
                    {requiredMediators.map((mediator, index) => (
                      <MediatorItem
                        key={mediator.id}
                        $isLast={index === requiredMediators.length - 1}
                      >
                        <DetailValue>
                          {formatUuid(mediator.id)}
                          <CopyToClipboard value={mediator.id} />
                        </DetailValue>
                        <ActionButton
                          onClick={() => handleDeleteMediator(mediator.id)}
                          disabled={transactionInProcess}
                        >
                          <Icon name="Delete" size="14px" />
                        </ActionButton>
                      </MediatorItem>
                    ))}
                  </MediatorContainer>
                </div>
              </DataItem>
            </DataList>
          ) : (
            <EmptyState>
              No required mediators. All transfers can proceed without
              mediation.
            </EmptyState>
          )}
        </SectionContent>
      </TabSection>

      <AddMediatorModal
        isOpen={addMediatorModalOpen}
        onClose={() => setAddMediatorModalOpen(false)}
      />
    </>
  );
};
