import React, { useState } from 'react';
import { Icon, CopyToClipboard, ConfirmationModal } from '~/components';
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
  const [mediatorToDelete, setMediatorToDelete] = useState<string | null>(null);
  const { removeRequiredMediators, transactionInProcess } =
    useAssetActionsContext();

  const handleManageMediators = () => {
    setAddMediatorModalOpen(true);
  };

  const handleDeleteMediator = (mediatorId: string) => {
    setMediatorToDelete(mediatorId);
  };

  const confirmDeleteMediator = async () => {
    if (mediatorToDelete) {
      await removeRequiredMediators({
        mediators: [mediatorToDelete],
      });
      setMediatorToDelete(null);
    }
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

      <ConfirmationModal
        isOpen={!!mediatorToDelete}
        onClose={() => {
          setMediatorToDelete(null);
        }}
        onConfirm={confirmDeleteMediator}
        title="Remove Required Mediator"
        message={`Are you sure you want to remove DID ${mediatorToDelete ? formatUuid(mediatorToDelete) : ''} from the required mediators for this asset?`}
        confirmLabel="Remove"
        cancelLabel="Cancel"
        isProcessing={transactionInProcess}
      />
    </>
  );
};
