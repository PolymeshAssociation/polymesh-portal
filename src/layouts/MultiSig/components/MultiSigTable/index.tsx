import { useState } from 'react';
import { Table, Modal } from '~/components';
import { useWindowWidth } from '~/hooks/utility';
import { Heading, Button } from '~/components/UiKit';
import { IMultiSigListItem } from '../../types';
import { ListItemDetails } from '../MultiSigItem';
import { useMultiSigTable } from './hooks';
import { IHistoricalMultiSigProposals } from './constants';
import { StyledTableWrapper, StyledButtonsWrapper } from './styles';

export const MultiSigTable = () => {
  const [selectedProposal, setSelectedProposal] =
    useState<IMultiSigListItem | null>(null);

  const { tableLoading, table, totalItems, getProposalById } =
    useMultiSigTable();
  const { isMobile } = useWindowWidth();

  const handleRowClick = (row: IHistoricalMultiSigProposals) => {
    const currentItem = getProposalById(row.id.proposalId);
    setSelectedProposal(currentItem);
  };

  return (
    <StyledTableWrapper>
      <Table
        data={{ table }}
        loading={tableLoading}
        totalItems={totalItems}
        handleRowClick={handleRowClick}
      />
      {selectedProposal && (
        <Modal customWidth="90%" handleClose={() => setSelectedProposal(null)}>
          <Heading type="h4" marginBottom={24}>
            Transactions Details
          </Heading>
          <ListItemDetails
            item={selectedProposal}
            detailsExpanded
            showStatus
            isHistorical
          />
          {!isMobile && (
            <StyledButtonsWrapper>
              <Button
                variant="modalSecondary"
                marginTop={40}
                onClick={() => setSelectedProposal(null)}
              >
                Close
              </Button>
            </StyledButtonsWrapper>
          )}
        </Modal>
      )}
    </StyledTableWrapper>
  );
};
